import { z } from "../../validator";
import { buildEventSchema } from "../common";

export const shipmentState = z.enum([
  "Shipped",
  "Ready",
  "Pending",
  "Delayed",
  "Partial",
  "Backorder",
]);

export const orderDispatchedEventPayloadSchema = z.object({
  orderId: z.string().min(1),
  orderVersion: z.number().nonnegative().int(),
  previousShipmentState: shipmentState,
  newShipmentState: shipmentState,
});

export const orderDispatchedEventSchema = buildEventSchema(
  "order.shipment.changed",
  orderDispatchedEventPayloadSchema
);
