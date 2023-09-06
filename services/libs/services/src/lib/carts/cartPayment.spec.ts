import { Cart, Payment } from "@commercetools/platform-sdk";
import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { AdyenWebhookRequestItem } from "@ei-services/common/middleware";
import { BrandConfigCachedClient } from "@ei-services/brand-config";
import { faker } from "@faker-js/faker";
import {
  addCustomFieldsToCTCart,
  getCTPaymentById,
  updateTransactionAsAuthorised,
  updateTransactionAsFailed,
  updateTransactionInteractionId,
} from ".";

jest.mock("@ei-services/commerce-tools");
jest.mock("@ei-services/brand-config");
const BrandConfigCachedClientMock = BrandConfigCachedClient as jest.MockedClass<
  typeof BrandConfigCachedClient
>;

jest
  .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
  .mockImplementation(() =>
    Promise.resolve({
      "ct-auth-url": faker.datatype.string(12),
      "ct-project-key": faker.datatype.string(12),
      "ct-api-url": faker.datatype.string(12),
      "ct-client-id": faker.datatype.string(12),
      "ct-client-secret": faker.datatype.string(12),
    })
  );

const mockAdyenSession: AdyenWebhookRequestItem = {
  pspReference: "fasdfasdf",
  eventDate: new Date().toISOString(),
  success: "success",
  additionalData: {
    "metadata.brandId": "brand-id",
    "metadata.cartId": "cart-id",
    "metadata.cartDigest": "cart-digest",
    cardSummary: "0005",
  },
  amount: {
    currency: "GBP",
    value: 123121,
  },
  paymentMethod: "card",
  eventCode: "Authorisation",
};

const mockCart: Cart = {
  id: "mock_cart_id",
  version: 8,
  createdAt: new Date().toDateString(),
  lineItems: [],
  lastModifiedAt: new Date().toDateString(),
  customLineItems: [],
  totalPrice: {
    centAmount: 1000,
    currencyCode: "GBP",
    type: "centPrecision",
    fractionDigits: 2,
  },
  cartState: null,
  taxMode: "Disabled",
  origin: "Customer",
  taxRoundingMode: "HalfDown",
  taxCalculationMode: "LineItemLevel",

  refusedGifts: [],
};

const today = new Date().toISOString();
const paymentObj: Payment = {
  id: "payment-id",
  version: 4,
  createdAt: today,
  lastModifiedAt: today,
  amountPlanned: {
    type: "centPrecision",
    centAmount: 2000,
    currencyCode: "GBP",
    fractionDigits: 2,
  },
  transactions: [
    {
      type: "Authorization",
      state: "Initial",
      id: "id-for-transaction",
      amount: {
        type: "centPrecision",
        centAmount: 2000,
        currencyCode: "GBP",
        fractionDigits: 2,
      },
    },
  ],
  paymentMethodInfo: undefined,
  paymentStatus: undefined,
  interfaceInteractions: [],
};

const client = {
  withProjectKey: jest.fn().mockReturnThis(),
  me: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  carts: jest.fn().mockReturnThis(),
  payments: jest.fn().mockReturnThis(),
  withId: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  orders: jest.fn().mockReturnThis(),
  execute: jest
    .fn()
    .mockResolvedValueOnce({
      body: mockCart,
    })
    .mockResolvedValueOnce({
      body: paymentObj,
    })
    .mockResolvedValueOnce({
      body: paymentObj,
    })
    .mockResolvedValueOnce({
      body: paymentObj,
    }),
};

jest.mocked(buildCommerceToolsGenericClient).mockResolvedValue(client as any);
afterEach(() => {
  client.get.mockReset();
  client.post.mockReset();
  client.get = jest.fn(() => client);
  client.post = jest.fn(() => client);
});

describe("addCustomFieldsToCTCart", () => {
  it("updates fields on cart based on adyen result", async () => {
    const result = await addCustomFieldsToCTCart(
      mockCart.id,
      mockCart.version,
      "brand-id",
      mockAdyenSession
    );

    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenLastCalledWith({
      body: {
        version: mockCart.version,
        actions: [
          {
            action: "setCustomField",
            name: "emcLast4Digits",
            value: mockAdyenSession.additionalData.cardSummary,
          },
          {
            action: "setCustomField",
            name: "emcPaymentMethod",
            value: mockAdyenSession.paymentMethod,
          },
        ],
      },
    });

    expect(result).toEqual({
      body: mockCart,
    });
  });
});

describe("getCTPaymentById", () => {
  it("creates request format we expect to interface with CT", async () => {
    const result = await getCTPaymentById("brand-id", "payment-id");

    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.withId).toHaveBeenLastCalledWith({ ID: "payment-id" });
    expect(result).toEqual({
      body: paymentObj,
    });
  });
});

describe("updateTransactionAsAuthorised()", () => {
  it("successfully updates transaction", async () => {
    const transactionId = paymentObj.transactions[0].id;
    const result = await updateTransactionAsAuthorised(
      mockAdyenSession.additionalData["metadata.brandId"],
      paymentObj,
      transactionId
    );

    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenLastCalledWith({
      body: {
        version: paymentObj.version,
        actions: [
          {
            action: "changeTransactionState",
            transactionId: transactionId,
            state: "Success",
          },
        ],
      },
    });

    expect(result).toEqual({
      body: paymentObj,
    });
  });
});

describe("updateTransactionAsFailed()", () => {
  it("successfully updates transaction", async () => {
    const transactionId = paymentObj.transactions[0].id;
    const result = await updateTransactionAsFailed(
      mockAdyenSession.additionalData["metadata.brandId"],
      paymentObj,
      transactionId
    );

    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenLastCalledWith({
      body: {
        version: paymentObj.version,
        actions: [
          {
            action: "changeTransactionState",
            transactionId: transactionId,
            state: "Failure",
          },
        ],
      },
    });

    expect(result).toEqual({
      body: paymentObj,
    });
  });
});

describe("updateTransactionInteractionId()", () => {
  it("Correctly formats request to CT", async () => {
    const pspReference = "pspReference";
    const transactionId = paymentObj.transactions[0].id;

    const result = await updateTransactionInteractionId(
      mockAdyenSession.additionalData["metadata.brandId"],
      paymentObj,
      transactionId,
      pspReference
    );

    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenLastCalledWith({
      body: {
        version: paymentObj.version,
        actions: [
          {
            action: "changeTransactionInteractionId",
            transactionId: transactionId,
            interactionId: pspReference,
          },
        ],
      },
    });

    expect(result).toBe(undefined);
  });
});
