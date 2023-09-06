import { Index as InternalOrderCreatedEvent } from "@everymile-schemas/order-created";
import {
  OrderPayload,
  OMSStoredOrder,
} from "@ei-services/order-management-service";

import { omsClient, logger } from "./singletons";

export default async function distribute({
  payload,
}: {
  payload: OrderPayload;
  event: InternalOrderCreatedEvent;
}): Promise<void> {
  const { brandID, saleReference } = payload;
  let storedOrder: OMSStoredOrder | null;
  try {
    storedOrder = await omsClient.getOrder({
      brandID,
      saleReference,
    });
  } catch (err) {
    const castErr = err as Error;
    logger.error(
      `distribute#distribute ${castErr.name} - An error occurred fetching the order from OMS: ${castErr.message} - failing invocation for a retry - brandID: ${brandID}, saleReference: ${saleReference}`
    );
    throw err;
  }

  if (storedOrder) {
    logger.info(
      `distribute#distribute - It appears the order already exists in OMS - quitting gracefully - brandID: ${brandID}, saleReference: ${saleReference}`
    );
    return;
  }

  try {
    await omsClient.createOrder(payload);
  } catch (err) {
    const castErr = err as Error;
    logger.error(
      `distribute#distribute ${castErr.name} - An error occurred creating the order in OMS: ${castErr.message} - brandID: ${brandID}, saleReference: ${saleReference}`
    );
    throw err;
  }
  logger.info(
    `distribute#distribute - The order has been successfully stored, brandID: ${brandID} - saleReference: ${saleReference}`
  );
}
