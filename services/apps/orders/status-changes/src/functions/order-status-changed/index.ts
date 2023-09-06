import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { Context as LambdaContext, Handler } from "aws-lambda/handler";
import { isValidISODateString } from "iso-datestring-validator";
import { APIResponses } from "@ei-services/common/http";
import { z, validator, newRelic } from "@ei-services/common/middleware";
import { resolveBrandIdFromOms } from "@ei-services/brand-config";
import { omsAuthorizationHeaderSchema } from "@ei-services/common/lambda";
import {
  ORDER_STATUS,
  EXPECTED_DELIVERY_WINDOW_TYPE,
  OrderStatusChangedMessageInput,
  OrderStatusChangedMessageMetadata,
  pushEventBridgeMessage,
} from "./pushEventBridgeMessage";

const requestSchema = z.object({
  headers: omsAuthorizationHeaderSchema,
  requestContext: z.object({
    requestId: z.string(),
  }),
  body: z.object({
    time: z
      .string()
      .refine(isValidISODateString, { message: "Invalid ISO 8601 date" }),
    brand: z.string().transform(async (brand: string, ctx) => {
      try {
        return await resolveBrandIdFromOms(brand);
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Unregistered OMS brand provided",
        });
        return brand;
      }
    }),
    orderId: z.string().nonempty(),
    status: z.object({
      current: z.nativeEnum(ORDER_STATUS),
      previous: z.nativeEnum(ORDER_STATUS).optional(),
    }),
    delivery: z
      .object({
        trackingUrl: z.string().url().optional(),
        courier: z
          .object({
            companyName: z.string().nonempty(),
          })
          .optional(),
        expectedDeliveryWindow: z
          .object({
            value: z.number().int().min(0),
            type: z
              .nativeEnum(EXPECTED_DELIVERY_WINDOW_TYPE)
              .default(EXPECTED_DELIVERY_WINDOW_TYPE.DAYS),
          })
          .optional(),
        lineItems: z
          .array(
            z.object({
              sku: z.string().nonempty(),
              status: z.nativeEnum(ORDER_STATUS),
              quantity: z.number().int().min(1),
              dispatchedQuantity: z.number().int().min(0),
            })
          )
          .optional(),
      })
      .optional(),
  }),
});

export type HandlerEvent = z.infer<typeof requestSchema>;

const handler: Handler = async (
  event: HandlerEvent,
  context: LambdaContext
) => {
  const { time, brand, orderId, status, delivery } = event.body;

  try {
    const metadata: OrderStatusChangedMessageMetadata = {
      amazonRequestId: event.requestContext.requestId,
      lambdaRequestId: context.awsRequestId,
    };

    await pushEventBridgeMessage(
      {
        time: new Date(time),
        brand,
        orderId,
        ...(delivery && { delivery }),
        status,
      } as OrderStatusChangedMessageInput,
      metadata
    );

    return APIResponses.Ok();
  } catch (error) {
    console.log("event.body", event.body);
    console.error(error);

    return APIResponses.InternalServerError();
  }
};

export default middy(handler)
  .use(httpJsonBodyParser())
  .use(validator(requestSchema))
  .use(newRelic());
