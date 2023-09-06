import { v4 as uuid } from "uuid";
import { Context as LambdaContext } from "aws-lambda/handler";
import {
  getCart,
  createOrderFromCart,
  getAdyenHmacKey,
  addCustomFieldsToCTCart,
  updateTransactionAsAuthorised,
  updateTransactionAsFailed,
  getCTPaymentById,
  updateTransactionInteractionId,
} from "@ei-services/services";
import { default as createOrder, HandlerEvent } from "./index";
import { generateCartHash } from "@ei-services/commerce-tools";
import { Cart } from "@commercetools/platform-sdk";
import { NotificationRequestItem } from "@adyen/api-library/lib/src/typings/notification/models";
import { hmacValidator as AdyenHmacValidator } from "@adyen/api-library";
const _hmacValidator = new AdyenHmacValidator();

// baseHmacKey - must be HEX for this to work properly - non hex values resolve to the same
const baseHmacKey =
  "780B1E3E4FF9D05E27FC715DFB7139C1FF12B4FD4BE586EF2829B096E3BF92C2";

function eventWithHmacSignature(event: HandlerEvent): HandlerEvent {
  const sig = _hmacValidator.calculateHmac(
    event.detail.payload.notificationItems[0]
      .NotificationRequestItem as unknown as NotificationRequestItem,
    baseHmacKey
  );
  event.detail.payload.notificationItems[0].NotificationRequestItem.additionalData.hmacSignature =
    sig;
  return event;
}

jest.mock("@ei-services/services");

// Any time this function is used inside order func - use same we're using to validate
const mockedGetAdyenHmacKey = getAdyenHmacKey as jest.Mock;
mockedGetAdyenHmacKey.mockResolvedValue(baseHmacKey);

