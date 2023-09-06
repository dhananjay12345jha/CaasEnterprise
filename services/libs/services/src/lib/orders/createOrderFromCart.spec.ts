import * as randomstring from "randomstring";
import { BrandConfigCachedClient } from "@ei-services/brand-config";
import createOrderFromCart from "./createOrderFromCart";

jest.mock("@ei-services/brand-config");
const BrandConfigCachedClientMock = BrandConfigCachedClient as jest.MockedClass<
  typeof BrandConfigCachedClient
>;

jest.mock("@ei-services/commerce-tools", () => {
  return {
    __esModule: true,
    buildCTPApiBuilder: () => ({
      withProjectKey: () => ({
        orders: () => ({
          post: () => ({
            execute: jest.fn(() => ({ body: { status: "Ordered" } })),
          }),
        }),
      }),
    }),
  };
});

describe("createOrderFromCart service", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest
      .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
      .mockImplementation(() =>
        Promise.resolve({
          "ct-auth-url": randomstring.generate(12),
          "ct-project-key": randomstring.generate(12),
          "ct-api-url": randomstring.generate(12),
          "ct-client-id": randomstring.generate(12),
          "ct-client-secret": randomstring.generate(12),
        })
      );
    BrandConfigCachedClientMock.mockClear();
  });

  it("should convert cart to an order and return order body", async () => {
    const response = await createOrderFromCart({
      cartId: "some-cart-id",
      cartVersion: 1,
      brandId: "some-brand-id",
      orderNumber: "some-emc-order-id",
      customFields: {
        orderUserMarketingPreference: "opt_in",
        orderUserTimeZone: "Time/Zone",
        last4Digits: "0934",
        paymentMethod: "Card",
      },
    });

    expect(response).toStrictEqual({ status: "Ordered" });
  });
});
