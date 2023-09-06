import middy from "@middy/core";
import { updateOrderStatus } from "@ei-services/services";
import {
  z,
  orderStatusChangedSchema,
  eventValidator,
  newRelic,
} from "@ei-services/common/middleware";

export type HandlerEvent = z.infer<typeof orderStatusChangedSchema>;

const handler = async (event: HandlerEvent) => {
  // event not fully logged until a log framework that redacts PII is in place
  // see https://jira.salmon.com/browse/WCAAS-3198
  console.log("Event received: ", event.id);

  const {
    payload: { orderId, status, time, delivery },
    metadata: { "x-emc-ubid": brandId },
  } = event.detail;

  const updatedOrder = await updateOrderStatus({
    orderId,
    brandId,
    status,
    time,
    delivery,
  });

  return updatedOrder;
};

export default middy(handler)
  .use(newRelic())
  .use(eventValidator(orderStatusChangedSchema));
