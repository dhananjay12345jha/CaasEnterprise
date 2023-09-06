import { Logger } from "@ei-services/services";
import { OMSClient } from "@ei-services/order-management-service";

export const logger = new Logger();

export const omsClient = new OMSClient({ logger });
