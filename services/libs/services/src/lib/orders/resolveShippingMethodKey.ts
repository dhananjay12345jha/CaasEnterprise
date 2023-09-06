import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { ByProjectKeyRequestBuilder } from "@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder";
import { ShippingMethodReference } from "@everymile-schemas/order-created";

export default async function resolveShippingMethodKey(
  brandId: string,
  payload: ShippingMethodReference
): Promise<string> {
  // TODO this client shouldn't really be created on every request, but seems non-trivial to refactor to make it "cacheable"
  const commerceClient: ByProjectKeyRequestBuilder =
    await buildCommerceToolsGenericClient(brandId, ["view_shipping_methods"]);

  const method = await commerceClient
    .shippingMethods()
    .withId({ ID: payload.id })
    .get()
    .execute();
  return method.body.key;
}
