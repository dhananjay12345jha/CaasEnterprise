import { Context as LambdaContext } from "aws-lambda/handler";
import * as publishPaymentAuthEventHandler from "./publishPaymentAuthEvent";
import paymentAuthHandler from "./index";
import { faker } from "@faker-js/faker";
import { AdyenAuthWebhookEvent } from "@ei-services/common/middleware";
import { dlqClient } from "./singletons";
import { getEventBridgeClient } from "@ei-services/shared/eventbridge/client";

jest.mock("@ei-services/shared/eventbridge/client");
jest.mock("./singletons");
const dlqClientPublishMock = jest.mocked(dlqClient.publish);
describe("Adyen webhook", () => {
  afterEach(() => {
    dlqClientPublishMock.mockClear();
  });
  const requestContext = {
    requestId: "some api gateway request id",
  };
  const mockEventPayload: AdyenAuthWebhookEvent = {
    live: "false",
    notificationItems: [
      {
        NotificationRequestItem: {
          amount: {
            currency: "GBP",
            value: faker.datatype.number(),
          },
          eventCode: "",
          eventDate: new Date().toString(),
          merchantAccountCode: faker.datatype.uuid(),
          merchantReference: faker.datatype.string(),
          originalReference: faker.datatype.string(),
          paymentMethod: faker.datatype.string(),
          pspReference: faker.datatype.string(),
          reason: faker.datatype.string(),
          success: faker.datatype.string(),
          additionalData: {
            checkoutSessionId: faker.datatype.uuid(),
            ["metadata.brandId"]: faker.datatype.uuid(),
            ["metadata.cartId"]: faker.datatype.string(),
            ["metadata.cartDigest"]: faker.datatype.string(),
          },
        },
      },
    ],
  };

  const validPsk = "super$ecret";

  describe("WHEN called", () => {
    describe("WITH valid payload", () => {
      it("responds with a 200 statusCode", async () => {
        const event = {
          requestContext,
          headers: { authorization: `Bearer ${validPsk}` },
          body: mockEventPayload,
        };
        jest
          .spyOn(publishPaymentAuthEventHandler, "publishPaymentAuthEvent")
          .mockImplementationOnce(() =>
            Promise.resolve({
              FailedEntryCount: 0,
              Entries: [],
              $metadata: {
                httpStatusCode: 200,
              },
            })
          );

        const response = await paymentAuthHandler(event, {
          awsRequestId: "some aws request id",
        } as LambdaContext);

        expect(response.statusCode).toBe(200);

        expect(
          publishPaymentAuthEventHandler.publishPaymentAuthEvent
        ).toHaveBeenCalledTimes(1);
        expect(
          publishPaymentAuthEventHandler.publishPaymentAuthEvent
        ).toHaveBeenCalledWith(mockEventPayload, {
          amazonRequestId: "some api gateway request id",
          lambdaRequestId: "some aws request id",
        });
      });
    });
  });
  describe("WITH invalid payload", () => {
    it("responds with a 200 when body is empty or invalid", async () => {
      const event = {
        requestContext: {},
        body: {},
      } as never;

      jest
        .spyOn(publishPaymentAuthEventHandler, "publishPaymentAuthEvent")
        .mockImplementationOnce(() =>
          Promise.resolve({
            FailedEntryCount: 0,
            Entries: [],
            $metadata: {
              httpStatusCode: 200,
            },
          })
        );

      const response = await paymentAuthHandler(event, {
        awsRequestId: "some aws request id",
      } as LambdaContext);
      expect(response.statusCode).toBe(200);
    });
  });
  describe("AND error occurs", () => {
    it("SHOULD call the publish method of the DLQ client AND return without throwing", async () => {
      jest
        .mocked(getEventBridgeClient)
        .mockRejectedValueOnce(new Error("test"));
      const event = {
        requestContext: {},
        body: {
          notificationItems: [
            {
              NotificationRequestItem: {
                additionalData: {
                  checkoutSessionId: "some-id",
                  "metadata.cartId": "cart-id",
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
      } as never;
      await paymentAuthHandler(event, {
        awsRequestId: "some aws request id",
      } as LambdaContext);
      expect(dlqClient.publish).toHaveBeenCalledTimes(1);
      expect(dlqClient.publish).toHaveBeenCalledWith({
        event: event,
        rejectionReason: {
          errorMessage: "test",
          errorName: "Error",
        },
      });
    });
  });
});
