import { z } from "../../validator";
import { ZodTypeAny } from "zod";

export const buildEventMetaSchema = <T extends string>(detailType: T) =>
  z.object({
    version: z.string().min(1),
    id: z.string().min(1),
    "detail-type": z.literal(detailType),
    source: z.string().optional(),
    account: z.string().optional(),
    time: z.string().min(1),
    region: z.string().optional(),
    resources: z.array(z.string()).optional(),
  });

export const metadataSchema = z.object({
  "x-emc-ubid": z.string().min(1),
  "x-amzn-RequestId": z.string().optional(),
  "x-lambda-RequestId": z.string().optional(),
});

export const detailSchema = z.object({
  referenced: z.boolean().optional(),
  correlationId: z.string().uuid().optional(),
});

export const eventDetailSchema = <T extends ZodTypeAny>(payloadSchema: T) =>
  detailSchema
    .extend({ metadata: metadataSchema })
    .extend({ payload: payloadSchema });

export const buildEventSchema = <S extends string, T extends ZodTypeAny>(
  detailType: S,
  payloadSchema: T
) =>
  buildEventMetaSchema(detailType).extend({
    detail: eventDetailSchema(payloadSchema),
  });