describe("createOrder handler", () => {
  const mockedGetCart = getCart as jest.Mock;
  const mockGetCTPaymentById = getCTPaymentById as jest.Mock;
  const mockedCreateOrderFromCart = createOrderFromCart as jest.Mock;
  const mockedUpdateTransactionAsAuthorised =
    updateTransactionAsAuthorised as jest.Mock;
  const mockedUpdateTransactionAsFailed =
    updateTransactionAsFailed as jest.Mock;
  const mockedAddCustomFieldsToCTCart = addCustomFieldsToCTCart as jest.Mock;
  const mockedUpdateTransactionInteractionId =
    updateTransactionInteractionId as jest.Mock;

  beforeEach(() => jest.restoreAllMocks());

  it("should not make requests if event is not an authorisation event", async () => {
    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                merchantReference: "SOME-REF",
                pspReference: "ANOTHER-REF",
                success: "true",
                additionalData: {
                  checkoutSessionId: "some-id",
                  "metadata.cartId": "some-cart-id",
                  "metadata.cartDigest": "some-hash",
                },
                amount: {
                  currency: "GBP",
                  value: 4000,
                },
                eventCode: "SOME-OTHER-EVENT-TYPE",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    try {
      await createOrder(event, {} as LambdaContext);
    } catch (err) {
      expect(err).toEqual(
        new Error(
          "We need an 'AUTHORISATION' event type to convert the cart to an order. Received: 'SOME-OTHER-EVENT-TYPE' event type, so we are ignoring this."
        )
      );
      expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
    }
  });

  it("should not make requests if brand id is missing", async () => {
    const notifItem = {
      merchantReference: "SOME-REF",
      pspReference: "ANOTHER-REF",
      success: "true",
      additionalData: {
        checkoutSessionId: "some-id",
        "metadata.cartId": "some-cart-id",
        "metadata.cartDigest": "some-hash",
        hmacSignature: "",
      },
      amount: {
        currency: "GBP",
        value: 4000,
      },
      eventCode: "AUTHORISATION",
      eventDate: new Date().toISOString(),
    };

    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": null },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: notifItem,
            },
          ],
        },
      },
    });

    try {
      await createOrder(event, {} as LambdaContext);
    } catch (error) {
      expect(error).toMatchObject([
        {
          code: "invalid_type",
          expected: "string",
          message: "Expected string, received null",
          path: ["detail", "metadata", "x-emc-ubid"],
          received: "null",
        },
      ]);
    }

    expect(mockedGetCart).not.toHaveBeenCalled();
    expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
  });

  it("should not make requests if cart id is missing from metadata", async () => {
    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                pspReference: "ANOTHER-REF",
                success: "true",
                merchantReference: "Merchant-ref",
                additionalData: {
                  checkoutSessionId: "some-id",
                  "metadata.cartDigest": "some-hash",
                  hmacSignature: "asdfasdf",
                },
                amount: {
                  currency: "GBP",
                  value: 4000,
                },
                eventCode: "AUTHORISATION",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    try {
      await createOrder(event, {} as LambdaContext);
    } catch (error) {
      expect(error).toEqual([
        {
          code: "invalid_type",
          expected: "string",
          message: "Required",
          path: [
            "detail",
            "payload",
            "notificationItems",
            0,
            "NotificationRequestItem",
            "additionalData",
            "metadata.cartId",
          ],
          received: "undefined",
        },
      ]);
    }
    expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
    expect(mockedGetCart).not.toHaveBeenCalled();
  });

  it("should not create if no previous payments are on cart", async () => {
    const pspReference = "ANOTHER_REF";
    const checkoutId = "CHECKOUT-ID";
    const cart = {
      id: "some-cart-id",
      version: 1,
      totalPrice: { centAmount: 4000, currencyCode: "GBP" },
      lineItems: [{ randomObject: true }],
      paymentInfo: {
        payments: [],
      },
    };

    const cartHash = generateCartHash(cart as unknown as Cart);
    mockedGetCart.mockResolvedValue(cart);
    mockGetCTPaymentById.mockResolvedValue({
      body: undefined,
    });

    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                merchantReference: "SOME-REF",
                pspReference,
                success: "true",
                additionalData: {
                  checkoutSessionId: checkoutId,
                  "metadata.cartId": "some-cart-id",
                  "metadata.cartDigest": cartHash,
                },
                amount: {
                  currency: "GBP",
                  value: 4000,
                },
                eventCode: "AUTHORISATION",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    try {
      await createOrder(event, {} as LambdaContext);
    } catch (err) {
      expect(err).toEqual(
        new Error(
          "No previous payments sessions on this cart - payment session hasn't been initliased and added to cart"
        )
      );
      expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
    }
  });

  it("should not create order if there are no previous transactions with correct sessionId", async () => {
    const pspReference = "ANOTHER_REF";
    const checkoutId = "CHECKOUT-ID";
    const cart = {
      id: "some-cart-id",
      version: 1,
      totalPrice: { centAmount: 4000, currencyCode: "GBP" },
      lineItems: [{ randomObject: true }],
      paymentInfo: {
        payments: [
          {
            id: "anyid",
          },
        ],
      },
    };

    const cartHash = generateCartHash(cart as unknown as Cart);
    mockedGetCart.mockResolvedValue(cart);
    mockGetCTPaymentById.mockResolvedValue({
      body: {
        id: checkoutId,
        transactions: [
          {
            interactionId: "incorrect-id",
            state: "Initial",
            id: "random-transaction-id-to-use",
          },
        ],
      },
    });

    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                merchantReference: "SOME-REF",
                pspReference,
                success: "true",
                additionalData: {
                  checkoutSessionId: checkoutId,
                  "metadata.cartId": "some-cart-id",
                  "metadata.cartDigest": cartHash,
                },
                amount: {
                  currency: "GBP",
                  value: 4000,
                },
                eventCode: "AUTHORISATION",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    try {
      await createOrder(event, {} as LambdaContext);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toEqual(
        new Error(
          'Unable to find matching transaction with "initial" state in cart payments'
        )
      );
      expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
    }
  });

  it('should not create order if matching previous transactions are not set to "Initial"', async () => {
    const pspReference = "ANOTHER_REF";
    const checkoutId = "CHECKOUT-ID";
    const cart = {
      id: "some-cart-id",
      version: 1,
      totalPrice: { centAmount: 4000, currencyCode: "GBP" },
      lineItems: [{ randomObject: true }],
      paymentInfo: {
        payments: [
          {
            id: "anyid",
          },
        ],
      },
    };

    const cartHash = generateCartHash(cart as unknown as Cart);
    mockedGetCart.mockResolvedValue(cart);
    mockGetCTPaymentById.mockResolvedValue({
      body: {
        id: checkoutId,
        transactions: [
          {
            interactionId: checkoutId,
            state: "Failed",
            id: "random-transaction-id-to-use",
          },
        ],
      },
    });

    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                merchantReference: "SOME-REF",
                pspReference,
                success: "true",
                additionalData: {
                  checkoutSessionId: checkoutId,
                  "metadata.cartId": "some-cart-id",
                  "metadata.cartDigest": cartHash,
                },
                amount: {
                  currency: "GBP",
                  value: 4000,
                },
                eventCode: "AUTHORISATION",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    try {
      await createOrder(event, {} as LambdaContext);
    } catch (err) {
      expect(err).toEqual(
        new Error(
          'Unable to find matching transaction with "initial" state in cart payments'
        )
      );
      expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
    }
  });

  it("should not create an order if amount from event doesnt equal cart amount", async () => {
    const pspReference = "ANOTHER_REF";
    const checkoutId = "THAT_REF";
    const cart = {
      id: "some-cart-id",
      version: 1,
      totalPrice: { centAmount: 4000, currencyCode: "GBP" },
      lineItems: [{ randomObject: true }],
      paymentInfo: {
        payments: [
          {
            id: "anyId",
          },
        ],
      },
    } as unknown as Cart;
    mockedGetCart.mockResolvedValue(cart);

    mockGetCTPaymentById.mockResolvedValue({
      body: {
        id: checkoutId,
        state: "Initial",
        transactions: [
          {
            interactionId: "asdfasdf",
            state: "Initial",
            id: "random-transaction-id-to-use",
          },
          {
            interactionId: checkoutId,
            state: "Initial",
            id: "random-transaction-id-to-use",
          },
        ],
      },
    });

    const cartHash = generateCartHash(cart);

    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                merchantReference: "SOME-REF",
                pspReference,
                success: "true",
                additionalData: {
                  checkoutSessionId: checkoutId,
                  "metadata.cartId": "some-cart-id",
                  "metadata.cartDigest": cartHash,
                  hmacSignature: "asdfasdf",
                },
                amount: {
                  currency: "GBP",
                  value: 3000,
                },
                eventCode: "AUTHORISATION",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    try {
      await createOrder(event, {} as LambdaContext);
    } catch (err) {
      expect(err).toEqual(
        new Error(
          "Prices do not match - request: 3000, cart: 4000. Order will NOT be created!"
        )
      );
      expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
    }
  });

  it('SHOULD NOT create order if success = "false"', async () => {
    mockedUpdateTransactionAsFailed.mockResolvedValue(Promise.resolve());
    const orderNumber = "some-emc-order-id";
    const pspReference = "ANOTHER_REF";
    const checkoutId = "ANOTHER_ID";
    const transactionId = "transaction-id";

    const paymentObj = {
      id: checkoutId,
      state: "Initial",
      transactions: [
        {
          interactionId: checkoutId,
          state: "Initial",
          id: transactionId,
        },
      ],
    };

    const cart = {
      id: "some-cart-id",
      version: 1,
      custom: { fields: { emcOrderId: orderNumber } },
      lineItems: [{ randomObject: true }],
      totalPrice: { centAmount: 4000, currencyCode: "GBP" },
      paymentInfo: {
        payments: [
          {
            id: "anyid",
          },
        ],
      },
    } as unknown as Cart;
    mockedGetCart.mockResolvedValue(cart);
    mockGetCTPaymentById.mockResolvedValue({
      body: paymentObj,
    });
    mockedUpdateTransactionInteractionId.mockResolvedValue({
      body: paymentObj,
    });

    const cartHash = generateCartHash(cart);

    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                merchantReference: "SOME-REF",
                pspReference,
                success: "false",
                additionalData: {
                  checkoutSessionId: checkoutId,
                  "metadata.cartId": "some-cart-id",
                  "metadata.cartDigest": cartHash,
                },
                amount: {
                  currency: "GBP",
                  value: cart.totalPrice.centAmount,
                },
                eventCode: "AUTHORISATION",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    try {
      await createOrder(event, {} as LambdaContext);
    } catch (err) {
      expect(err).toEqual(
        new Error(
          "Prices do not match - request: 3000, cart: 4000. Order will NOT be created!"
        )
      );

      expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
      expect(mockedUpdateTransactionAsAuthorised).not.toHaveBeenCalled();
      expect(mockedUpdateTransactionAsFailed).toBeCalledTimes(1);
      expect(mockedUpdateTransactionInteractionId).toHaveBeenCalledTimes(1);
      expect(mockedUpdateTransactionInteractionId).toHaveBeenLastCalledWith(
        event.detail.metadata["x-emc-ubid"],
        paymentObj,
        transactionId,
        pspReference
      );
      expect(mockedAddCustomFieldsToCTCart).toHaveBeenCalledTimes(1);
      // Expects
      // - cart Id
      // - cart version (as num)
      // - brand Id
      // - adyen notification
      expect(mockedAddCustomFieldsToCTCart).toHaveBeenLastCalledWith(
        event.detail.payload.notificationItems[0].NotificationRequestItem
          .additionalData["metadata.cartId"],
        cart.version, // from mockGetCart event
        event.detail.metadata["x-emc-ubid"],
        event.detail.payload.notificationItems[0].NotificationRequestItem
      );
    }
  });

  it("should fail if hmac signature is not included", async () => {
    const orderId = "some-order-id";
    const state = "Ordered";
    const orderNumber = "some-emc-order-id";
    const pspReference = "ANOTHER_REF";
    const checkoutId = "CHECKOUT_ID";
    const transactionId = "transactionId";

    const paymentObj = {
      id: checkoutId,
      state: "Initial",
      transactions: [
        {
          interactionId: checkoutId,
          state: "Initial",
          id: transactionId,
        },
      ],
    };

    const cart = {
      id: "some-cart-id",
      version: 1,
      custom: { fields: { emcOrderId: orderNumber } },
      lineItems: [{ randomObject: true }],
      totalPrice: { centAmount: 4000, currencyCode: "GBP" },
      paymentInfo: {
        payments: [
          {
            id: "anyid",
          },
        ],
      },
    } as unknown as Cart;
    mockedGetCart.mockResolvedValue(cart);
    mockGetCTPaymentById.mockResolvedValue({
      body: paymentObj,
    });

    mockedUpdateTransactionInteractionId.mockReset();
    mockedUpdateTransactionInteractionId.mockResolvedValue({
      body: paymentObj,
    });

    const cartDigest = generateCartHash(cart);

    mockedAddCustomFieldsToCTCart.mockReset();
    mockedAddCustomFieldsToCTCart.mockResolvedValue({
      body: {
        version: 8,
      },
    });

    mockedUpdateTransactionAsAuthorised.mockReset();
    mockedUpdateTransactionAsAuthorised.mockResolvedValue({
      body: paymentObj,
    });

    mockedCreateOrderFromCart.mockResolvedValue({
      id: orderId,
      state,
      orderNumber,
    });

    const event: HandlerEvent = {
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                merchantReference: "SOME-REF",
                pspReference,
                success: "true",
                additionalData: {
                  checkoutSessionId: checkoutId,
                  "metadata.cartId": "some-cart-id",
                  "metadata.cartDigest": cartDigest,
                  // hmacSignature:
                },
                amount: {
                  currency: "GBP",
                  value: 4000,
                },
                eventCode: "AUTHORISATION",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    };

    try {
      await createOrder(event, {} as LambdaContext);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toEqual(new Error("Missing hmacSignature"));
      expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
    }
  });

  it("should return an order response body", async () => {
    const orderId = "some-order-id";
    const state = "Ordered";
    const orderNumber = "some-emc-order-id";
    const pspReference = "ANOTHER_REF";
    const checkoutId = "checkoutId";
    const transactionId = "transactionId";

    const paymentObj = {
      id: checkoutId,
      state: "Initial",
      transactions: [
        {
          interactionId: checkoutId,
          state: "Initial",
          id: transactionId,
        },
      ],
    };

    const cart = {
      id: "some-cart-id",
      version: 1,
      custom: { fields: { emcOrderId: orderNumber } },
      lineItems: [{ randomObject: true }],
      totalPrice: { centAmount: 4000, currencyCode: "GBP" },
      paymentInfo: {
        payments: [
          {
            interfaceId: pspReference,
            state: "Initial",
          },
        ],
      },
    } as unknown as Cart;
    mockedGetCart.mockResolvedValue(cart);

    mockGetCTPaymentById.mockResolvedValue({
      body: paymentObj,
    });

    const cartDigest = generateCartHash(cart);

    mockedCreateOrderFromCart.mockResolvedValue({
      id: orderId,
      state,
      orderNumber,
    });
    mockedUpdateTransactionInteractionId.mockResolvedValue({
      body: paymentObj,
    });

    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                merchantReference: "SOME-REF",
                pspReference,
                success: "true",
                additionalData: {
                  checkoutSessionId: checkoutId,
                  "metadata.cartId": "some-cart-id",
                  "metadata.cartDigest": cartDigest,
                },
                amount: {
                  currency: "GBP",
                  value: 4000,
                },
                eventCode: "AUTHORISATION",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    const response = await createOrder(event, {} as LambdaContext);
    expect(response.id).toEqual(orderId);
    expect(response.state).toEqual(state);
    expect(response.orderNumber).toEqual(orderNumber);

    expect(mockedAddCustomFieldsToCTCart).toHaveBeenCalledTimes(1);
    // Expects
    // - cart Id
    // - cart version (as num)
    // - brand Id
    // - adyen notification
    expect(mockedAddCustomFieldsToCTCart).toHaveBeenLastCalledWith(
      event.detail.payload.notificationItems[0].NotificationRequestItem
        .additionalData["metadata.cartId"],
      1, // from mockGetCart event
      event.detail.metadata["x-emc-ubid"],
      event.detail.payload.notificationItems[0].NotificationRequestItem
    );

    expect(mockedUpdateTransactionAsAuthorised).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTransactionAsAuthorised).toHaveBeenLastCalledWith(
      event.detail.metadata["x-emc-ubid"],
      paymentObj,
      paymentObj.transactions[0].id
    );
    expect(mockedUpdateTransactionInteractionId).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTransactionInteractionId).toHaveBeenLastCalledWith(
      event.detail.metadata["x-emc-ubid"],
      paymentObj,
      transactionId,
      pspReference
    );
  });

  it("should not order if cart digests do not match", async () => {
    const orderId = "some-order-id";
    const state = "Ordered";
    const orderNumber = "some-emc-order-id";
    const pspReference = "ANOTHER_REF";
    const checkoutId = "CHECKOUT_ID";

    const paymentObj = {
      id: checkoutId,
      state: "Initial",
      transactions: [
        {
          interactionId: checkoutId,
          state: "Initial",
          id: "random-transaction-id-to-use",
        },
      ],
    };

    const cart = {
      id: "some-cart-id",
      version: 1,
      custom: { fields: { emcOrderId: orderNumber } },
      lineItems: [{ differentObject: true }],
      totalPrice: { centAmount: 4000, currencyCode: "GBP" },
      paymentInfo: {
        payments: [
          {
            id: "anyid",
          },
        ],
      },
    } as unknown as Cart;
    mockedGetCart.mockResolvedValue(cart);
    mockGetCTPaymentById.mockResolvedValue({
      body: paymentObj,
    });

    const cartDigest = generateCartHash({
      lineItems: [{ nothing: true }],
    } as any);
    mockedAddCustomFieldsToCTCart.mockResolvedValue({
      body: {
        version: 8,
      },
    });

    mockedUpdateTransactionAsAuthorised.mockResolvedValue(Promise.resolve());
    mockedUpdateTransactionAsAuthorised.mockRestore();

    mockedCreateOrderFromCart.mockReset();
    mockedCreateOrderFromCart.mockResolvedValue({
      id: orderId,
      state,
      orderNumber,
    });

    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                merchantReference: "SOME-REF",
                pspReference,
                success: "true",
                additionalData: {
                  checkoutSessionId: checkoutId,
                  "metadata.cartId": "some-cart-id",
                  "metadata.cartDigest": cartDigest,
                },
                amount: {
                  currency: "GBP",
                  value: 4000,
                },
                eventCode: "AUTHORISATION",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    try {
      await createOrder(event, {} as LambdaContext);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toEqual(
        new Error(
          "Cart Hash is not the same as cart Digest. Cart has changed since session was created"
        )
      );
    }
    expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
  });

  it("should not work if hmac signature is wrong", async () => {
    const orderId = "some-order-id";
    const state = "Ordered";
    const orderNumber = "some-emc-order-id";
    const pspReference = "ANOTHER_REF";

    const cart = {
      id: "some-cart-id",
      version: 1,
      custom: { fields: { emcOrderId: orderNumber } },
      lineItems: [{ randomObject: true }],
      totalPrice: { centAmount: 4000, currencyCode: "GBP" },
      paymentInfo: {
        payments: [
          {
            interfaceId: pspReference,
            state: "Initial",
          },
        ],
      },
    } as unknown as Cart;
    mockedGetCart.mockResolvedValue(cart);

    const cartDigest = generateCartHash(cart);

    mockedCreateOrderFromCart.mockResolvedValue({
      id: orderId,
      state,
      orderNumber,
    });
    mockedCreateOrderFromCart.mockReset();

    mockedGetAdyenHmacKey.mockResolvedValue(
      "afbffc37d828df0d712e0357d700c4f4de64b392853011279"
    );

    const event: HandlerEvent = eventWithHmacSignature({
      version: "1",
      id: uuid(),
      "detail-type": "payment.order.auth.accepted",
      referenced: true,
      time: new Date().toISOString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          live: "true",
          notificationItems: [
            {
              NotificationRequestItem: {
                merchantReference: "SOME-REF",
                pspReference,
                success: "true",
                additionalData: {
                  checkoutSessionId: "some-id",
                  "metadata.cartId": "some-cart-id",
                  "metadata.cartDigest": cartDigest,
                },
                amount: {
                  currency: "GBP",
                  value: 4000,
                },
                eventCode: "AUTHORISATION",
                eventDate: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    try {
      await createOrder(event, {} as LambdaContext);
      // SHOULD NEVER REACH THIS STATEMENT
      expect("this statement").toBe("should have never been reached");
    } catch (err) {
      expect(err).toEqual(
        new Error("HMAC did not match for this webhook event")
      );
      expect(mockedCreateOrderFromCart).not.toHaveBeenCalled();
    }
  });
});
