import { z } from "../../validator";
import { buildEventSchema } from "../common";

export enum UPDATE_TYPE {
  INCREMENT = "increment",
  DECREMENT = "decrement",
}

export const updateInventoryPayload = z.object({
  sku: z.string(),
  quantity: z.number().int().nonnegative(),
  updateType: z.nativeEnum(UPDATE_TYPE),
  time: z.string(),
});

export const updateInventoryEventSchema = buildEventSchema(
  "stock.quantity.updated",
  updateInventoryPayload
);
