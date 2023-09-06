import { BRAZE_CONFIG_KEYS } from "@ei-services/brand-config";
import {
  BrazeClient,
  BrazeApiClientConfig,
  OrderDispatchedSendRequest,
  OrderDispatchedRecipient,
} from "@ei-services/braze-service";
import {
  z,
  orderDispatchedEventPayloadSchema,
} from "@ei-services/common/middleware";
import { Address, Order as CTOrder } from "@commercetools/platform-sdk";
import { CRMBaseClass, getOrderByOrderId } from "@ei-services/services";
import { strict as assert } from "assert";

export type OrderDispatchedMessage = z.infer<
  typeof orderDispatchedEventPayloadSchema
>;

export class OrderDispatched extends CRMBaseClass {
  async triggerNotification(
    brandId: string,
    orderDispatchedMessage: OrderDispatchedMessage
  ): Promise<void> {
    const { orderId } = orderDispatchedMessage;
    const order: CTOrder = await getOrderByOrderId({
      orderId,
      brandId,
    });

    if (!this.shouldTriggerNotification(order)) {
      console.log(
        `Order has shipment state of "${order.shipmentState}", exiting`
      );
      return;
    }

    const brazeServiceConfig = await this.getBrazeServiceConfig(brandId, {
      apiKey: BRAZE_CONFIG_KEYS.API_KEY,
      baseURL: BRAZE_CONFIG_KEYS.API_BASE_URL,
      orderDispatchedCanvasId: BRAZE_CONFIG_KEYS.ORDER_DISPATCH_CANVAS_ID,
    });

    const canvasId = brazeServiceConfig.orderDispatchedCanvasId;

    if (!canvasId) {
      throw new Error("No canvas ID configured, exiting");
    }

    const brazeApiClientConfig: BrazeApiClientConfig = {
      apiKey: brazeServiceConfig.apiKey,
      baseURL: brazeServiceConfig.baseURL,
      shouldRetry: true,
    };
    const brazeClient = new BrazeClient(brazeApiClientConfig);

    console.info("build Braze order dispatched request message");
    const message = await this.buildOrderDispatchedNotificationRequest(
      brandId,
      canvasId,
      order
    );

    console.debug(
      "Triggering CRM canvas trigger endpoint with order dispatch request:",
      JSON.stringify(message)
    );
    const response = await brazeClient.canvasTriggerSend(message);
    console.debug(
      "Received response from CRM canvas trigger endpoint:",
      JSON.stringify(response)
    );
  }

  private shouldTriggerNotification(order: CTOrder): boolean {
    switch (order.shipmentState) {
      case "Partial":
      case "Shipped":
        return true;
      default:
        return false;
    }
  }

  private async buildOrderDispatchedNotificationRequest(
    brandId: string,
    canvasId: string,
    order: CTOrder
  ): Promise<OrderDispatchedSendRequest> {
    console.info("construct braze recipients object");
    const recipients = this.buildRecipientsPayload(brandId, order);

    return {
      canvas_id: canvasId,
      recipients,
    };
  }

  private buildRecipientsPayload(
    brandId: string,
    order: CTOrder
  ): OrderDispatchedRecipient[] {
    const {
      customerId,
      shippingInfo,
      shippingAddress,
      billingAddress,
      orderNumber,
    } = order;
    const isRegisteredCustomer = !!customerId;

    assert.ok(orderNumber, "Expected 'orderNumber' to be defined");
    assert.ok(billingAddress, "Expected 'billingAddress' to be defined");
    assert.ok(shippingAddress, "Expected 'shippingAddress' to be defined");
    assert.ok(shippingInfo, "Expected 'shippingInfo' to be defined");

    const orderRecipient: OrderDispatchedRecipient = {
      canvas_entry_properties: {
        order: {
          order_number: orderNumber,
        },
        billing: {
          title: billingAddress.title || "",
          first_name: billingAddress.firstName || "",
          last_name: billingAddress.lastName || "",
        },
        shipping: {
          first_name: shippingAddress.firstName || "" || "",
          last_name: shippingAddress.lastName || "",
          delivery_method: shippingInfo.shippingMethodName || "",
          address_line1: this.formatAddressLine1(shippingAddress),
          address_line2: shippingAddress.additionalStreetInfo || "",
          county: shippingAddress.region || "",
          city: shippingAddress.city || "",
          postcode: shippingAddress.postalCode || "",
        },
      },
      send_to_existing_only: true,
    };

    if (isRegisteredCustomer) {
      orderRecipient.external_user_id = this.buildExternalId(
        brandId,
        customerId
      );
    } else {
      orderRecipient.user_alias = this.buildUserAlias(brandId, orderNumber);
    }

    return [orderRecipient];
  }

  private formatAddressLine1(shippingAddress: Address): string {
    return [shippingAddress.streetNumber, shippingAddress.streetName]
      .filter(Boolean)
      .join(" ");
  }
}
