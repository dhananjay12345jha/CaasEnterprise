import { Context as LambdaContext } from "aws-lambda/handler";
import { validatePsk } from "@ei-services/services";
import { resolveBrandIdFromOms } from "@ei-services/brand-config";
import { UPDATE_TYPE, pushEventBridgeMessage } from "./pushEventBridgeMessage";
import ccpStockQuantityUpdateWebhook, { HandlerEvent } from "./";

jest.mock("@ei-services/brand-config");
jest.mock("@ei-services/services");
jest.mock("./pushEventBridgeMessage");

describe("stockQuantityUpdate webhook handler", () => {
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

        const response = await ccpStockQuantityUpdateWebhook(
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

        const response = await ccpStockQuantityUpdateWebhook(
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
      it("should return a 400 if 'time' attribute is not provided", async () => {
        const event: HandlerEvent = {
          requestContext,
          headers: { authorization: `Bearer ${validPsk}` },
          body: {
            brand: "1234",
            sku: "some-sku",
            quantity: 15,
            updateType: UPDATE_TYPE.DECREMENT,
          },
        } as never;

        const response = await ccpStockQuantityUpdateWebhook(
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
            sku: "some-sku",
            quantity: 15,
            updateType: UPDATE_TYPE.DECREMENT,
          },
        } as never;

        const response = await ccpStockQuantityUpdateWebhook(
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
            sku: "some-sku",
            quantity: 15,
            updateType: UPDATE_TYPE.DECREMENT,
          },
        } as never;

        const response = await ccpStockQuantityUpdateWebhook(
          event,
          {} as LambdaContext
        );

        expect(response.statusCode).not.toBe(400);
      });

      it("should return a 400 if 'brand' is not provided", async () => {
        const event: HandlerEvent = {
          requestContext,
          headers: { authorization: `Bearer ${validPsk}` },
          body: {
            time: new Date().toISOString(),
            sku: "some-sku",
            quantity: 15,
            updateType: UPDATE_TYPE.DECREMENT,
          },
        } as never;

        const response = await ccpStockQuantityUpdateWebhook(
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
            sku: "some-sku",
            quantity: 15,
            updateType: UPDATE_TYPE.DECREMENT,
          },
        } as never;

        // this will force zod.transform to register a custom error
        resolveBrandIdFromOmsMock.mockRejectedValue(
          new Error("association was not found")
        );

        const response = await ccpStockQuantityUpdateWebhook(
          event,
          {} as LambdaContext
        );

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.details[0].message).toEqual(
          "Unregistered OMS brand provided"
        );
      });

      it("should return a 400 if 'sku' is not provided", async () => {
        const event: HandlerEvent = {
          requestContext,
          headers: { authorization: `Bearer ${validPsk}` },
          body: {
            time: new Date().toISOString(),
            brand: "1234",
            quantity: 15,
            updateType: UPDATE_TYPE.DECREMENT,
          },
        } as never;

        const response = await ccpStockQuantityUpdateWebhook(
          event,
          {} as LambdaContext
        );

        expect(response.statusCode).toBe(400);
      });

      it("should return a 400 if 'quantity' is not provided", async () => {
        const event: HandlerEvent = {
          requestContext,
          headers: { authorization: `Bearer ${validPsk}` },
          body: {
            time: new Date().toISOString(),
            brand: "1234",
            sku: "some-sku",
            updateType: UPDATE_TYPE.DECREMENT,
          },
        } as never;

        const response = await ccpStockQuantityUpdateWebhook(
          event,
          {} as LambdaContext
        );

        expect(response.statusCode).toBe(400);
      });

      it("should return a 400 if 'quantity' is below 0", async () => {
        const event: HandlerEvent = {
          requestContext,
          headers: { authorization: `Bearer ${validPsk}` },
          body: {
            time: new Date().toISOString(),
            brand: "1234",
            quantity: -1,
            sku: "some-sku",
            updateType: UPDATE_TYPE.DECREMENT,
          },
        } as never;

        const response = await ccpStockQuantityUpdateWebhook(
          event,
          {} as LambdaContext
        );

        expect(response.statusCode).toBe(400);
      });

      it("should return a 400 if 'quantity' is not integer", async () => {
        const event: HandlerEvent = {
          requestContext,
          headers: { authorization: `Bearer ${validPsk}` },
          body: {
            time: new Date().toISOString(),
            brand: "1234",
            quantity: 3.14,
            sku: "some-sku",
            updateType: UPDATE_TYPE.DECREMENT,
          },
        } as never;

        const response = await ccpStockQuantityUpdateWebhook(
          event,
          {} as LambdaContext
        );

        expect(response.statusCode).toBe(400);
      });

      it("should return a 400 if 'updateType' is not one of valid enum values", async () => {
        const event: HandlerEvent = {
          requestContext,
          headers: { authorization: `Bearer ${validPsk}` },
          body: {
            time: new Date().toISOString(),
            brand: "1234",
            quantity: 3.14,
            sku: "some-sku",
            updateType: "ooopsie",
          },
        } as never;

        const response = await ccpStockQuantityUpdateWebhook(
          event,
          {} as LambdaContext
        );

        expect(response.statusCode).toBe(400);
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
        sku: "some-sku",
        quantity: 15,
        updateType: UPDATE_TYPE.DECREMENT,
      },
    } as never;

    const response = await ccpStockQuantityUpdateWebhook(event, {
      awsRequestId: "some aws request id",
    } as LambdaContext);

    expect(response.statusCode).toBe(200);

    expect(pushEventBridgeMessageMock).toHaveBeenCalledTimes(1);
    expect(pushEventBridgeMessageMock).toHaveBeenCalledWith(
      {
        brand: "1234_transformed",
        quantity: 15,
        sku: "some-sku",
        time: expect.any(Date),
        updateType: "decrement",
      },
      {
        amazonRequestId: "some api gateway request id",
        lambdaRequestId: "some aws request id",
      }
    );
  });
});
