import { faker } from "@faker-js/faker";
import { default as triggerOrderCreationNotificationHandler } from "./index";
import { Context as LambdaContext } from "aws-lambda/handler";
import { Index as InternalOrderCreatedEvent } from "@everymile-schemas/order-created";
import {
  generateFakeAddress,
  generateFakeLineItem,
  generateFakeMoney,
} from "./test-utils";

const triggerNotificationMock = jest.fn();

jest.mock("./trigger-order-confirmation-notification", () => {
  return {
    OrderConfirmation: jest.fn(() => {
      return {
        triggerNotification: triggerNotificationMock,
      };
    }),
  };
});

describe("trigger order confirmation notification handler", () => {
  beforeEach(() => jest.restoreAllMocks());

  const goodEvent: InternalOrderCreatedEvent = {
    version: "1.0",
    id: faker.datatype.uuid(),
    "detail-type": "order.created",
    time: faker.datatype.datetime().toISOString(),
    detail: {
      referenced: false,
      metadata: { "x-emc-ubid": "00000000-0000-0000-0000-000000000000" },
      correlationId: faker.datatype.uuid(),
      payload: {
        id: faker.datatype.uuid(),
        version: 1,
        createdAt: faker.datatype.datetime().toISOString(),
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney(),
        shippingAddress: generateFakeAddress(),
        billingAddress: generateFakeAddress(),
        lineItems: [],
        shippingInfo: { shippingMethodName: "STRD1" },
        orderState: "Open",
        customerEmail: "test@example.com",
        orderNumber: "order-1",
      },
    },
  };

  it("should throw an error if brand id is missing", async () => {
    const event: InternalOrderCreatedEvent = {
      ...goodEvent,
      detail: {
        ...goodEvent.detail,
        metadata: {
          ...goodEvent.detail.metadata,
          "x-emc-ubid": undefined,
        },
      },
    };

    try {
      await triggerOrderCreationNotificationHandler(event, {} as LambdaContext);
      throw Error("Failed test");
    } catch (e) {
      expect(e).toMatchObject({
        cause: [
          {
            instancePath: "/detail/metadata",
            keyword: "required",
            message: "must have required property x-emc-ubid",
            params: {
              missingProperty: "x-emc-ubid",
            },
            schemaPath: "#/$defs/Metadata/required",
          },
        ],
        expose: true,
        name: "BadRequestError",
        status: 400,
        statusCode: 400,
      });
      return;
    }
  });

  it("should return a confirmation response body and passes all input fields", async () => {
    triggerNotificationMock.mockResolvedValue(true);

    const lineItemOne = generateFakeLineItem(goodEvent.detail.payload.locale);
    const lineItemTwo = generateFakeLineItem(goodEvent.detail.payload.locale);
    const testEvent: InternalOrderCreatedEvent = {
      ...goodEvent,
      detail: {
        ...goodEvent.detail,
        payload: {
          ...goodEvent.detail.payload,
          lineItems: [lineItemOne, lineItemTwo],
        },
      },
    };

    await triggerOrderCreationNotificationHandler(
      testEvent,
      {} as LambdaContext
    );

    expect(triggerNotificationMock).toBeCalledTimes(1);
    expect(triggerNotificationMock).toBeCalledWith(
      "00000000-0000-0000-0000-000000000000",
      testEvent.detail.payload
    );
  });

  it("should throw an error when the triggerNotification throws an error", async () => {
    triggerNotificationMock.mockRejectedValue(
      new Error("Error while triggering")
    );
    const lineItemOne = generateFakeLineItem(goodEvent.detail.payload.locale);
    const lineItemTwo = generateFakeLineItem(goodEvent.detail.payload.locale);
    const testEvent: InternalOrderCreatedEvent = {
      ...goodEvent,
      detail: {
        ...goodEvent.detail,
        payload: {
          ...goodEvent.detail.payload,
          lineItems: [lineItemOne, lineItemTwo],
        },
      },
    };

    const promise = triggerOrderCreationNotificationHandler(
      testEvent,
      {} as LambdaContext
    );
    await expect(() => promise).rejects.toThrow(Error);
    await expect(() => promise).rejects.toThrow("Error while triggering");
  });
});
