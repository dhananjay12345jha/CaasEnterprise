import {
  adyenPaymentAuthSchema,
  newRelic,
} from "@ei-services/common/middleware";
import { z } from "zod";
import {
  PaymentAuthorisedMessageMetadata,
  publishPaymentAuthEvent,
} from "./publishPaymentAuthEvent";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { Context as LambdaContext } from "aws-lambda/handler";
import { APIResponses } from "@ei-services/common/http";
import { dlqClient } from "./singletons";

const requestSchema = z.object({
  requestContext: z.object({
    requestId: z.string(),
  }),
  body: adyenPaymentAuthSchema,
});

export type PaymentAuthHandlerEvent = z.infer<typeof requestSchema>;

const handler = async (
  // Had to set these as unkown or middy throws error, tried to dynamically set via middy<Type, Type>
  // Was throwing on tests
  // but no luck, issue documented here: https://github.com/middyjs/middy/issues/742
  event: unknown,
  context: unknown
) => {
  const useContext = context as LambdaContext;
  const useEvent = event as PaymentAuthHandlerEvent;
  try {
    const metadata: PaymentAuthorisedMessageMetadata = {
      amazonRequestId: useEvent.requestContext.requestId,
      lambdaRequestId: useContext.awsRequestId,
    };

    const { body } = useEvent;
    await publishPaymentAuthEvent(body, metadata);
  } catch (e) {
    console.error(e);
    const castError = e as Error;
    await dlqClient.publish({
      event: useEvent,
      rejectionReason: {
        errorMessage: castError.message,
        errorName: castError.name,
      },
    });
    /*eslint-disable */
    // eslint-disable-next-line no-unsafe-finally
  } finally {
    return APIResponses.Ok("[accepted]");
  }
  /*eslint-enable */
};

export default middy(handler).use(httpJsonBodyParser()).use(newRelic());
