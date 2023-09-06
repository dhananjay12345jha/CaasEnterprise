import { faker } from "@faker-js/faker";

import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import {
  BrandConfigCachedClient,
  CT_CONFIG_KEYS,
} from "@ei-services/brand-config";

import getOrderByOrderId from "./get-order-by-order-id";

jest.mock("@ei-services/commerce-tools");
jest.mock("@ei-services/brand-config");
const BrandConfigCachedClientMock = BrandConfigCachedClient as jest.MockedClass<
  typeof BrandConfigCachedClient
>;

describe("getOrderByOrderId", () => {
  const brandId = faker.datatype.uuid();
  const orderId = faker.datatype.uuid();
  const version = faker.datatype.number(10);
  let client;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest
      .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
      .mockReturnThis()
      .mockResolvedValue({
        [CT_CONFIG_KEYS.AUTH_URL]: faker.internet.url(),
        [CT_CONFIG_KEYS.PROJECT_KEY]: faker.datatype.string(12),
        [CT_CONFIG_KEYS.API_URL]: faker.internet.url(),
        [CT_CONFIG_KEYS.CLIENT_ID]: faker.datatype.string(12),
        [CT_CONFIG_KEYS.CLIENT_SECRET]: faker.datatype.string(),
      });
    BrandConfigCachedClientMock.mockClear();
    client = {
      orders: jest.fn().mockReturnThis(),
      withId: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({
        body: {
          id: orderId,
          version,
        },
      }),
    };
    jest.mocked(buildCommerceToolsGenericClient).mockResolvedValue(client);
  });

  it("should call GET /{projectKey}/orders/{id} using the CT SDK", async () => {
    const response = await getOrderByOrderId({
      orderId,
      brandId,
    });

    expect(response).toStrictEqual({ id: orderId, version });
  });
});
