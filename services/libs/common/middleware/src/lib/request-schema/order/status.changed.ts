import { z } from "../../validator";

export enum LINE_ITEM_STATUS {
  PLACED = "PLACED",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum EXPECTED_DELIVERY_WINDOW {
  DAYS = "days",
  HOURS = "hours",
}

export const orderStatusChangedSchema = z.object({
  version: z.string(),
  id: z.string(),
  "detail-type": z.enum(["order.status.changed"]),
  referenced: z.boolean().optional(),
  time: z.string(),
  detail: z.object({
    payload: z.object({
      orderId: z.string().nonempty(),
      status: z.object({
        previous: z.string().optional(),
        current: z.string().optional(),
      }),
      time: z.string(),
      delivery: z
        .object({
          trackingUrl: z.string().url().optional(),
          courier: z
            .object({
              companyName: z.string(),
            })
            .optional(),
          expectedDeliveryWindow: z
            .object({
              value: z.number().min(0),
              type: z
                .enum([
                  EXPECTED_DELIVERY_WINDOW.DAYS,
                  EXPECTED_DELIVERY_WINDOW.HOURS,
                ])
                .optional()
                .default(EXPECTED_DELIVERY_WINDOW.DAYS),
            })
            .optional(),
          lineItems: z
            .array(
              z.object({
                sku: z.string().nonempty(),
                status: z.enum([
                  LINE_ITEM_STATUS.PLACED,
                  LINE_ITEM_STATUS.SHIPPED,
                  LINE_ITEM_STATUS.COMPLETED,
                  LINE_ITEM_STATUS.CANCELLED,
                ]),
                quantity: z.number().int().min(1),
                dispatchedQuantity: z.number().int().min(0),
              })
            )
            .optional(),
        })
        .optional(),
    }),
    metadata: z.object({
      "x-emc-ubid": z.string().uuid(),
      "x-amzn-RequestId": z.string().optional(),
      "x-lambda-RequestId": z.string().optional(),
    }),
  }),
  source: z.string().optional(),
  account: z.string().optional(),
  region: z.string().optional(),
  correlationId: z.string().uuid().optional(),
});
