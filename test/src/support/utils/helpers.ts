import { DataTable } from "@cucumber/cucumber";
import * as chai from "chai";
import { expect } from "chai";
import chaiResponseValidator from "chai-openapi-response-validator";
import * as path from "path";
import { JSONPath } from "jsonpath-plus";
import { world } from "./custom.world";
import * as crypto from "crypto";
import { CartResponse } from "../../models/response/CartResponse";
import * as console from "console";
import { v4 as uuidv4 } from "uuid";
import { CTHelper } from "../../api/CTHelper";
import { BrazeHelper } from "../../api/BrazeHelper";

import { Console } from "console";
import axios, { AxiosResponse } from "axios";

const graphQL = "/graphql";

export function validateOpenAPISpec(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any,
  filePath: string
) {
  chai.use(
    chaiResponseValidator(
      path.resolve(
        `${world.config.globals.testConfig.openAPISchemaLocation + filePath}`
      )
    )
  );
  expect(response).to.satisfyApiSpec;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateResponseJSON(json: any, inputTable: DataTable) {
  // ideal to use soft assert something for future
  for (const k in inputTable.rows()) {
    const result = JSONPath({ path: `${inputTable.rows()[k][0]}`, json });
    //   console.log(`${inputTable.rows()[k][0]} : ${result}`);
    if (inputTable.rows()[k][1] != "null") {
      expect(result, `${inputTable.rows()[k][0]}`).to.be.not.empty;
      if (inputTable.rows()[k][1] != "any")
        expect(result.toString(), `${inputTable.rows()[k][0]}`).to.contain(
          inputTable.rows()[k][1]
        );
    } else {
      expect(result, `${inputTable.rows()[k][0]}`).to.be.empty;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateResponseJSONRegEx(json: any, inputTable: DataTable) {
  // ideal to use soft assert something for future
  for (const k in inputTable.rows()) {
    const result = JSONPath({ path: `${inputTable.rows()[k][0]}`, json });
    //   console.log(`${inputTable.rows()[k][0]} : ${result}`);
    if (inputTable.rows()[k][1] != "null") {
      expect(result, `${inputTable.rows()[k][0]}`).to.be.not.empty;
      if (inputTable.rows()[k][1] != "any")
        expect(result.toString(), `${inputTable.rows()[k][0]}`).match(
          new RegExp(inputTable.rows()[k][1])
        );
    } else {
      expect(result, `${inputTable.rows()[k][0]}`).to.be.empty;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateElementNotPresentInJSON(
  json: any,
  inputTable: DataTable
) {
  for (const k in inputTable.rows()) {
    const result = JSONPath({ path: `${inputTable.rows()[k][0]}`, json });
    //   console.log(`${inputTable.rows()[k][0]} : ${result}`);
    if (inputTable.rows()[k][1] != "null") {
      //    expect(result, `${inputTable.rows()[k][0]}`).not.to.be.empty
      if (inputTable.rows()[k][1] != "any")
        expect(result.toString(), `${inputTable.rows()[k][0]}`).to.not.match(
          new RegExp(inputTable.rows()[k][1])
        );
    } else {
      expect(result, `${inputTable.rows()[k][0]}`).to.be.empty;
    }
  }
}

export function generateCartHash(cart: CartResponse): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(cart.lineItems))
    .digest("hex");
}

/**
 * Generates a random number with given digits
 */
export function generateRandomNumber(digits: number): number {
  return (
    Math.floor(
      Math.random() * (Math.pow(10, digits) - Math.pow(10, digits - 1))
    ) + Math.pow(10, digits - 1)
  );
}

export function generateCartHMACSig(
  cart: CartResponse,
  pspRef,
  merchantReference,
  hmacKey,
  merchantAccountCode
): string {
  // console.log("I'm here");
  // console.log(cart);

  // // //get the hmacKey for the brand from brand config
  // // let hmacKey =
  // //   "780B1E3E4FF9D05E27FC715DFB7139C1FF12B4FD4BE586EF2829B096E3BF92C2";
  let hashingInput = `${pspRef}::${merchantAccountCode}:${merchantReference}:${cart.totalPrice.centAmount}:${cart.totalPrice.currencyCode}:AUTHORISATION:true`;
  // Step 4: Convert the HMAC key to the binary representation.
  const hmac = crypto.createHmac("sha256", Buffer.from(hmacKey, "hex"));
  hmac.update(hashingInput);

  // console.log("hasing input" + hashingInput);

  // Step 5: Calculate the HMAC with the signing string
  // Step 6: Encode the result using the Base64 encoding scheme to obtain the signature.
  return hmac.digest("base64");
}

export function getCTInstance(brandId: string) {
  if (world[`${brandId}_ct`] === undefined) {
    world[`${brandId}_ct`] = new CTHelper(
      brandId,
      world.config.globals.commercetools.ctAuthAPIURL,
      world.config.globals.commercetools.ctAPIURL
    );
  }

  return world[`${brandId}_ct`];
}

export async function getCRMInstance(brandId: string) {
  let getPrivateConfigResponse: AxiosResponse = await getPrivateConfig(
    world.config[`${world.brandId}`].brandId
  );
  const brazeAPIKey =
    getPrivateConfigResponse.data.getPrivateConfig.externalProviders
      .filter((e) => e.type == "BRAZE")[0]
      .providerConfigs.filter((e) => e.key == "api-key")[0].value;
  const brazeEndpoint =
    getPrivateConfigResponse.data.getPrivateConfig.externalProviders
      .filter((e) => e.type == "BRAZE")[0]
      .providerConfigs.filter((e) => e.key == "instance-url")[0].value;

  if (world[`${brandId}_crm`] === undefined) {
    world[`${brandId}_crm`] = new BrazeHelper(
      brandId,
      brazeEndpoint,
      brazeAPIKey
    );
  }

  return world[`${brandId}_crm`];
}

//tmp location for brand config helper files
export const getPrivateConfig = async (brandId: string) => {
  const instance = axios.create({
    baseURL: `${world.config.globals.shardConfig.bcs_baseURL}`,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": world.config.globals.shardConfig["xApiKey"],
    },
    responseType: "json",
    timeout: 3000,
    validateStatus: function (status) {
      return status >= 200; // Resolve any status code >= 200 , assertion to be checked in the test step
    },
  });

  const request = {
    query: `query getPrivateConfig($brandId: ID!) {
      getPrivateConfig(brandId: $brandId) {
        identityProvider {
          brandId
          clientId
          clientSecret
          endpoint
          provider
          region
          userPoolId
        }
        externalProviders {
          brandId
          providerConfigs {
              key
              value
          }
          type
        }
      }
    }`,
    variables: `{"brandId":"${brandId}"}`,
  };

  const response: AxiosResponse = await instance.post(graphQL, request);

  return response.data;
};

export const getPublicConfig = async (brandId: string) => {
  const instance = axios.create({
    baseURL: `${world.config.globals.shardConfig.bcs_baseURL}`,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": world.config.globals.shardConfig.xApiKey,
    },
    responseType: "json",
    timeout: 3000,
    validateStatus: function (status) {
      return status >= 200; // Resolve any status code >= 200 , assertion to be checked in the test step
    },
  });

  const request = {
    query: `query getPublicConfig ($brandId: ID!) {
      getPublicConfig (brandId: $brandId) {
          brand {
              brandId
              etld
              tenantId
          }
          featureFlags {
              brandId
              enable
              name
              description
          }
          configMap {
        brandId
        items {
          key
          value
        }
        type
      }
      }
  }`,
    variables: `{"brandId":"${brandId}"}`,
  };

  const response: AxiosResponse = await instance.post(graphQL, request);

  return response.data;
};
