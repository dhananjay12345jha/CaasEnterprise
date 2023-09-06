import middy from "@middy/core";
import { Handler, EventBridgeEvent } from "aws-lambda";
import { newRelic } from "@ei-services/common/middleware";
import {
  createInternalEventFromProxyEvent,
  CTExternalOrderCreatedEvent,
} from "@ei-services/services";

import { ebEventBusClient, logger } from "./singletons";

interface InternalEventEnvelope<Payload> {
  correlationId: string;
  payload: Payload;
  metadata: { "x-emc-ubid": string };
}

export type CTProxyEventBridgeEvent = EventBridgeEvent<
  "OrderCreated",
  InternalEventEnvelope<CTExternalOrderCreatedEvent>
>;

const handler: Handler = async function (
  event: CTProxyEventBridgeEvent
): Promise<void> {
  const { correlationId } = event.detail;
  const { projectKey, type, id, order } = event.detail.payload;
  logger.info("index#handler - An external event is received", {
    projectKey,
    type,
    id,
    correlationId,
  });
  const internalEvent = createInternalEventFromProxyEvent({
    ctOrder: order,
    brandID: projectKey,
    correlationId,
  });
  const { payload, metadata } = internalEvent;
  logger.info("index#handler - An internal event is built", {
    correlationId,
    brandId: metadata["x-emc-ubid"],
    id: payload.id,
  });
  await ebEventBusClient.pushEventBridgeMessage(internalEvent);
  logger.info(
    "index#handler - An internal event is pushed to the internal bus",
    { correlationId, brandId: metadata["x-emc-ubid"], id: payload.id }
  );
};

export default middy<CTProxyEventBridgeEvent, void>(handler).use(newRelic());
