import * as randomstring from "randomstring";
import { BrandConfigCachedClient } from "@ei-services/brand-config";
import getCart from "./getCart";

jest.mock("@ei-services/brand-config");
const BrandConfigCachedClientMock = BrandConfigCachedClient as jest.MockedClass<
  typeof BrandConfigCachedClient
>;

jest.mock("@ei-services/commerce-tools", () => {
  return {
    __esModule: true,
    buildCommerceToolsGenericClient: () => ({
      carts: () => ({
        withId: () => ({
          get: () => ({
            execute: jest.fn(() => ({
              body: {
                id: "foo",
                version: 1,
                custom: { fields: { emcOrderId: "some-order-id" } },
              },
            })),
          }),
        }),
      }),
    }),
  };
});

describe("getCart service", () => {
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

  it("should get cart by id and return cart body", async () => {
    const response = await getCart({
      cartId: "some-cart-id",
      brandId: "some-brand-id",
    });

    expect(response).toStrictEqual({
      id: "foo",
      version: 1,
      custom: { fields: { emcOrderId: "some-order-id" } },
    });
  });
});
