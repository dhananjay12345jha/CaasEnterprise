import { ExpressRequest } from "../../models";
import { faker } from "@faker-js/faker";

export class ExpressRequestBuilder {
  build(): ExpressRequest {
    return {
      params: faker.datatype.string(),
      query: faker.datatype.string(),
      body: faker.datatype.string(),
      headers: faker.datatype.string(),
      path: faker.datatype.string(),
      method: faker.datatype.string(),
    };
  }
}
