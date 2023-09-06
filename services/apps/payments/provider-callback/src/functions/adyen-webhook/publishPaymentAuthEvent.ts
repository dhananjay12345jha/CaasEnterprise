import {
  getEventBridgeClient,
  sendCustomEvents,
} from "@ei-services/shared/eventbridge/client";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { AdyenAuthWebhookEvent } from "@ei-services/common/middleware";
import { logger } from "./singletons";

const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
const eventBusName = process.env.EVENT_BUS_NAME;
const eventBridgeEndpoint = process.env.EVENT_BRIDGE_ENDPOINT;

const MAX_PUT_MESSAGES_ATTEMPTS = Number(process.env.MAX_PUT_MESSAGES_ATTEMPTS);

export interface PaymentAuthorisedMessageMetadata {
  amazonRequestId: string;
  lambdaRequestId: string;
}

export async function publishPaymentAuthEvent(
  adyenWebhookEvent: AdyenAuthWebhookEvent,
  metadata: PaymentAuthorisedMessageMetadata
) {
  const { additionalData } =
    adyenWebhookEvent.notificationItems[0].NotificationRequestItem;
  const brandId = additionalData["metadata.brandId"];
  const checkoutSessionId = additionalData.checkoutSessionId;

  if (checkoutSessionId)
    logger.info(`Checkout session id received: ${checkoutSessionId}`);

  const input = {
    Entries: [
      {
        EventBusName: eventBusName,
        Source: `emc.${functionName}`,
        DetailType: "payment.order.auth.accepted",
        Detail: JSON.stringify({
          payload: adyenWebhookEvent,
          metadata: {
            "x-emc-ubid": brandId,
            "x-amzn-RequestId": metadata.amazonRequestId,
            "x-lambda-RequestId": metadata.lambdaRequestId,
          },
        }),
      },
    ],
  };
  console.debug("EventBridge.putMessages() call", input);

  const client = await getEventBridgeClient({
    // If specfic endpoint is present in config - go there
    // Otherwise default to deployment setting
    ...(eventBridgeEndpoint && { endpoint: eventBridgeEndpoint }),
    maxAttempts: MAX_PUT_MESSAGES_ATTEMPTS,
  });

  console.debug("-- Successfully creates event bridge client ---");
  return await sendCustomEvents(client, new PutEventsCommand(input));
}
