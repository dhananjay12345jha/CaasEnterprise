import middy from "@middy/core";
import {
  z,
  eventValidator,
  orderDispatchedEventSchema,
  newRelic,
} from "@ei-services/common/middleware";
import {
  OrderDispatched,
  OrderDispatchedMessage,
} from "./trigger-order-dispatched-notification";
import { Handler } from "aws-lambda";

export type HandlerEvent = z.infer<typeof orderDispatchedEventSchema>;

const handler: Handler = async (event: HandlerEvent) => {
  // event not fully logged until a log framework that redacts PII is in place
  // tracked in ticket WCAAS-3872 (https://jira.salmon.com/browse/WCAAS-3872)
  console.log("Event received: ", event.id);
  console.log(JSON.stringify(event));

  try {
    const { payload, metadata } = event.detail;

    const orderDispatchedMessage: OrderDispatchedMessage = payload;
    const brandId = metadata["x-emc-ubid"];

    const orderDispatch = new OrderDispatched();
    const response = await orderDispatch.triggerNotification(
      brandId,
      orderDispatchedMessage
    );

    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default middy(handler)
  .use(newRelic())
  .use(eventValidator(orderDispatchedEventSchema));
