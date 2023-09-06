import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import axios from "axios";

const ebClientConfig = {
  ...(process.env.AWS_LOCAL_EVENTBRIDGE_ENDPOINT
    ? { endpoint: process.env.AWS_LOCAL_EVENTBRIDGE_ENDPOINT }
    : null),
};

const ebClient = new EventBridgeClient(ebClientConfig);

const CT_MOCK_URL = process.env.CT_MOCK_URL;

describe("Create CT Order", () => {
  const brandId = "746120b5-702d-44a1-9c7e-e8c46b3a6e17";
  const cartId = "ab46db01-3e5c-4e9e-a50a-76f811b357c4";
  const projectKey = "some-project-key";

  beforeEach(() => sendEvent(brandId, cartId));

  it("should convert a cart to an order", async () => {
    const orderId = "ab46db01-3e5c-4e9e-a50a-76f811b357c4";
    const orderNumber = "7098638243";

    const response = await axios({
      method: "GET",
      url: `${CT_MOCK_URL}/commercetools/${projectKey}/orders/${orderId}`,
      headers: { Authorization: "Bearer faketoken2" },
    });

    expect(response.data.orderState).toEqual("Ordered");
    expect(response.data.id).toEqual(orderId);
    expect(response.data.orderNumber).toEqual(orderNumber);
  });
});

const sendEvent = async (brandId: string, cartId: string) => {
  const command = new PutEventsCommand({
    Entries: [
      {
        Time: new Date(),
        DetailType: "payment.order.auth.accepted",
        Detail: JSON.stringify({
          payload: {
            notificationItems: [
              {
                NotificationRequestItem: {
                  additionalData: {
                    checkoutSessionId: "some-id",
                    "metadata.cartId": cartId,
                    "metadata.cartDigest": "some-hash",
                  },
                  merchantReference: "some-merchant-reference",
                  success: "true",
                  amount: {
                    currency: "GBP",
                    value: 4000,
                  },
                  pspReference: "some-reference",
                  eventCode: "AUTHORISATION",
                  eventDate: new Date(),
                },
              },
            ],
            live: "true",
          },
          metadata: {
            "x-emc-ubid": brandId,
          },
        }),
        EventBusName: "localhost-transact-bus",
      },
    ],
  });

  return await ebClient.send(command);
};
