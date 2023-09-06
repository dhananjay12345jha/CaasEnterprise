import { Context as LambdaContext } from "aws-lambda/handler";
import { validatePsk } from "@ei-services/services";
import { resolveBrandIdFromOms } from "@ei-services/brand-config";
import {
  ORDER_STATUS,
  EXPECTED_DELIVERY_WINDOW_TYPE,
  pushEventBridgeMessage,
} from "./pushEventBridgeMessage";
import ccpOrderStatusChangedWebhook, { HandlerEvent } from "./";

jest.mock("@ei-services/brand-config");
jest.mock("@ei-services/services");
jest.mock("./pushEventBridgeMessage");

describe("orderStatusChanged webhook handler", () => {
  const validPsk = "super$ecret";
  const requestContext = {
    requestId: "some api gateway request id",
  };

  const resolveBrandIdFromOmsMock = jest.mocked(resolveBrandIdFromOms);

  jest.mocked(validatePsk).mockImplementation((value) => {
    return Promise.resolve(value === validPsk);
  });

  describe("validators", () => {
    beforeEach(() =>
      resolveBrandIdFromOmsMock.mockImplementation((input) =>
        Promise.resolve(`${input}_transformed`)
      )
    );

    describe("Authorization header", () => {
      it("should return a 400 if Authorization header is not provided", async () => {
        const event: HandlerEvent = {
          requestContext,
          headers: {},
        } as never;

        const response = await ccpOrderStatusChangedWebhook(
          event,
          {} as LambdaContext
        );

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              errorType: "ValidationError",
              message: "Authorization header must be present.",
            }),
          ])
        );
      });

      it("should return a 400 if Authorization header is invalid", async () => {
        const event: HandlerEvent = {
          requestContext,
          headers: { authorization: "Bearer this-is-a-wrong-psk" },
        } as never;

        const response = await ccpOrderStatusChangedWebhook(
          event,
          {} as LambdaContext
        );

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              errorType: "ValidationError",
              message: "Invalid PSK provided.",
            }),
          ])
        );
      });
    });

    describe("Request body", () => {
      describe("time attr", () => {
        it("should return a 400 if 'time' attribute is not provided", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              brand: "1234",
              orderId: "some-order-id",
              status: { current: ORDER_STATUS.PLACED },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'time' attribute is not ISO_8601", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: "2022-06-24 08:46:18.576", // close, but not there yet
              brand: "1234",
              orderId: "some-order-id",
              status: { current: ORDER_STATUS.PLACED },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should not return a 400 if 'time' attribute is a valid ISO_8601", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: "2022-06-24T08:47:43.971Z",
              brand: "1234",
              orderId: "some-order-id",
              status: { current: ORDER_STATUS.PLACED },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).not.toBe(400);
        });
      });

      describe("brand attr", () => {
        it("should return a 400 if 'brand' is not provided", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              orderId: "some-order-id",
              status: { current: ORDER_STATUS.PLACED },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'brand' cannot get resolved to our internal brandId", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              brand: "will-not-be-found",
              time: new Date().toISOString(),
              orderId: "some-order-id",
              status: { current: ORDER_STATUS.PLACED },
            },
          } as never;

          // this will force zod.transform to register a custom error
          resolveBrandIdFromOmsMock.mockRejectedValue(
            new Error("association was not found")
          );

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
          expect(JSON.parse(response.body).error.details[0].message).toEqual(
            "Unregistered OMS brand provided"
          );
        });
      });

      describe("orderId attr", () => {
        it("should return a 400 if 'orderId' is not provided", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              status: { current: ORDER_STATUS.PLACED },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'orderId' is empty string", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "",
              status: { current: ORDER_STATUS.PLACED },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });
      });

      describe("status attr", () => {
        it("should return a 400 if 'status' is not provided", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'status.current' is not provided", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: { previous: ORDER_STATUS.PLACED },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'status.current' is not one of enum values", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: { current: "should fail" },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'status.previous' is not one of enum values", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: { current: ORDER_STATUS.PLACED, previous: "ooopsie" },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });
      });

      describe("delivery attr", () => {
        it("should return a 400 if 'delivery.courier' is empty", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                courier: {},
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.courier.companyName' is empty string", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                courier: {
                  companyName: "",
                },
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.lineItems[].sku' is not provided", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                lineItems: [
                  {
                    status: ORDER_STATUS.SHIPPED,
                    quantity: 1,
                    dispatchedQuantity: 1,
                  },
                ],
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.lineItems[].sku' is empty string", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                lineItems: [
                  {
                    sku: "",
                    status: ORDER_STATUS.SHIPPED,
                    quantity: 1,
                    dispatchedQuantity: 1,
                  },
                ],
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.lineItems[].status' is not provided", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                lineItems: [
                  {
                    sku: "123",
                    quantity: 1,
                    dispatchedQuantity: 1,
                  },
                ],
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.lineItems[].status' is not valid enum value", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                lineItems: [
                  {
                    sku: "123",
                    status: "martin wont fly",
                    quantity: 1,
                    dispatchedQuantity: 1,
                  },
                ],
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.lineItems[].quantity' is not provided", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                lineItems: [
                  {
                    sku: "123",
                    status: ORDER_STATUS.SHIPPED,
                    dispatchedQuantity: 1,
                  },
                ],
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.lineItems[].quantity' is not integer", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                lineItems: [
                  {
                    sku: "123",
                    status: ORDER_STATUS.SHIPPED,
                    quantity: 1.1,
                    dispatchedQuantity: 1,
                  },
                ],
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.lineItems[].quantity' is less than 1", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                lineItems: [
                  {
                    sku: "123",
                    status: ORDER_STATUS.SHIPPED,
                    quantity: 0,
                    dispatchedQuantity: 1,
                  },
                ],
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.lineItems[].dispatchedQuantity' is not provided", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                lineItems: [
                  {
                    sku: "123",
                    status: ORDER_STATUS.SHIPPED,
                    quantity: 1,
                  },
                ],
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.lineItems[].dispatchedQuantity' is not integer", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                lineItems: [
                  {
                    sku: "123",
                    status: ORDER_STATUS.SHIPPED,
                    quantity: 1,
                    dispatchedQuantity: 1.1,
                  },
                ],
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.lineItems[].dispatchedQuantity' is less than 0", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                lineItems: [
                  {
                    sku: "123",
                    status: ORDER_STATUS.SHIPPED,
                    quantity: 1,
                    dispatchedQuantity: -1,
                  },
                ],
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.trackingUrl' is empty string", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                trackingUrl: "",
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.trackingUrl' is not a URL", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                trackingUrl: "I'm not a url",
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.expectedDeliveryWindow.value' is not provided", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                expectedDeliveryWindow: {
                  type: EXPECTED_DELIVERY_WINDOW_TYPE.DAYS,
                },
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.expectedDeliveryWindow.value' is not integer", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                expectedDeliveryWindow: {
                  value: 1.1,
                  type: EXPECTED_DELIVERY_WINDOW_TYPE.DAYS,
                },
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.expectedDeliveryWindow.value' is less than 0", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                expectedDeliveryWindow: {
                  value: -1,
                  type: EXPECTED_DELIVERY_WINDOW_TYPE.DAYS,
                },
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });

        it("should return a 400 if 'delivery.expectedDeliveryWindow.type' is not valid enum value", async () => {
          const event: HandlerEvent = {
            requestContext,
            headers: { authorization: `Bearer ${validPsk}` },
            body: {
              time: new Date().toISOString(),
              brand: "1234",
              orderId: "some-order-id",
              status: {
                current: ORDER_STATUS.SHIPPED,
                previous: ORDER_STATUS.PLACED,
              },
              delivery: {
                expectedDeliveryWindow: {
                  value: 3,
                  type: "ooopsie",
                },
              },
            },
          } as never;

          const response = await ccpOrderStatusChangedWebhook(
            event,
            {} as LambdaContext
          );

          expect(response.statusCode).toBe(400);
        });
      });
    });
  });

  it("responds with a 200 statusCode when required headers and request body attrs are provided", async () => {
    const pushEventBridgeMessageMock = jest
      .mocked(pushEventBridgeMessage)
      .mockReset();

    const event: HandlerEvent = {
      requestContext,
      headers: { authorization: `Bearer ${validPsk}` },
      body: {
        time: new Date().toISOString(),
        brand: "1234",
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
      },
    } as never;

    const response = await ccpOrderStatusChangedWebhook(event, {
      awsRequestId: "some aws request id",
    } as LambdaContext);

    expect(response.statusCode).toBe(200);

    expect(pushEventBridgeMessageMock).toHaveBeenCalledTimes(1);
    expect(pushEventBridgeMessageMock).toHaveBeenCalledWith(
      {
        time: expect.any(Date),
        brand: "1234_transformed",
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
      },
      {
        amazonRequestId: "some api gateway request id",
        lambdaRequestId: "some aws request id",
      }
    );
  });
});
