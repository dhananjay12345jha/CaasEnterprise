import * as randomstring from "randomstring";
import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import {
  BrandConfigCachedClient,
  CT_CONFIG_KEYS,
} from "@ei-services/brand-config";
import getOrder from "./getOrderByOrderNumber";

jest.mock("@ei-services/commerce-tools");
jest.mock("@ei-services/brand-config");

const BrandConfigCachedClientMock = BrandConfigCachedClient as jest.MockedClass<
  typeof BrandConfigCachedClient
>;

describe("getOrder", () => {
  let client;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest
      .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
      .mockImplementation(() =>
        Promise.resolve({
          [CT_CONFIG_KEYS.AUTH_URL]: randomstring.generate(12),
          [CT_CONFIG_KEYS.PROJECT_KEY]: randomstring.generate(12),
          [CT_CONFIG_KEYS.API_URL]: randomstring.generate(12),
          [CT_CONFIG_KEYS.CLIENT_ID]: randomstring.generate(12),
          [CT_CONFIG_KEYS.CLIENT_SECRET]: randomstring.generate(12),
        })
      );
    BrandConfigCachedClientMock.mockClear();
    client = {
      orders: jest.fn().mockReturnThis(),
      withOrderNumber: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: { id: "foo", orderNumber: "foo", version: 1 },
      }),
    };
    jest.mocked(buildCommerceToolsGenericClient).mockResolvedValue(client);
  });

  it("should call GET /{projectKey}/orders/order-number={orderNumber} using the CT SDK", async () => {
    const response = await getOrder({
      orderNumber: "foo",
      brandId: "bar",
    });

    expect(response).toStrictEqual({
      id: "foo",
      orderNumber: "foo",
      version: 1,
    });
  });
});
