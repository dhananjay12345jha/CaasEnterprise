import { v4 as uuid } from "uuid";
import { Context as LambdaContext } from "aws-lambda/handler";
import { default as updateOrder, HandlerEvent } from "./index";
import { updateOrderStatus } from "@ei-services/services";
import { LINE_ITEM_STATUS } from "@ei-services/common/middleware";
import userRegisteredHandler from "../../../../../crm/user-registered/src/functions/register-user/create";

jest.mock("@ei-services/services");

describe("orderUpdate status.changed handler", () => {
  const mockedUpdateOrder = updateOrderStatus as jest.Mock;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("should return a 400 if brandId (ubid) is missing", async () => {
    const event: HandlerEvent = {
      version: "1",
      id: uuid(),
      "detail-type": "order.status.changed",
      time: new Date().toString(),
      detail: {
        metadata: { "x-emc-ubid": null },
        payload: {},
      },
    };

    await expect(() =>
      updateOrder(event, {} as LambdaContext)
    ).rejects.toMatchSnapshot();
  });

  it("should return an error if payload is is missing orderId", async () => {
    const event: HandlerEvent = {
      version: "1",
      id: uuid(),
      "detail-type": "order.status.changed",
      time: new Date().toString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          status: {
            previous: "PLACED",
            current: "PLACED",
          },
          time: new Date().toString(),
          delivery: {
            lineItems: [
              {
                sku: "abc-123",
                status: LINE_ITEM_STATUS.PLACED,
                quantity: 1,
                dispatchedQuantity: 1,
              },
            ],
          },
        },
      },
    };

    try {
      await updateOrder(event, {} as LambdaContext);
      expect("1").toEqual(0);
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  it("should return an error if payload is is missing status", async () => {
    const event: HandlerEvent = {
      version: "1",
      id: uuid(),
      "detail-type": "order.status.changed",
      time: new Date().toString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          orderId: uuid(),
          time: new Date().toString(),
          delivery: {
            lineItems: [
              {
                sku: "abc-123",
                status: LINE_ITEM_STATUS.PLACED,
                quantity: 1,
                dispatchedQuantity: 1,
              },
            ],
          },
        },
      },
    };
    try {
      await updateOrder(event, {} as LambdaContext);
      expect("1").toEqual(0);
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  it("should return an error if payload is is missing time", async () => {
    const event: HandlerEvent = {
      version: "1",
      id: uuid(),
      "detail-type": "order.status.changed",
      time: new Date().toString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          orderId: uuid(),
          status: {
            previous: "PLACED",
            current: "PLACED",
          },
          delivery: {
            lineItems: [
              {
                sku: "abc-123",
                status: LINE_ITEM_STATUS.PLACED,
                quantity: 1,
                dispatchedQuantity: 1,
              },
            ],
          },
        },
      },
    };

    try {
      await updateOrder(event, {} as LambdaContext);
      expect("1").toEqual(0);
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  it("should return an updated order with a minimal payload", async () => {
    mockedUpdateOrder.mockResolvedValue({
      id: "foo",
    });

    const event: HandlerEvent = {
      version: "1",
      id: uuid(),
      "detail-type": "order.status.changed",
      time: new Date().toString(),
      detail: {
        metadata: { "x-emc-ubid": uuid() },
        payload: {
          orderId: uuid(),
          status: {
            previous: "PLACED",
            current: "PLACED",
          },
          time: new Date().toString(),
          delivery: {
            lineItems: [
              {
                sku: "abc-123",
                status: LINE_ITEM_STATUS.PLACED,
                quantity: 1,
                dispatchedQuantity: 1,
              },
            ],
          },
        },
      },
    };

    const response = await updateOrder(event, {} as LambdaContext);
    expect(response).toBeTruthy();
  });
});
