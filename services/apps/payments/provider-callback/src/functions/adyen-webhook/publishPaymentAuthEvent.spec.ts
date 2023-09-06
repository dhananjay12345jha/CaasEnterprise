import { faker } from "@faker-js/faker";

// Set process env values as this is what is used in sub function
process.env.AWS_LAMBDA_FUNCTION_NAME = faker.datatype.string(10);
process.env.EVENT_BUS_NAME = faker.datatype.string(10);
process.env.BRAND_CONFIG_GQL_ENDPOINT = faker.internet.url();
process.env.IS_OFFLINE = "true";

import {
  getEventBridgeClient,
  sendCustomEvents,
} from "@ei-services/shared/eventbridge/client";
import { publishPaymentAuthEvent } from "./publishPaymentAuthEvent";
import { AdyenAuthWebhookEvent } from "@ei-services/common/middleware";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

jest.mock("@ei-services/shared/eventbridge/client");

const clientSetupSpy = jest.mocked(getEventBridgeClient);
const sendEventMock = jest.mocked(sendCustomEvents);

const dummyMerchantCode = faker.datatype.uuid();
const dummyAdyenEvent: AdyenAuthWebhookEvent = {
  notificationItems: [
    {
      NotificationRequestItem: {
        amount: {
          currency: "GBP",
          value: faker.datatype.number(),
        },
        eventCode: "",
        eventDate: new Date().toString(),
        merchantAccountCode: dummyMerchantCode,
        merchantReference: faker.datatype.string(),
        originalReference: faker.datatype.string(),
        paymentMethod: faker.datatype.string(),
        pspReference: faker.datatype.string(),
        reason: faker.datatype.string(),
        success: faker.datatype.string(),
        additionalData: {
          ["metadata.brandId"]: dummyMerchantCode,
          ["metadata.cartId"]: faker.datatype.string(),
          ["metadata.cartDigest"]: faker.datatype.string(),
        },
      },
    },
  ],
  live: "true",
};
const dummyMetadata = {
  amazonRequestId: faker.datatype.uuid(),
  lambdaRequestId: faker.datatype.uuid(),
};

beforeEach(() => {
  jest.resetAllMocks();
  clientSetupSpy.mockResolvedValue(new EventBridgeClient({}));
  sendEventMock.mockResolvedValue({ $metadata: {} });
});

describe("Publish Payment Auth Event", () => {
  test("Creates expected inputs and sends them to publishing client", async () => {
    await publishPaymentAuthEvent(dummyAdyenEvent, dummyMetadata);

    expect(clientSetupSpy).toHaveBeenCalledTimes(1);
    expect(clientSetupSpy.mock.calls[0]).toEqual([{ maxAttempts: 3 }]);

    expect(sendEventMock).toHaveBeenCalledTimes(1);
    expect(sendEventMock.mock.calls[0][1].input).toEqual({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME,
          Source: `emc.${process.env.AWS_LAMBDA_FUNCTION_NAME}`,
          DetailType: "payment.order.auth.accepted",
          Detail: JSON.stringify({
            payload: dummyAdyenEvent,
            metadata: {
              "x-emc-ubid": dummyMerchantCode,
              "x-amzn-RequestId": dummyMetadata.amazonRequestId,
              "x-lambda-RequestId": dummyMetadata.lambdaRequestId,
            },
          }),
        },
      ],
    });
  });
});
