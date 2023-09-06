import { InventoryEntry } from "@commercetools/platform-sdk";
import { ErrorResponse } from "@commercetools/platform-sdk/dist/declarations/src/generated/models/error";
import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { HttpStatusCode } from "@ei-services/common/http";
import { InternalCommerceServiceError } from "../errors";

export async function getInventoryBySku(
  brandId: string,
  sku: string
): Promise<InventoryEntry> {
  const commerceToolsClient = await buildCommerceToolsGenericClient(brandId, [
    "view_products",
  ]);

  try {
    const filterQuery = `sku="${sku.toUpperCase()}"`;
    const inventoryEntryRecord = await commerceToolsClient
      .inventory()
      .get({
        queryArgs: {
          where: filterQuery,
        },
      })
      .execute();
    return inventoryEntryRecord?.body?.results?.[0];
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
