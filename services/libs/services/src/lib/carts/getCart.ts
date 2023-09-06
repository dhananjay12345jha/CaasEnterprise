import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { Cart } from "@commercetools/platform-sdk";

interface RequestMetadata {
  brandId: string;
  cartId: string;
}

const getCartById = async ({
  cartId,
  brandId,
}: RequestMetadata): Promise<Cart> => {
  const ctApiBuilder = await buildCommerceToolsGenericClient(brandId, [
    "view_orders",
  ]);

  const ctCartResponse = await ctApiBuilder
    .carts()
    .withId({ ID: cartId })
    .get()
    .execute();

  return ctCartResponse.body;
};

export default getCartById;
