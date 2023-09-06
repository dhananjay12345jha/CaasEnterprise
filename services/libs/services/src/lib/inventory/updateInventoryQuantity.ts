import { ClientResponse, InventoryEntry } from "@commercetools/platform-sdk";
import { ErrorResponse } from "@commercetools/platform-sdk/dist/declarations/src/generated/models/error";
import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { HttpStatusCode } from "@ei-services/common/http";
import { InternalCommerceServiceError } from "../errors";

export async function updateInventoryQuantity(
  brandId: string,
  inventoryId: string,
  version: number,
  quantity: number
): Promise<ClientResponse<InventoryEntry>> {
  const commerceToolsClient = await buildCommerceToolsGenericClient(brandId, [
    "view_products",
    "manage_products",
  ]);

  try {
    return await commerceToolsClient
      .inventory()
      .withId({ ID: inventoryId })
      .post({
        body: {
          version,
          actions: [
            {
              action: "changeQuantity",
              quantity,
            },
          ],
        },
      })
      .execute();
  } catch (err) {
    const ctError = err as ErrorResponse;

    throw new InternalCommerceServiceError(
      HttpStatusCode[ctError.statusCode]?.trim(),
      ctError.message,
      {
        CTAPIErrors: ctError.errors,
      }
    );
  }
}
