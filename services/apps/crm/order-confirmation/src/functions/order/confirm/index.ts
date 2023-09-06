import middy from "@middy/core";
import { OrderConfirmation } from "./trigger-order-confirmation-notification";
import { Handler } from "aws-lambda";
import schema, {
  Index as InternalOrderCreatedEvent,
  Payload as OrderCreatedPayload,
} from "@everymile-schemas/order-created";
import validator from "@middy/validator";
import addFormats from "ajv-formats";
import Ajv from "ajv-draft-04";
import { newRelic } from "@ei-services/common/middleware";

const ajv = new Ajv();
addFormats(ajv);
const compiledSchema = ajv.compile(schema);

const handler: Handler = async (
  event: InternalOrderCreatedEvent
): Promise<void> => {
  //event not fully logged until a log framework that redacts PII is in place (not tracked in a ticket yet. )
  console.log("Event received: ", event.id);
  console.log(JSON.stringify(event));

  try {
    const { payload, metadata } = event.detail;

    const orderCreatedMessage: OrderCreatedPayload = payload;
    const brandId = metadata["x-emc-ubid"];

    const orderConfirmation = new OrderConfirmation();
    await orderConfirmation.triggerNotification(brandId, orderCreatedMessage);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default middy<InternalOrderCreatedEvent, void>(handler)
  .use(newRelic())
  .use(validator({ inputSchema: compiledSchema }));
