import {
  PutEventsCommand,
  EventBridgeClient,
} from "@aws-sdk/client-eventbridge";
import {
  getEventBridgeClient,
  sendCustomEvents,
} from "@ei-services/shared/eventbridge/client";
import { Detail } from "@everymile-schemas/order-created";

export default class EBEventBusClient {
  private readonly eventBusName: string;
  private readonly functionName: string;
  private readonly maxPutMessageAttempts: number;
  private client: EventBridgeClient | null;

  constructor({
    eventBusName,
    functionName,
    maxPutMessageAttempts,
  }: {
    eventBusName: string;
    functionName: string;
    maxPutMessageAttempts: number;
  }) {
    this.eventBusName = eventBusName;
    this.functionName = functionName;
    this.maxPutMessageAttempts = maxPutMessageAttempts;
    this.client = null;
  }

  public async pushEventBridgeMessage(messageDetail: Detail) {
    const input = {
      Entries: [
        {
          EventBusName: this.eventBusName,
          Source: `emc.${this.functionName}`,
          DetailType: "order.created",
          Detail: JSON.stringify(messageDetail),
        },
      ],
    };

    if (!this.client) {
      this.client = await getEventBridgeClient({
        maxAttempts: this.maxPutMessageAttempts,
      });
    }

    return sendCustomEvents(this.client, new PutEventsCommand(input));
  }
}
