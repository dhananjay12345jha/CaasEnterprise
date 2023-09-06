import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { LINE_ITEM_STATUS } from "@ei-services/common/middleware";
import { BrandConfigCachedClient } from "@ei-services/brand-config";
import {
  Order,
  OrderAddDeliveryAction,
  OrderChangeOrderStateAction,
  OrderChangeShipmentStateAction,
} from "@commercetools/platform-sdk";
import getOrderByOrderNumber from "./getOrderByOrderNumber";

interface OrderStatus {
  current?: string;
  previous?: string;
}

interface DeliveryLineItem {
  sku?: string;
  status?: LINE_ITEM_STATUS;
  quantity?: number;
  dispatchedQuantity?: number;
}

interface Delivery {
  lineItems?: DeliveryLineItem[];
}

export interface UpdateOrderPayload {
  orderId: string;
  brandId: string;
  status: OrderStatus;
  time: string;
  delivery?: Delivery;
}

let brandConfigClient;

enum ORDER_STATUS_MAPPED {
  PLACED = "Confirmed",
  CONFIRMED = "Confirmed",
  COMPLETED = "Complete",
  CANCELLED = "Cancelled",
}

enum SHIPMENT_STATUS_MAPPED {
  SHIPPED = "Shipped",
}

const updateOrder = async (payload): Promise<Order> => {
  brandConfigClient = brandConfigClient || new BrandConfigCachedClient();

  const ctApiBuilder = await buildCommerceToolsGenericClient(payload.brandId, [
    "view_orders",
    "manage_orders",
  ]);
  const currentOrder = await getOrderByOrderNumber({
    orderNumber: payload.orderId,
    brandId: payload.brandId,
  });

  const actions = [];

  const orderStatuses = ["PLACED", "CONFIRMED", "COMPLETED", "CANCELLED"];

  if (orderStatuses.includes(payload.status?.current)) {
    const changeOrderStateAction: OrderChangeOrderStateAction = {
      action: "changeOrderState",
      orderState: ORDER_STATUS_MAPPED[payload.status?.current],
    };

    actions.push(changeOrderStateAction);
  }

  const shipmentStatuses = ["SHIPPED", "COMPLETED"];

  if (shipmentStatuses.includes(payload.status?.current)) {
    const changeShippingStateAction: OrderChangeShipmentStateAction = {
      action: "changeShipmentState",
      shipmentState: SHIPMENT_STATUS_MAPPED.SHIPPED,
    };

    actions.push(changeShippingStateAction);
  }

  if (payload?.delivery) {
    const buildItemArray = (lineItems) =>
      lineItems?.map((lineItem) => ({
        id: currentOrder.lineItems.find(
          (currentOrderLineItem) =>
            currentOrderLineItem?.variant?.sku.toString().toLowerCase() ===
            lineItem?.sku.toString().toLowerCase()
        )?.id,
        quantity: lineItem?.dispatchedQuantity,
      }));

    const addDeliveryAction: OrderAddDeliveryAction = {
      action: "addDelivery",
      items: buildItemArray(payload?.delivery?.lineItems),
      parcels: [
        {
          trackingData: {
            trackingId: payload?.delivery?.trackingUrl,
            carrier: payload?.delivery?.courier?.companyName,
          },
          items: buildItemArray(payload?.delivery?.lineItems),
        },
      ],
    };

    actions.push(addDeliveryAction);
  }

  const updatedOrder = await ctApiBuilder
    .orders()
    .withId({ ID: currentOrder?.id })
    .post({
      body: {
        version: currentOrder?.version,
        actions,
      },
    })
    .execute();

  return updatedOrder.body;
};

export default updateOrder;
