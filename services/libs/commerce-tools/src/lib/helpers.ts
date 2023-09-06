import { ByProjectKeyRequestBuilder } from "@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder";
import { buildCTPApiBuilder, CT_AUTH_TYPES } from "./api-builder";
import {
  EXTERNAL_PROVIDER_TYPES,
  getBrandConfigCachedClient,
  CommerceToolsProviderConfig,
  CT_CONFIG_KEYS,
} from "@ei-services/brand-config";
import { Cart } from "@commercetools/platform-sdk";
import * as crypto from "crypto";

/**
 * Resolves CommerceTools SDK client instance that acts against customer/anonymous user's token
 * @param brandId
 * @param accessToken
 */
export async function buildCommerceToolsClient(
  brandId: string,
  accessToken: string
): Promise<ByProjectKeyRequestBuilder> {
  const brandConfigClient = getBrandConfigCachedClient();

  const config =
    await brandConfigClient.getProviderConfig<CommerceToolsProviderConfig>(
      brandId,
      [
        CT_CONFIG_KEYS.PROJECT_KEY,
        CT_CONFIG_KEYS.API_URL,
        CT_CONFIG_KEYS.REGION,
      ],
      EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
    );

  return buildCTPApiBuilder({
    projectKey: config[CT_CONFIG_KEYS.PROJECT_KEY],
    apiHost: config[CT_CONFIG_KEYS.API_URL],
    region: config[CT_CONFIG_KEYS.REGION],
    authType: CT_AUTH_TYPES.EXISTING_TOKEN,
    accessToken,
  }).withProjectKey({ projectKey: config[CT_CONFIG_KEYS.PROJECT_KEY] });
}

/**
 * Resolves CommerceTools SDK client instance that acts against client credentials
 * @param brandId
 * @param scopes
 */
export async function buildCommerceToolsGenericClient(
  brandId: string,
  scopes: string[]
): Promise<ByProjectKeyRequestBuilder> {
  const brandConfigClient = getBrandConfigCachedClient();

  const config =
    await brandConfigClient.getProviderConfig<CommerceToolsProviderConfig>(
      brandId,
      [
        CT_CONFIG_KEYS.PROJECT_KEY,
        CT_CONFIG_KEYS.API_URL,
        CT_CONFIG_KEYS.AUTH_URL,
        CT_CONFIG_KEYS.REGION,
        CT_CONFIG_KEYS.CLIENT_ID,
        CT_CONFIG_KEYS.CLIENT_SECRET,
      ],
      EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
    );

  const authMiddlewareOptions = {
    host: config[CT_CONFIG_KEYS.AUTH_URL],
    projectKey: config[CT_CONFIG_KEYS.PROJECT_KEY],
    credentials: {
      clientId: config[CT_CONFIG_KEYS.CLIENT_ID],
      clientSecret: config[CT_CONFIG_KEYS.CLIENT_SECRET],
    },
    scopes: scopes.map(
      (scope) => `${scope}:${config[CT_CONFIG_KEYS.PROJECT_KEY]}`
    ),
  };

  return buildCTPApiBuilder({
    projectKey: config[CT_CONFIG_KEYS.PROJECT_KEY],
    apiHost: config[CT_CONFIG_KEYS.API_URL],
    region: config[CT_CONFIG_KEYS.REGION],
    authType: CT_AUTH_TYPES.CLIENT_CREDENTIALS,
    accessToken: "",
    authMiddlewareOptions,
  }).withProjectKey({ projectKey: config[CT_CONFIG_KEYS.PROJECT_KEY] });
}

export function generateCartHash(cart: Cart): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(cart.lineItems))
    .digest("hex");
}
