import axios from "axios";
import { connect } from "mqtt";

const waitUntilMessageReceived = async (mqttClient) => {
  return new Promise((resolve) => {
    mqttClient.on("message", (topic, message) => {
      resolve(JSON.parse(message.toString()));
    });
  });
};

describe("stockQuantityUpdate webhook lambda", () => {
  const endpointUrl = "http://localhost:3640/ccp/v1/stockquantityupdate";

  // Connect to MQTT server exposed by "serverless-offline-aws-eventbridge" plugin that imitates EventBridge
  // For more read: https://www.npmjs.com/package/serverless-offline-aws-eventbridge
  const eventBridgeMockClient = connect({ host: "localhost", port: 4641 });

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
        brand: "3402",
        sku: "45345234",
        quantity: 15,
        updateType: "increment",
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
        DetailType: "stock.quantity.updated",
        EventBusName: "test-event-bus",
        Source: "emc.stock-quantity-updates-local-stockQuantityUpdateWebhook",
      })
    );

    expect(detail).toEqual({
      payload: {
        sku: "45345234",
        quantity: 15,
        updateType: "increment",
        time: "2022-06-14T09:35:29.373Z",
      },
      metadata: {
        "x-emc-ubid": "7a733796-ae2c-4032-89f7-24d4c4179612",
        "x-amzn-RequestId": expect.any(String),
        "x-lambda-RequestId": expect.any(String),
      },
    });
  });
});
