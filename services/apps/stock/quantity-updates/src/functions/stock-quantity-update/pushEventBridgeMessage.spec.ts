import {
  getEventBridgeClient,
  sendCustomEvents,
} from "@ei-services/shared/eventbridge/client";
import {
  pushEventBridgeMessage,
  UPDATE_TYPE,
  StockQuantityUpdatedMessageInput,
  StockQuantityUpdatedMessageMetadata,
} from "./pushEventBridgeMessage";

jest.mock("@ei-services/shared/eventbridge/client");

describe("pushEventBridgeMessage library", () => {
  describe("pushEventBridgeMessage()", () => {
    const client = { someFake: "eventbridge client" };

    jest.mocked(getEventBridgeClient).mockResolvedValue(client as never);

    const sendCustomEventsMock = jest
      .mocked(sendCustomEvents)
      .mockResolvedValue(123 as never);

    it("should call sendCustomEvents() with correct parameters", async () => {
      const messageInput: StockQuantityUpdatedMessageInput = {
        brand: "1234",
        sku: "some sku",
        quantity: 3,
        updateType: UPDATE_TYPE.INCREMENT,
        time: new Date("2022-06-16T14:27:40.092Z"),
      };

      const metadata: StockQuantityUpdatedMessageMetadata = {
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
                    sku: "some sku",
                    quantity: 3,
                    updateType: "increment",
                    time: "2022-06-16T14:27:40.092Z",
                  },
                  metadata: {
                    "x-emc-ubid": "1234",
                    "x-amzn-RequestId": "some api gateway request id",
                    "x-lambda-RequestId": "some lambda request id",
                  },
                }),
                DetailType: "stock.quantity.updated",
                EventBusName: "test-event-bus",
                Source:
                  "emc.stock-quantity-updates-sandbox-stockQuantityUpdateWebhook",
              },
            ],
          },
        })
      );
    });
  });
});
