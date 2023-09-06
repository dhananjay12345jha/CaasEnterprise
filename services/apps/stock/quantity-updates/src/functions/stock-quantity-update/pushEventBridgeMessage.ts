import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import {
  getEventBridgeClient,
  sendCustomEvents,
} from "@ei-services/shared/eventbridge/client";

export enum UPDATE_TYPE {
  INCREMENT = "increment",
  DECREMENT = "decrement",
}

export interface StockQuantityUpdatedMessageInput {
  brand: string;
  sku: string;
  quantity: number;
  updateType: UPDATE_TYPE;
  time: Date;
}

export interface StockQuantityUpdatedMessageMetadata {
  amazonRequestId: string;
  lambdaRequestId: string;
}

const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
const eventBusName = process.env.EVENT_BUS_NAME;

const MAX_PUT_MESSAGES_ATTEMPTS = 3;
const OFFLINE_EVENT_BRIDGE_SERVER_ENDPOINT = "http://localhost:4640";

export const pushEventBridgeMessage = async (
  messageInput: StockQuantityUpdatedMessageInput,
  metadata: StockQuantityUpdatedMessageMetadata
) => {
  const { brand, sku, quantity, updateType, time } = messageInput;

  const input = {
    Entries: [
      {
        EventBusName: eventBusName,
        Source: `emc.${functionName}`,
        DetailType: "stock.quantity.updated",
        Detail: JSON.stringify({
          payload: {
            sku,
            quantity,
            updateType,
            time,
          },
          metadata: {
            "x-emc-ubid": brand,
            "x-amzn-RequestId": metadata.amazonRequestId,
            "x-lambda-RequestId": metadata.lambdaRequestId,
          },
        }),
      },
    ],
  };

  console.debug("EventBridge.putMessages() call", input);

  const client = await getEventBridgeClient({
    maxAttempts: MAX_PUT_MESSAGES_ATTEMPTS,
    ...(process.env.IS_OFFLINE && {
      endpoint: OFFLINE_EVENT_BRIDGE_SERVER_ENDPOINT,
    }),
  });

  return sendCustomEvents(client, new PutEventsCommand(input));
};
