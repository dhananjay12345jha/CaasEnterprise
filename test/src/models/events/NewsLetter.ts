import { v4 as uuidv4 } from "uuid";
import { world } from "../../support/utils/custom.world";

export class NewsLetter {
  referenced: boolean;
  correlationId: string;
  payload: NewsLetterEventPaylod;
  metadata: MetaData;

  constructor(brandId: string, newsLetter: NewsLetterEventPaylod) {
    this.referenced = false;
    this.correlationId = uuidv4();
    this.payload = newsLetter;
    this.metadata = new MetaData(world.config[`${brandId}`].brandId);
  }
}

export class MetaData {
  "x-emc-ubid": string;
  constructor(brandId: string) {
    this["x-emc-ubid"] = brandId;
  }
}

export class NewsLetterEventPaylod {
  timezone: string;
  email: string;
  marketingPreference: string;
}
