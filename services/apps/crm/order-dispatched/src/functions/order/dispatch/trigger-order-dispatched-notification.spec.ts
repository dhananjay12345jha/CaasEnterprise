import { faker } from "@faker-js/faker";
import nock from "nock";
import { Order } from "@commercetools/platform-sdk";

import { BrazeClient } from "@ei-services/braze-service";
import {
  BrandConfigCachedClient,
  BRAZE_CONFIG_KEYS,
} from "@ei-services/brand-config";

import {
  OrderDispatched,
  OrderDispatchedMessage,
} from "./trigger-order-dispatched-notification";
import { getOrderByOrderId } from "@ei-services/services";
import ctOrderPayload from "./__fixtures__/ctOrderPayload.json";

jest.mock("@ei-services/services", () => {
  const actual = jest.requireActual("@ei-services/services");
  const orderPayload = jest.requireActual("./__fixtures__/ctOrderPayload.json");
  const { customerId, ...guestOrderPayload } = orderPayload;
  const invalidShipmentStateOrder = Object.assign({}, orderPayload);
  invalidShipmentStateOrder.shipmentState = "Delayed";
  const {
    billingAddress,
    shippingAddress,
    shippingInfo,
    ...missingPropsOrderPayload
  } = orderPayload;
  const missingProperties = Object.assign(
    { billingAddress: {}, shippingAddress: {}, shippingInfo: {} },
    missingPropsOrderPayload
  );

  return {
    ...actual,
    getOrderByOrderId: jest
      .fn()
      .mockResolvedValueOnce(orderPayload)
      .mockResolvedValueOnce(invalidShipmentStateOrder)
      .mockResolvedValueOnce(orderPayload)
      .mockResolvedValueOnce(missingProperties)
      .mockResolvedValueOnce(guestOrderPayload),
  };
});

