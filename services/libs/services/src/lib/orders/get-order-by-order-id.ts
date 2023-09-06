import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { Order } from "@commercetools/platform-sdk";

export interface GetOrderPayload {
  orderId: string;
  brandId: string;
}

const getOrderByOrderId = async (payload: GetOrderPayload): Promise<Order> => {
  const { brandId, orderId } = payload;

  const ctApiBuilder = await buildCommerceToolsGenericClient(brandId, [
    "view_orders",
  ]);

  const order = await ctApiBuilder
    .orders()
    .withId({ ID: orderId })
    .get()
    .execute();

  return order.body;
};

export default getOrderByOrderId;
