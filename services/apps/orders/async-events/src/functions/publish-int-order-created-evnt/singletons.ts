import { Logger } from "@ei-services/services";
import EBEventBusClient from "./EBEventBusClient";
import config, { ebEventBusClientConfigValidator } from "./configProvider";

export const logger = new Logger();

const ebEventBusClientConfig = ebEventBusClientConfigValidator(
  config.eventBridgeEventBus
);

export const ebEventBusClient = new EBEventBusClient(ebEventBusClientConfig);
