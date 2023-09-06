import middy from "@middy/core";
import { Handler } from "aws-lambda";
import {
  newRelic,
  eventValidator,
  z,
  updateInventoryEventSchema,
  UPDATE_TYPE,
} from "@ei-services/common/middleware";
import {
  getInventoryBySku,
  updateInventoryQuantity,
} from "@ei-services/services";
import { logger } from "./singletons";

export type HandlerEvent = z.infer<typeof updateInventoryEventSchema>;

const handler: Handler = async ({
  detail: {
    payload: {
      sku,
      quantity: eventMessageQuantity,
      updateType: eventUpdateType,
    },
    metadata: { ["x-emc-ubid"]: brandId },
  },
}: HandlerEvent) => {
  let inventoryEntryRecord;
  try {
    inventoryEntryRecord = await getInventoryBySku(brandId, sku);
  } catch (error) {
    logger.error(
      `Error getting inventory by sku: ${sku} for brand id: ${brandId}`
    );
    throw error;
  }
  if (!inventoryEntryRecord) {
    logger.warn(
      `No inventory entry record found for sku: ${sku} for brand id: ${brandId}`
    );
    return;
  }

  if (
    eventUpdateType === UPDATE_TYPE.DECREMENT &&
    eventMessageQuantity > inventoryEntryRecord.quantityOnStock
  ) {
    logger.warn(
      `Quantity decrement ignored: Received quantity: ${eventMessageQuantity} is greater than quantity on stock: ${inventoryEntryRecord.quantityOnStock} for sku: ${sku} and for brand id: ${brandId}`
    );
    return;
  }

  if (
    eventUpdateType === UPDATE_TYPE.DECREMENT &&
    inventoryEntryRecord.quantityOnStock === 0
  ) {
    logger.warn(
      `Quantity decrement ignored: Stock is already 0 for sku: ${sku} and for brand id: ${brandId}`
    );
    return;
  }

  try {
    return updateInventoryQuantity(
      brandId,
      inventoryEntryRecord.id,
      inventoryEntryRecord.version,
      eventMessageQuantity
    );
  } catch (error) {
    logger.error(
      `Error updating inventory quantity for inventory: ${inventoryEntryRecord.id} for brand id: ${brandId}`
    );
    throw error;
  }
};

export default middy(handler)
  .use(newRelic())
  .use(eventValidator(updateInventoryEventSchema));
