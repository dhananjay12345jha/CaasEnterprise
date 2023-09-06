import {
  Cart,
  CartSetCustomFieldAction,
  ClientResponse,
  Payment,
} from "@commercetools/platform-sdk";
import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { AdyenWebhookRequestItem } from "@ei-services/common/middleware";

const updateTransactionAsAuthorised = async (
  brandId: string,
  payment: Payment,
  transactionId: string
) => {
  return await updateTransactionStatus(brandId, payment, transactionId, true);
};

const updateTransactionAsFailed = async (
  brandId: string,
  payment: Payment,
  transactionId: string
) => {
  return await updateTransactionStatus(brandId, payment, transactionId, false);
};

const updateTransactionInteractionId = async (
  brandId: string,
  payment: Payment,
  transactionId: string,
  pspReference: string
) => {
  const ctClient = await buildCommerceToolsGenericClient(brandId, [
    "manage_payments",
    "manage_orders",
  ]);

  return await ctClient
    .payments()
    .withId({ ID: payment.id })
    .post({
      body: {
        version: payment.version,
        actions: [
          {
            action: "changeTransactionInteractionId",
            transactionId: transactionId,
            interactionId: pspReference,
          },
        ],
      },
    })
    .execute();
};

const updateTransactionStatus = async (
  brandId: string,
  payment: Payment,
  transactionId: string,
  isAuthorised: boolean
) => {
  const ctClient = await buildCommerceToolsGenericClient(brandId, [
    "manage_payments",
    "manage_orders",
  ]);

  return await ctClient
    .payments()
    .withId({ ID: payment.id })
    .post({
      body: {
        version: payment.version,
        actions: [
          {
            action: "changeTransactionState",
            transactionId: transactionId,
            state: isAuthorised ? "Success" : "Failure",
          },
        ],
      },
    })
    .execute();
};

const addCustomFieldsToCTCart = async (
  cartId: string,
  cartVersion: number,
  brandId: string,
  session: AdyenWebhookRequestItem
): Promise<ClientResponse<Cart>> => {
  const ctClient = await buildCommerceToolsGenericClient(brandId, [
    "manage_payments",
    "manage_orders",
  ]);

  const addCustomDatatActions = getCustomFieldsAddToCTCartAction(session);
  const actions = [...addCustomDatatActions];

  return await ctClient
    .carts()
    .withId({ ID: cartId })
    .post({
      body: {
        version: cartVersion,
        actions,
      },
    })
    .execute();
};

function getCustomFieldsAddToCTCartAction(
  session: AdyenWebhookRequestItem
): CartSetCustomFieldAction[] {
  const last4Digits = session.additionalData.cardSummary;
  const paymentMethod = session.paymentMethod;

  return [
    // Already set to type emcOrderDetails on customer-api/payments
    {
      action: "setCustomField",
      name: "emcLast4Digits",
      value: last4Digits,
    },
    {
      action: "setCustomField",
      name: "emcPaymentMethod",
      value: paymentMethod,
    },
  ] as CartSetCustomFieldAction[];
}

async function getCTPaymentById(brandId, id: string) {
  const ctClient = await buildCommerceToolsGenericClient(brandId, [
    "manage_payments",
    "manage_orders",
  ]);

  return await ctClient.payments().withId({ ID: id }).get().execute();
}

export {
  addCustomFieldsToCTCart,
  updateTransactionAsAuthorised,
  updateTransactionAsFailed,
  updateTransactionInteractionId,
  getCTPaymentById,
};
