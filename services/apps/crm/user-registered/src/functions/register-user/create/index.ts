import middy from "@middy/core";
import {
  z,
  userRegisteredEventSchema,
  eventValidator,
  newRelic,
} from "@ei-services/common/middleware";
import { RegisterUser } from "./register-user-event";
import { Handler } from "aws-lambda";

export type HandlerEvent = z.infer<typeof userRegisteredEventSchema>;

const handler: Handler = async (event: HandlerEvent) => {
  // event not fully logged until a log framework that redacts PII is in place (WCAAS-3872)
  console.log("Event received: ", event.id);
  console.log(JSON.stringify(event));

  try {
    const { payload, metadata } = event.detail;
    const customerId = payload.customerId;
    const brandId = metadata["x-emc-ubid"];

    const registerUser = new RegisterUser();
    return await registerUser.trackRegisterUserEvent(brandId, customerId, {
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default middy(handler)
  .use(newRelic())
  .use(eventValidator(userRegisteredEventSchema));
