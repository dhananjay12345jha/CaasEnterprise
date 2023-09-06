import {
  getEventBridgeClient,
  sendCustomEvents,
} from "@ei-services/shared/eventbridge/client";
import {
  EXPECTED_DELIVERY_WINDOW_TYPE,
  ORDER_STATUS,
  OrderStatusChangedMessageInput,
  OrderStatusChangedMessageMetadata,
  pushEventBridgeMessage,
} from "./pushEventBridgeMessage";

jest.mock("@ei-services/shared/eventbridge/client");

describe("pushEventBridgeMessage library", () => {
  describe("pushEventBridgeMessage()", () => {
    const client = { someFake: "eventbridge client" };

    jest.mocked(getEventBridgeClient).mockResolvedValue(client as never);

    const sendCustomEventsMock = jest
      .mocked(sendCustomEvents)
      .mockResolvedValue(123 as never);

    beforeEach(jest.clearAllMocks);

    it("should call sendCustomEvents() with correct parameters", async () => {
      const messageInput: OrderStatusChangedMessageInput = {
        brand: "1234",
        time: new Date("2022-06-16T14:27:40.092Z"),
        orderId: "331122332211",
        status: {
          current: ORDER_STATUS.SHIPPED,
          previous: ORDER_STATUS.PLACED,
        },
        delivery: {
          trackingUrl: "https://some-url.com/trackingCode=1234123",
          courier: {
            companyName: "DHL",
          },
          expectedDeliveryWindow: {
            value: 3,
            type: EXPECTED_DELIVERY_WINDOW_TYPE.DAYS,
          },
          lineItems: [
            {
              sku: "342341231244",
              status: ORDER_STATUS.SHIPPED,
              quantity: 5,
              dispatchedQuantity: 2,
            },
          ],
        },
      };

      const metadata: OrderStatusChangedMessageMetadata = {
        amazonRequestId: "some api gateway request id",
        lambdaRequestId: "some lambda request id",
      };

      const result = await pushEventBridgeMessage(messageInput, metadata);
      expect(result).toEqual(123);

      expect(getEventBridgeClient).toHaveBeenCalledTimes(1);
      expect(getEventBridgeClient).toHaveBeenCalledWith({ maxAttempts: 3 });

      expect(sendCustomEventsMock).toHaveBeenCalledTimes(1);
      expect(sendCustomEventsMock).toHaveBeenCalledWith(
        client,
        expect.objectContaining({
          input: {
            Entries: [
              {
                Detail: JSON.stringify({
                  payload: {
                    time: "2022-06-16T14:27:40.092Z",
                    orderId: "331122332211",
                    status: { current: "SHIPPED", previous: "PLACED" },
                    delivery: {
                      trackingUrl: "https://some-url.com/trackingCode=1234123",
                      courier: { companyName: "DHL" },
                      expectedDeliveryWindow: { value: 3, type: "days" },
                      lineItems: [
                        {
                          sku: "342341231244",
                          status: "SHIPPED",
                          quantity: 5,
                          dispatchedQuantity: 2,
                        },
                      ],
                    },
                  },
                  metadata: {
                    "x-emc-ubid": "1234",
                    "x-amzn-RequestId": "some api gateway request id",
                    "x-lambda-RequestId": "some lambda request id",
                  },
                }),
                DetailType: "order.status.changed",
                EventBusName: "test-event-bus",
                Source:
                  "emc.orders-status-changes-sandbox-stockQuantityUpdateWebhook",
              },
            ],
          },
        })
      );
    });

    it("should call sendCustomEvents() omitting 'delivery' if that is not provided", async () => {
      const messageInput: OrderStatusChangedMessageInput = {
        brand: "1234",
        time: new Date("2022-06-16T14:27:40.092Z"),
        orderId: "331122332211",
        status: {
          current: ORDER_STATUS.SHIPPED,
          previous: ORDER_STATUS.PLACED,
        },
      };

      const metadata: OrderStatusChangedMessageMetadata = {
        amazonRequestId: "some api gateway request id",
        lambdaRequestId: "some lambda request id",
      };

      const result = await pushEventBridgeMessage(messageInput, metadata);
      expect(result).toEqual(123);

      expect(getEventBridgeClient).toHaveBeenCalledTimes(1);
      expect(getEventBridgeClient).toHaveBeenCalledWith({ maxAttempts: 3 });

      expect(sendCustomEventsMock).toHaveBeenCalledTimes(1);
      expect(sendCustomEventsMock).toHaveBeenCalledWith(
        client,
        expect.objectContaining({
          input: {
            Entries: [
              {
                Detail: JSON.stringify({
                  payload: {
                    time: "2022-06-16T14:27:40.092Z",
                    orderId: "331122332211",
                    status: { current: "SHIPPED", previous: "PLACED" },
                  },
                  metadata: {
                    "x-emc-ubid": "1234",
                    "x-amzn-RequestId": "some api gateway request id",
                    "x-lambda-RequestId": "some lambda request id",
                  },
                }),
                DetailType: "order.status.changed",
                EventBusName: "test-event-bus",
                Source:
                  "emc.orders-status-changes-sandbox-stockQuantityUpdateWebhook",
              },
            ],
          },
        })
      );
    });
  });
});
