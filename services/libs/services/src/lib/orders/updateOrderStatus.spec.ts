import * as randomstring from "randomstring";
import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import {
  BrandConfigCachedClient,
  CT_CONFIG_KEYS,
} from "@ei-services/brand-config";
import updateOrderStatus from "./updateOrderStatus";

jest.mock("@ei-services/commerce-tools");
jest.mock("@ei-services/brand-config");

const BrandConfigCachedClientMock = BrandConfigCachedClient as jest.MockedClass<
  typeof BrandConfigCachedClient
>;

describe("updateOrderStatus", () => {
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
      productProjections: jest.fn().mockReturnThis(),
      withProjectKey: jest.fn().mockReturnThis(),
      orders: jest.fn().mockReturnThis(),
      withId: jest.fn().mockReturnThis(),
      withOrderNumber: jest.fn().mockReturnThis(),
      get: jest.fn(() => ({
        execute: jest.fn(() => ({
          body: {
            version: 1,
            id: "foo",
            lineItems: [{ id: "bar", variant: { sku: "ABC-123" } }],
          },
        })),
      })),
      post: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: { id: "foo", version: 1 },
      }),
    };
    jest.mocked(buildCommerceToolsGenericClient).mockResolvedValue(client);
  });

  it("should call /{projectKey}/orders/{id} using the CT SDK", async () => {
    const response = await updateOrderStatus({
      orderId: "foo",
      brandId: "bar",
      status: {
        current: "PLACED",
        previous: "PLACED",
      },
      time: new Date().toDateString(),
    });

    expect(response).toStrictEqual({ id: "foo", version: 1 });
  });

  it("should call add a shipment action when SHIPPED is sent", async () => {
    const response = await updateOrderStatus({
      orderId: "foo",
      brandId: "bar",
      status: {
        current: "SHIPPED",
        previous: "PLACED",
      },
      time: new Date().toDateString(),
      delivery: {
        lineItems: [
          {
            // case insensitive
            sku: "abc-123",
            status: "PLACED",
            quantity: 1,
            dispatchedQuantity: 1,
          },
        ],
      },
    });

    expect(response).toStrictEqual({ id: "foo", version: 1 });
    expect(client.post).toBeCalledWith({
      body: {
        version: 1,
        actions: [
          {
            action: "changeShipmentState",
            shipmentState: "Shipped",
          },
          {
            action: "addDelivery",
            items: [
              {
                id: "bar",
                quantity: 1,
              },
            ],
            parcels: [
              {
                trackingData: {
                  trackingId: undefined,
                  carrier: undefined,
                },
                items: [
                  {
                    id: "bar",
                    quantity: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  it("should call add a shipment action when SHIPPED is sent with courier information if passed", async () => {
    const response = await updateOrderStatus({
      orderId: "foo",
      brandId: "bar",
      status: {
        current: "SHIPPED",
        previous: "PLACED",
      },
      time: new Date().toDateString(),
      delivery: {
        trackingUrl: "https://www.dhl.com/abc123",
        courier: {
          companyName: "DHL",
        },
        lineItems: [
          {
            // case insensitive
            sku: "abc-123",
            status: "PLACED",
            quantity: 1,
            dispatchedQuantity: 1,
          },
        ],
      },
    });

    expect(response).toStrictEqual({ id: "foo", version: 1 });
    expect(client.post).toBeCalledWith({
      body: {
        version: 1,
        actions: [
          {
            action: "changeShipmentState",
            shipmentState: "Shipped",
          },
          {
            action: "addDelivery",
            items: [
              {
                id: "bar",
                quantity: 1,
              },
            ],
            parcels: [
              {
                trackingData: {
                  trackingId: "https://www.dhl.com/abc123",
                  carrier: "DHL",
                },
                items: [
                  {
                    id: "bar",
                    quantity: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  it("should set order as Confirmed if PLACED is passed", async () => {
    const response = await updateOrderStatus({
      orderId: "foo",
      brandId: "bar",
      status: {
        current: "PLACED",
        previous: "PLACED",
      },
      time: new Date().toDateString(),
    });

    expect(response).toStrictEqual({ id: "foo", version: 1 });
    expect(client.post).toBeCalledWith({
      body: {
        version: 1,
        actions: [
          {
            action: "changeOrderState",
            orderState: "Confirmed",
          },
        ],
      },
    });
  });
});
