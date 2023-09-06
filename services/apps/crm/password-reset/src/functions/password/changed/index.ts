import middy from "@middy/core";
import {
  z,
  passwordChangedEventSchema,
  passwordChangedPayload,
  eventValidator,
  newRelic,
} from "@ei-services/common/middleware";
import { Logger } from "@ei-services/services";
import { PasswordChanged } from "./password-changed";
import { Handler } from "aws-lambda";

export type HandlerEvent = z.infer<typeof passwordChangedEventSchema>;
export type PasswordChangedMessage = z.infer<typeof passwordChangedPayload>;

const handler: Handler = async (event: HandlerEvent) => {
  const logger = new Logger();
  logger.log("Event received: ", event);
  try {
    const {
      payload,
      metadata: { "x-emc-ubid": brandId },
    } = event.detail;

    const passwordChangedMessage: PasswordChangedMessage = payload;

    const passwordChanged = new PasswordChanged();
    const response = await passwordChanged.trigger(
      brandId,
      passwordChangedMessage
    );

    return response;
  } catch (err) {
    logger.error("Error triggering password changed email: ", err);
    throw err;
  }
};

export default middy(handler)
  .use(newRelic())
  .use(eventValidator(passwordChangedEventSchema));
