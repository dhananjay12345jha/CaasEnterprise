import { Logger } from "@ei-services/services";
import { DLQClient } from "@ei-services/shared/dlq/client";
import config, { dlqClientConfigValidator } from "./configProvider";

export const logger = new Logger();

const dlqClientConfig = dlqClientConfigValidator(config.deadLetterQueue);

export const dlqClient = new DLQClient(dlqClientConfig);
