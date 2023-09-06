import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import {
  getEventBridgeClient,
  sendCustomEvents,
} from "@ei-services/shared/eventbridge/client";
import {
  BRAND_FOR_ALIAS_TYPES,
  getBrandConfigCachedClient,
} from "@ei-services/brand-config";

export enum ORDER_STATUS {
  PLACED = "PLACED",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum EXPECTED_DELIVERY_WINDOW_TYPE {
  DAYS = "days",
  HOURS = "hours",
}

export interface OrderStatusChangedMessageInput {
  time: Date;
  brand: string;
  orderId: string;
  status: {
    current: ORDER_STATUS;
    previous?: ORDER_STATUS;
  };
  delivery?: {
    trackingUrl?: string;
    courier?: {
      companyName: string;
    };
    expectedDeliveryWindow?: {
      value: number;
      type: EXPECTED_DELIVERY_WINDOW_TYPE;
    };
    lineItems?: [
      {
        sku: string;
        status: ORDER_STATUS;
        quantity: number;
        dispatchedQuantity: number;
      }
    ];
  };
}

export interface OrderStatusChangedMessageMetadata {
  amazonRequestId: string;
  lambdaRequestId: string;
}

const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
const eventBusName = process.env.EVENT_BUS_NAME;

const MAX_PUT_MESSAGES_ATTEMPTS = 3;
const OFFLINE_EVENT_BRIDGE_SERVER_ENDPOINT = "http://localhost:4442";

export const resolveBrandIdFromOms = (omsBrandId: string) => {
  return getBrandConfigCachedClient().getBrandIdForAlias(
    omsBrandId,
    BRAND_FOR_ALIAS_TYPES.OMS
  );
};

export const pushEventBridgeMessage = async (
  messageInput: OrderStatusChangedMessageInput,
  metadata: OrderStatusChangedMessageMetadata
) => {
  const { brand, time, orderId, status, delivery } = messageInput;

  const input = {
    Entries: [
      {
        EventBusName: eventBusName,
        Source: `emc.${functionName}`,
        DetailType: "order.status.changed",
        Detail: JSON.stringify({
          payload: {
            time,
            orderId,
            status,
            ...(delivery && { delivery }),
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
