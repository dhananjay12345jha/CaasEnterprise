import { default as traverse } from "traverse";
import { Payload, Detail } from "@everymile-schemas/order-created";
import { CTExternalOrderResource } from "../interfaces";

export default function createInternalEventFromProxyEvent({
  ctOrder,
  brandID,
  correlationId,
}: {
  ctOrder: CTExternalOrderResource;
  brandID: string;
  correlationId: string;
}): Detail {
  const clonedCTOrder: Payload = traverse(ctOrder).map(function (value) {
    // traverse can't deal with arrows
    if (value === null) {
      this.delete();
    }
  });

  delete clonedCTOrder.type;

  return {
    referenced: false, // TODO delete this when the schema jumps a major version
    datalake: true, // DOCS: https://wiki.salmon.com/display/CAAS/Data+Lake+-+API+Destination
    correlationId,
    payload: clonedCTOrder,
    metadata: {
      "x-emc-ubid": brandID,
    },
  };
}
