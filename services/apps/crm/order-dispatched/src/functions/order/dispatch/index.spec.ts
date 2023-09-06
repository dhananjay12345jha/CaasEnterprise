import { faker } from "@faker-js/faker";
import {
  default as triggerOrderDispatchedNotificationHandler,
  HandlerEvent,
} from "./index";
import { Context as LambdaContext } from "aws-lambda/handler";

const triggerNotificationMock = jest.fn();

jest.mock("./trigger-order-dispatched-notification", () => {
  const { OrderDispatched } = jest.requireActual(
    "./trigger-order-dispatched-notification"
  );
  return {
    OrderDispatched: jest.fn(() => {
      return {
        ...OrderDispatched,
        triggerNotification: triggerNotificationMock,
      };
    }),
  };
});

describe("trigger order dispatched notification handler", () => {
  const expectedResponse = {
    dispatch_id: faker.datatype.uuid(),
  };

  beforeEach(() => jest.restoreAllMocks());

  it("should throw an error if brand id is missing", async () => {
    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.string(),
      "detail-type": "order.shipment.changed",
      time: faker.datatype.string(),
      detail: {
        referenced: false,
        metadata: { "x-emc-ubid": null },
        correlationId: faker.datatype.uuid(),
        payload: {
          orderId: faker.datatype.string(),
          orderVersion: 4,
          previousShipmentState: "Ready",
          newShipmentState: "Shipped",
        },
      },
    };

    await expect(() =>
      triggerOrderDispatchedNotificationHandler(event, {} as LambdaContext)
    ).rejects.toMatchSnapshot();
  });

  it("should return a dispatched response body and passes all input fields", async () => {
    triggerNotificationMock.mockResolvedValue(expectedResponse);

    const brandId = faker.datatype.uuid();

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.uuid(),
      "detail-type": "order.shipment.changed",
      time: faker.datatype.string(),
      detail: {
        referenced: false,
        metadata: { "x-emc-ubid": brandId },
        correlationId: faker.datatype.uuid(),
        payload: {
          orderId: faker.datatype.string(),
          orderVersion: 4,
          previousShipmentState: "Ready",
          newShipmentState: "Shipped",
        },
      },
    };

    const response = await triggerOrderDispatchedNotificationHandler(
      event,
      {} as LambdaContext
    );

    expect(response).toBe(expectedResponse);
    expect(triggerNotificationMock).toBeCalledTimes(1);
    expect(triggerNotificationMock).toBeCalledWith(
      brandId,
      event.detail.payload
    );
  });

  it("should throw an error if something went wrong", async () => {
    triggerNotificationMock.mockImplementation(() => {
      throw new Error();
    });

    const brandId = faker.datatype.uuid();

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.uuid(),
      "detail-type": "order.shipment.changed",
      time: faker.datatype.string(),
      detail: {
        referenced: false,
        metadata: { "x-emc-ubid": brandId },
        correlationId: faker.datatype.uuid(),
        payload: {
          orderId: faker.datatype.string(),
          orderVersion: 4,
          previousShipmentState: "Ready",
          newShipmentState: "Shipped",
        },
      },
    };

    await expect(() =>
      triggerOrderDispatchedNotificationHandler(event, {} as LambdaContext)
    ).rejects.toThrow();
  });
});
