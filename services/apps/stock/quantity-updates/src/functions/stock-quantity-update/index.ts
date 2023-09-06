import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { Context as LambdaContext, Handler } from "aws-lambda/handler";
import { isValidISODateString } from "iso-datestring-validator";
import { APIResponses } from "@ei-services/common/http";
import { z, validator, newRelic } from "@ei-services/common/middleware";
import { resolveBrandIdFromOms } from "@ei-services/brand-config";
import { omsAuthorizationHeaderSchema } from "@ei-services/common/lambda";
import {
  UPDATE_TYPE,
  StockQuantityUpdatedMessageInput,
  StockQuantityUpdatedMessageMetadata,
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
    sku: z.string(),
    quantity: z.number().int().nonnegative(),
    updateType: z.nativeEnum(UPDATE_TYPE),
  }),
});

export type HandlerEvent = z.infer<typeof requestSchema>;

const handler: Handler = async (
  event: HandlerEvent,
  context: LambdaContext
) => {
  const { time, sku, quantity, updateType, brand } = event.body;

  try {
    const metadata: StockQuantityUpdatedMessageMetadata = {
      amazonRequestId: event.requestContext.requestId,
      lambdaRequestId: context.awsRequestId,
    };

    await pushEventBridgeMessage(
      {
        time: new Date(time),
        sku,
        quantity,
        updateType,
        brand,
      } as StockQuantityUpdatedMessageInput,
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
