import {
  AuthMiddlewareOptions,
  ClientBuilder,
  ExistingTokenMiddlewareOptions,
  HttpMiddlewareOptions,
} from "@commercetools/sdk-client-v2";
import {
  ApiRoot,
  createApiBuilderFromCtpClient,
} from "@commercetools/platform-sdk";

export enum CT_AUTH_TYPES {
  EXISTING_TOKEN = "existing_token",
  CLIENT_CREDENTIALS = "client_credentials",
}

export interface BuildCTPApiClient {
  projectKey: string;
  accessToken: string;
  region?: string;
  debug?: boolean;
  apiHost?: string;
  authType?: string;
  authMiddlewareOptions?: AuthMiddlewareOptions;
}

export const buildCTPApiBuilder = ({
  projectKey,
  accessToken,
  apiHost = null,
  debug = false,
  region = "europe-west1.gcp",
  authType = "existing_token",
  authMiddlewareOptions,
}: BuildCTPApiClient): ApiRoot => {
  const options: ExistingTokenMiddlewareOptions = {
    force: true,
  };

  const httpMiddlewareOptions: HttpMiddlewareOptions = {
    host: apiHost ?? `https://api.${region}.commercetools.com`,
    includeHeaders: true,
    enableRetry: true,
    retryConfig: {
      maxRetries: 3,
      retryDelay: 300,
      maxDelay: 5000,
      retryCodes: [503, 504],
    },
  };

  let ctpClient: ClientBuilder;
  switch (authType) {
    case "existing_token":
      ctpClient = new ClientBuilder()
        .withProjectKey(projectKey)
        .withExistingTokenFlow(accessToken, options)
        .withHttpMiddleware(httpMiddlewareOptions);
      break;
    case "client_credentials":
      ctpClient = new ClientBuilder()
        .withProjectKey(projectKey)
        .withClientCredentialsFlow(authMiddlewareOptions)
        .withHttpMiddleware(httpMiddlewareOptions);
      break;
  }

  if (debug === true) {
    ctpClient.withLoggerMiddleware();
  }

  const apiRoot = createApiBuilderFromCtpClient(ctpClient.build());

  return apiRoot;
};

export default buildCTPApiBuilder;
