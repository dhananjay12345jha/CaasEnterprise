import middy from "@middy/core";
import { Handler } from "aws-lambda";
import { strict as assert } from "assert";
import { Cart, Order, Transaction, Payment } from "@commercetools/platform-sdk";
import {
  getCart,
  createOrderFromCart,
  getAdyenHmacKey,
  updateTransactionAsAuthorised,
  addCustomFieldsToCTCart,
  updateTransactionAsFailed,
  getCTPaymentById,
  updateTransactionInteractionId,
} from "@ei-services/services";
import {
  z,
  orderEventSchema,
  newRelic,
  eventValidator,
  AdyenWebhookRequestItem,
} from "@ei-services/common/middleware";
import { generateCartHash } from "@ei-services/commerce-tools";
import { hmacValidator as AdyenHmacValidator } from "@adyen/api-library";
import { NotificationRequestItem } from "@adyen/api-library/lib/src/typings/notification/models";
import { logger } from "./singletons";

const hmacValidator = new AdyenHmacValidator();

export type HandlerEvent = z.infer<typeof orderEventSchema>;

const handler: Handler = async (event: HandlerEvent) => {
  // Event not fully logged until a log framework that redacts PII is in place (tracked in WCAAS-3202)
  console.log("Event received: ", event.id);

  const {
    payload: { notificationItems },
    metadata: { "x-emc-ubid": brandId },
  } = event.detail;

  const [notification] = notificationItems;

  assert.ok(notification, "Expected notification to be defined");

  const notificationItem =
    notification.NotificationRequestItem as AdyenWebhookRequestItem;

  const hmacKey = await getAdyenHmacKey(brandId);
  if (
    !hmacValidator.validateHMAC(
      notificationItem as unknown as NotificationRequestItem,
      hmacKey
    )
  ) {
    const error = "HMAC did not match for this webhook event";
    throw new Error(error);
  }

  if (notificationItem.eventCode !== "AUTHORISATION") {
    const error = `We need an 'AUTHORISATION' event type to convert the cart to an order. Received: '${notificationItem.eventCode}' event type, so we are ignoring this.`;
    throw new Error(error);
  }

  // Validator wrapper ensures metadata cartId is always presetn
  const cart = (await getCart({
    cartId: notificationItem.additionalData["metadata.cartId"],
    brandId,
  })) as Cart;

  if (!cart.paymentInfo || cart.paymentInfo.payments.length === 0) {
    throw Error(
      "No previous payments sessions on this cart - payment session hasn't been initliased and added to cart"
    );
  }

  const adyenSessionId = notificationItem.additionalData.checkoutSessionId;
  if (adyenSessionId)
    logger.info(`Checkout session id received: ${adyenSessionId}`);
  const payments = cart.paymentInfo.payments;

  // Fetch payment objects so their transactions are available to be parsed
  const paymentObjects = await Promise.all(
    payments.map((n) => getCTPaymentById(brandId, n.id))
  );

  /**
   * "continue"s are used in this loop as there may be mulitple incomplete payments that we need to check for
   * using "contiue" because they may be mal-formed, incomplte or in the wrong state - but that shouldn't
   * prevent us for checking up on, and updating a relevant transaction that may be pending
   */
  let paymentToUpdate: Payment | undefined;
  let transactionId: string | undefined;

  for (let i = 0; i < paymentObjects.length; i++) {
    const paymentObj = paymentObjects[i].body;

    let validTransactions: Transaction[] = [];
    if (paymentObj.transactions) {
      validTransactions = paymentObj.transactions?.filter(
        (n) => n.interactionId === adyenSessionId
      );
    }

    if (validTransactions.length == 0) {
      continue;
    }

    const initTransaction = validTransactions.find(
      (n) => n.state === "Initial"
    );
    if (!initTransaction) {
      continue;
    }

    paymentToUpdate = paymentObj;
    transactionId = initTransaction.id;
  }

  // If after going through all payments and transactions we couldn't get a proper match - we have a problem
  if (!paymentToUpdate || !transactionId) {
    throw Error(
      'Unable to find matching transaction with "initial" state in cart payments'
    );
  }

  logger.info(`Transaction id received: ${transactionId}`);

  const cartHash = generateCartHash(cart);
  const cartDigest = notificationItem.additionalData["metadata.cartDigest"];

  // Compare cart hash with cart digest (uses same logic on session creation)
  if (cartHash !== cartDigest) {
    throw Error(
      "Cart Hash is not the same as cart Digest. Cart has changed since session was created"
    );
  }

  const cartPrice = cart.totalPrice.centAmount;
  const paidPrice = notificationItem.amount.value;

  /*
    This makes a comparison on the total price of the cart with
    the price passed via EB (details from Adyen) to make sure they
    are in sync. If they are not, we DO NOT create the order.

    There is another ticket for an implementation of error handling
    which will result in this needing to be updated.

    This comparison will eventually be replaced by: WCAAS-3253
  */
  if (paidPrice !== cartPrice) {
    const error = `Prices do not match - request: ${paidPrice}, cart: ${cartPrice}. Order will NOT be created!`;
    throw new Error(error);
  }

  const pspReference = notificationItem.pspReference;
  // Important we track updatedPaymnt as this mutates the version number
  const updatedPayment = await updateTransactionInteractionId(
    brandId,
    paymentToUpdate,
    transactionId,
    pspReference
  );

  // Important we track updated cart so we can get version for subsequent transaction
  const updatedCart = await addCustomFieldsToCTCart(
    cart.id,
    cart.version,
    brandId,
    notificationItem
  );

  // If it didnt pass - dont add custom fields to cart (for successful card) or create order
  if (notificationItem.success === "true") {
    await updateTransactionAsAuthorised(
      brandId,
      updatedPayment.body,
      transactionId
    );

    const order = (await createOrderFromCart({
      cartId: cart.id,
      brandId,
      cartVersion: updatedCart.body.version, // as createCTPayment will have updated cart version after performing actions
      orderNumber: cart.custom?.fields.emcOrderId,
      customFields: {
        orderUserMarketingPreference:
          cart.custom?.fields.emcUserMarketingPreference,
        orderUserTimeZone: cart.custom?.fields.emcUserTimeZone,
        paymentMethod: notificationItem.paymentMethod,
        last4Digits: notificationItem.additionalData.cardSummary!,
      },
    })) as Order;

    return order;
  } else {
    // Payment failed
    await updateTransactionAsFailed(
      brandId,
      updatedPayment.body,
      transactionId
    );
  }
};

export default middy(handler)
  .use(newRelic())
  .use(eventValidator(orderEventSchema));
