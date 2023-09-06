import { ExpressResponse } from "../../models";
import { faker } from "@faker-js/faker";

export class ExpressResponseBuilder {
  build(): ExpressResponse {
    return {
      statusCode: faker.datatype.number(),
    };
  }
}
