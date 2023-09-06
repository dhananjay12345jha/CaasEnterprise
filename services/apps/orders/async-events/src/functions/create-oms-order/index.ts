import middy from "@middy/core";
import validator from "@middy/validator";
import Ajv from "ajv-draft-04";
import addFormats from "ajv-formats";
import { Handler } from "aws-lambda";
import schema, {
  Index as InternalOrderCreatedEvent,
} from "@everymile-schemas/order-created";
import { newRelic } from "@ei-services/common/middleware";
import { createOMSOrderFromInternalEvent } from "@ei-services/services";
import distribute from "./distribute";

const ajv = new Ajv();
addFormats(ajv);
const compiledSchema = ajv.compile(schema);

export const handler: Handler = async function (
  event: InternalOrderCreatedEvent
): Promise<void> {
  const payload = await createOMSOrderFromInternalEvent(event.detail);
  return distribute({ payload, event });
};

export default middy<InternalOrderCreatedEvent, void>(handler)
  .use(newRelic())
  .use(validator({ inputSchema: compiledSchema }));
