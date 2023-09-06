import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { Order } from "@commercetools/platform-sdk";

export interface GetOrderPayload {
  orderNumber: string;
  brandId: string;
}

const getOrderByOrderNumber = async (
  payload: GetOrderPayload
): Promise<Order> => {
  const { brandId, orderNumber } = payload;

  const ctApiBuilder = await buildCommerceToolsGenericClient(brandId, [
    "view_orders",
  ]);

  const order = await ctApiBuilder
    .orders()
    .withOrderNumber({ orderNumber })
    .get()
    .execute();

  return order.body;
};

export default getOrderByOrderNumber;
