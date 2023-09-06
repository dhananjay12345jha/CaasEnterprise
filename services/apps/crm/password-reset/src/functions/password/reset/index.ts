import middy from "@middy/core";
import {
  z,
  passwordResetEventSchema,
  passwordResetPayload,
  eventValidator,
  newRelic,
} from "@ei-services/common/middleware";
import { Logger } from "@ei-services/services";
import { PasswordReset } from "./password-reset";
import { Handler } from "aws-lambda";

export type HandlerEvent = z.infer<typeof passwordResetEventSchema>;
export type PasswordResetMessage = z.infer<typeof passwordResetPayload>;

const handler: Handler = async (event: HandlerEvent) => {
  const logger = new Logger();

  // Event not fully logged until a log framework that redacts PII is in place (tracked in WCAAS-3202)
  logger.log("Event received: ", event.id);

  try {
    const {
      payload,
      metadata: { "x-emc-ubid": brandId },
    } = event.detail;

    const passwordResetMessage: PasswordResetMessage = payload;

    const passwordReset = new PasswordReset();
    const response = await passwordReset.trigger(brandId, passwordResetMessage);

    logger.log("Response from Braze: ", response);

    return response;
  } catch (err) {
    logger.error("Error triggering password reset email: ", err);
    throw err;
  }
};

export default middy(handler)
  .use(newRelic())
  .use(eventValidator(passwordResetEventSchema));
