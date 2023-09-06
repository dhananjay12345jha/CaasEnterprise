import { DataTable } from "@cucumber/cucumber";
import { world } from "./custom.world";
import { v4 as uuidv4 } from "uuid";
import {
  AdminDeleteUserCommand,
  AdminDeleteUserCommandOutput,
  CognitoIdentityProviderClient,
  GetUserCommand,
  GetUserCommandOutput,
  ListUsersCommand,
  ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import axios, { AxiosResponse } from "axios";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export function generateRequestPayload(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templateReqJson: any,
  inputTable: DataTable
) {
  for (const key in inputTable.hashes()[0]) {
    //Todo:move to foreach
    let transformedInput;
    const inKey = inputTable.hashes()[0][key];

    switch (true) {
      case /<fromConfig>/.test(inKey):
        transformedInput = world.config[key];
        break;
      case /None/.test(inKey):
        transformedInput = null;
        break;
      case /[0-9]+\.toInt/.test(inKey): {
        transformedInput = parseInt(inKey.match(/([0-9]+)\.toInt/)[1]);
        break;
      }
      default:
        transformedInput = inputTable.hashes()[0][key];
    }
    if (transformedInput != null) templateReqJson[key] = transformedInput;
    else {
      delete templateReqJson[key];
    }
  }
  return JSON.stringify(templateReqJson);
}

export async function getAUserFromAUserPool(userPoolId: string, query: string) {
  if (world.cognitoServiceProvider == null) {
    // Initialize CogntioIdentityServiceProvider SDK.
    world.cognitoServiceProvider = new CognitoIdentityProviderClient({
      region: "eu-west-1",
    });
  }
  world.log.debug("getting user " + query + " from user pool: " + userPoolId);
  const params = {
    UserPoolId: `${userPoolId}`,
    Filter: `${query}`,
    Limit: 1,
  };

  try {
    const data: ListUsersCommandOutput =
      await world.cognitoServiceProvider.send(new ListUsersCommand(params));
    return data; //will return an empty users array if user is not found
  } catch (err) {
    console.log("Cognito Error", err);
    return undefined;
  }
}

export async function getDecodedJWTToken(brand: string, accessToken: string) {
  let tokenPayload;
  const brandId = world.config[`${brand}`].brandId;
  const identityProviderResponse = await getPrivateIdentityProviderConfig(
    brandId
  );
  const userPoolId =
    identityProviderResponse.data.getPrivateConfig.identityProvider.userPoolId;
  const clientId =
    identityProviderResponse.data.getPrivateConfig.identityProvider.clientId;
  const verifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    tokenUse: "access",
    clientId: clientId,
  });

  try {
    tokenPayload = await verifier.verify(accessToken);
    // console.logc(tokenPayload);
  } catch (e) {
    throw e.message;
  }

  return tokenPayload;
}

export async function getUserDetails(accessToken: string) {
  if (world.cognitoServiceProvider == null) {
    // Initialize CogntioIdentityServiceProvider SDK.
    world.cognitoServiceProvider = new CognitoIdentityProviderClient({
      region: "eu-west-1",
    });
  }
  const params = {
    AccessToken: `${accessToken}`,
  };

  try {
    const data: GetUserCommandOutput = await world.cognitoServiceProvider.send(
      new GetUserCommand(params)
    );
    return data;
  } catch (err) {
    // console.log('Cognito Error', err);
    return err;
  }
}

export const getPrivateIdentityProviderConfig = async (brandId: string) => {
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

  const response: AxiosResponse = await instance.post(
    world.config.globals.shardConfig.bcs_baseURL,
    request
  );

  return response.data;
};

export async function deleteUserDetails(userPoolId: string, userName: string) {
  if (world.cognitoServiceProvider == null) {
    // Initialize CogntioIdentityServiceProvider SDK.
    world.cognitoServiceProvider = new CognitoIdentityProviderClient({
      region: "eu-west-1",
    });
  }
  const params = {
    UserPoolId: userPoolId,
    Username: userName,
  };

  try {
    const data: AdminDeleteUserCommandOutput =
      await world.cognitoServiceProvider.send(
        new AdminDeleteUserCommand(params)
      );
    return data;
  } catch (err) {
    return err;
  }
}

export function generateRandomUser() {
  return uuidv4() + "@everymile.com";
}
