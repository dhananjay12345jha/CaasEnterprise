import axios from "axios";
import { connect } from "mqtt";
import { ORDER_STATUS } from "../../../src/functions/order-status-changed/pushEventBridgeMessage";

const waitUntilMessageReceived = async (mqttClient) => {
  return new Promise((resolve) => {
    mqttClient.on("message", (topic, message) => {
      resolve(JSON.parse(message.toString()));
    });
  });
};

describe("orderStatusChanged webhook lambda", () => {
  const endpointUrl = "http://localhost:3442/ccp/v1/orderstatuschanged";

  // Connect to MQTT server exposed by "serverless-offline-aws-eventbridge" plugin that imitates EventBridge
  // For more read: https://www.npmjs.com/package/serverless-offline-aws-eventbridge
  const eventBridgeMockClient = connect({ host: "localhost", port: 4443 });

  beforeAll(() => {
    return new Promise((resolve) => {
      eventBridgeMockClient.on("connect", () => {
        eventBridgeMockClient.subscribe("eventBridge", resolve);
      });
    });
  });

  it("should produce EventBridge message to a correct eventBus and respond with a 200 status code", async () => {
    const response = await axios({
      method: "PUT",
      url: endpointUrl,
      headers: {
        Authorization: "Bearer super$ecret",
      },
      data: {
        time: "2022-06-14T09:35:29.373Z",
        brand: "1234",
        orderId: "331122332211",
        status: {
          current: ORDER_STATUS.SHIPPED,
          previous: ORDER_STATUS.PLACED,
        },
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({});

    const receivedMessages = await waitUntilMessageReceived(
      eventBridgeMockClient
    );

    const detail = JSON.parse(receivedMessages[0].Detail);

    expect(receivedMessages[0]).toEqual(
      expect.objectContaining({
        DetailType: "order.status.changed",
        EventBusName: "test-event-bus",
        Source: "emc.orders-status-changes-local-stockQuantityUpdateWebhook",
      })
    );

    expect(detail).toEqual({
      payload: {
        time: "2022-06-14T09:35:29.373Z",
        orderId: "331122332211",
        status: {
          current: ORDER_STATUS.SHIPPED,
          previous: ORDER_STATUS.PLACED,
        },
      },
      metadata: {
        "x-emc-ubid": "7a733796-ae2c-4032-89f7-24d4c4179612",
        "x-amzn-RequestId": expect.any(String),
        "x-lambda-RequestId": expect.any(String),
      },
    });
  });
});
