import { v4 as uuidv4 } from "uuid";
import { world } from "../../support/utils/custom.world";

export class OrderCreated {
  referenced: boolean;
  correlationId: string;
  payload: any;
  metadata: MetaData;

  constructor(brandId: string, orderDetails: any) {
    this.referenced = false;
    this.correlationId = uuidv4();
    this.payload = orderDetails;
    this.metadata = new MetaData(world.config[`${brandId}`].brandId);
  }
}

export class MetaData {
  "x-emc-ubid": string;
  constructor(brandId: string) {
    this["x-emc-ubid"] = brandId;
  }
}
