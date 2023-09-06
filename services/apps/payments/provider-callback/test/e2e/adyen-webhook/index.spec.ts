import { AdyenAuthWebhookEvent } from "@ei-services/common/middleware";
import { faker } from "@faker-js/faker";
import axios from "axios";

const endpointUrl = [
  "http://localhost:",
  process.env.HTTP_SERVER_PORT,
  "/adyen-notifications/v1/payments",
].join("");

describe("paymentAuthorisation webhook lambda", () => {
  it(`calling: ${endpointUrl} with correct body gives 200 status code`, async () => {
    const mockEvntPayload: AdyenAuthWebhookEvent = {
      live: "false",
      notificationItems: [
        {
          NotificationRequestItem: {
            amount: {
              currency: "GBP",
              value: faker.datatype.number(),
            },
            eventCode: faker.datatype.string(),
            eventDate: faker.datatype.datetime().toDateString(),
            merchantAccountCode: faker.datatype.string(),
            merchantReference: faker.datatype.string(),
            paymentMethod: faker.datatype.string(),
            pspReference: faker.datatype.string(),
            success: faker.datatype.string(),
            additionalData: {
              checkoutSessionId: faker.datatype.string(),
              "metadata.cartId": faker.datatype.uuid(),
              "metadata.brandId": faker.datatype.uuid(),
              "metadata.cartDigest": faker.datatype.string(),
            },
          },
        },
      ],
    };

    const response = await axios({
      method: "POST",
      url: endpointUrl,
      data: mockEvntPayload,
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual("[accepted]");
  });
});