describe("TriggerOrderDispatchedEmail", () => {
  let instance: OrderDispatched;
  let brazeClientMock: any;
  let brandConfigClientMock: any;

  const brandId = faker.datatype.uuid();
  const canvasId = faker.datatype.uuid();
  const countryCode = faker.datatype.string(2);
  const apiKey = faker.datatype.string();
  const apiUrl = faker.internet.url();
  const orderId = faker.datatype.uuid();
  const orderVersion = faker.datatype.number(10);
  const previousShipmentState = "Ready";
  const newShipmentState = "Shipped";

  const expectedResponse = {
    dispatch_id: faker.datatype.uuid(),
  };

  const orderDispatchedMessage: OrderDispatchedMessage = {
    orderId,
    orderVersion,
    previousShipmentState,
    newShipmentState,
  };

  beforeEach(() => {
    nock.disableNetConnect();

    jest.restoreAllMocks();

    brandConfigClientMock = jest
      .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
      .mockReturnThis()
      .mockResolvedValueOnce({
        [BRAZE_CONFIG_KEYS.API_KEY]: apiKey,
        [BRAZE_CONFIG_KEYS.API_BASE_URL]: apiUrl,
        [BRAZE_CONFIG_KEYS.DEFAULT_COUNTRY_CODE]: countryCode,
        [BRAZE_CONFIG_KEYS.ORDER_DISPATCH_CANVAS_ID]: canvasId,
      });

    brazeClientMock = jest.spyOn(BrazeClient.prototype, "canvasTriggerSend");

    instance = new OrderDispatched();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe("error cases", () => {
    beforeEach(() => {
      brandConfigClientMock.mockRestore();

      brandConfigClientMock = jest
        .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
        .mockReturnThis()
        .mockResolvedValueOnce({
          [BRAZE_CONFIG_KEYS.API_KEY]: apiKey,
          [BRAZE_CONFIG_KEYS.API_BASE_URL]: apiUrl,
          [BRAZE_CONFIG_KEYS.DEFAULT_COUNTRY_CODE]: countryCode,
        });
    });

    it("should throw error if no canvas id is configured", async () => {
      await expect(
        instance.triggerNotification(brandId, orderDispatchedMessage)
      ).rejects.toThrow();
    });

    it("should exit if order shipment state is invalid", async () => {
      await expect(
        instance.triggerNotification(brandId, orderDispatchedMessage)
      ).resolves.toBeFalsy();
    });
  });

  it("should check if order is in valid state to trigger notification", () => {
    let order = { shipmentState: "Partial" } as Order;
    expect((instance as any).shouldTriggerNotification(order)).toBe(true);
    order = { shipmentState: "Delayed" } as Order;
    expect((instance as any).shouldTriggerNotification(order)).toBe(false);
  });

  it("should call Braze with the relevant payload to trigger order dispatched email for registered user", async () => {
    nock(apiUrl).post("/canvas/trigger/send").reply(200, expectedResponse);

    await instance.triggerNotification(brandId, orderDispatchedMessage);

    expect(brazeClientMock).toBeCalledWith({
      canvas_id: canvasId,
      recipients: [
        {
          external_user_id: `${brandId}:${ctOrderPayload.customerId}`,
          canvas_entry_properties: {
            order: {
              order_number: `${ctOrderPayload.orderNumber}`,
            },
            billing: {
              title: ctOrderPayload.billingAddress.title,
              first_name: ctOrderPayload.billingAddress.firstName,
              last_name: ctOrderPayload.billingAddress.lastName,
            },
            shipping: {
              first_name: ctOrderPayload.shippingAddress.firstName,
              last_name: ctOrderPayload.shippingAddress.lastName,
              delivery_method: ctOrderPayload.shippingInfo.shippingMethodName,
              address_line1: `${ctOrderPayload.shippingAddress.streetNumber} ${ctOrderPayload.shippingAddress.streetName}`,
              address_line2:
                ctOrderPayload.shippingAddress.additionalStreetInfo,
              county: ctOrderPayload.shippingAddress.region,
              city: ctOrderPayload.shippingAddress.city,
              postcode: ctOrderPayload.shippingAddress.postalCode,
            },
          },
          send_to_existing_only: true,
        },
      ],
    });
  });

  it("should default Braze payload to empty strings if value isn't available", async () => {
    nock(apiUrl).post("/canvas/trigger/send").reply(200, expectedResponse);

    await instance.triggerNotification(brandId, orderDispatchedMessage);

    expect(brazeClientMock).toBeCalledWith({
      canvas_id: canvasId,
      recipients: [
        {
          external_user_id: `${brandId}:${ctOrderPayload.customerId}`,
          canvas_entry_properties: {
            order: {
              order_number: `${ctOrderPayload.orderNumber}`,
            },
            billing: {
              title: "",
              first_name: "",
              last_name: "",
            },
            shipping: {
              first_name: "",
              last_name: "",
              delivery_method: "",
              address_line1: "",
              address_line2: "",
              county: "",
              city: "",
              postcode: "",
            },
          },
          send_to_existing_only: true,
        },
      ],
    });
  });

  it("should call Braze with the relevant payload to trigger order dispatched email for guest user", async () => {
    nock(apiUrl).post("/canvas/trigger/send").reply(200, expectedResponse);

    const userAlias = (instance as any).buildUserAlias(
      brandId,
      ctOrderPayload.orderNumber
    );

    await instance.triggerNotification(brandId, orderDispatchedMessage);

    expect(brazeClientMock).toBeCalledWith({
      canvas_id: canvasId,
      recipients: [
        {
          user_alias: userAlias,
          canvas_entry_properties: {
            order: {
              order_number: `${ctOrderPayload.orderNumber}`,
            },
            billing: {
              title: ctOrderPayload.billingAddress.title,
              first_name: ctOrderPayload.billingAddress.firstName,
              last_name: ctOrderPayload.billingAddress.lastName,
            },
            shipping: {
              first_name: ctOrderPayload.shippingAddress.firstName,
              last_name: ctOrderPayload.shippingAddress.lastName,
              delivery_method: ctOrderPayload.shippingInfo.shippingMethodName,
              address_line1: `${ctOrderPayload.shippingAddress.streetNumber} ${ctOrderPayload.shippingAddress.streetName}`,
              address_line2:
                ctOrderPayload.shippingAddress.additionalStreetInfo,
              county: ctOrderPayload.shippingAddress.region,
              city: ctOrderPayload.shippingAddress.city,
              postcode: ctOrderPayload.shippingAddress.postalCode,
            },
          },
          send_to_existing_only: true,
        },
      ],
    });
  });
});
