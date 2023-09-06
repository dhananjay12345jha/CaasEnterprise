import { v4 as uuidv4 } from "uuid";
import { world } from "../../support/utils/custom.world";

export class Registration {
  referenced: boolean;
  correlationId: string;
  payload: RegistrationEventPaylod;
  metadata: MetaData;

  constructor(brandId: string, payload: RegistrationEventPaylod) {
    this.referenced = false;
    this.correlationId = uuidv4();
    payload.customerId = uuidv4();

    this.payload = payload;
    this.metadata = new MetaData(world.config[`${brandId}`].brandId);
  }
}

export class MetaData {
  "x-emc-ubid": string;
  constructor(brandId: string) {
    this["x-emc-ubid"] = brandId;
  }
}

export class RegistrationEventPaylod {
  email: string;
  customerId: string;
  firstName: string;
  lastName: string;

  // constructor(){
  //   this.customerId = uuidv4();
  // }
}
