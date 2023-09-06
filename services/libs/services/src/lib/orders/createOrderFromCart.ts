import { buildCTPApiBuilder } from "@ei-services/commerce-tools";
import {
  BrandConfigCachedClient,
  EXTERNAL_PROVIDER_TYPES,
} from "@ei-services/brand-config";
import { Order } from "@commercetools/platform-sdk";

let brandConfigClient: BrandConfigCachedClient = null;

export interface RequestMetadata {
  brandId: string;
  cartId: string;
  cartVersion: number;
  orderNumber: string;
  customFields: {
    orderUserMarketingPreference?: "opt_in" | "opt_out";
    orderUserTimeZone?: string;
    last4Digits: string;
    paymentMethod: string;
  };
}

const createOrderFromCart = async (
  requestMetadata: RequestMetadata
): Promise<Order> => {
  brandConfigClient = brandConfigClient || new BrandConfigCachedClient();

  const config = await brandConfigClient.getProviderConfig(
    requestMetadata.brandId,
    [
      "ct-project-key",
      "ct-api-url",
      "ct-client-id",
      "ct-client-secret",
      "ct-auth-url",
    ],
    EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
  );

  const projectKey = config["ct-project-key"];
  const apiHost = config["ct-api-url"];

  const ctApiBuilder = buildCTPApiBuilder({
    apiHost,
    projectKey,
    accessToken: null,
    debug: true,
    authType: "client_credentials",
    authMiddlewareOptions: {
      host: config["ct-auth-url"],
      projectKey,
      credentials: {
        clientId: config["ct-client-id"],
        clientSecret: config["ct-client-secret"],
      },
      scopes: [`manage_orders:${projectKey}`],
    },
  });

  const order = await ctApiBuilder
    .withProjectKey({ projectKey })
    .orders()
    .post({
      body: {
        id: requestMetadata.cartId,
        version: requestMetadata.cartVersion,
        orderNumber: requestMetadata.orderNumber,
        custom: {
          type: {
            key: "emcOrderDetails",
            typeId: "type",
          },
          fields: {
            emcUserMarketingPreference:
              requestMetadata.customFields.orderUserMarketingPreference,
            emcUserTimeZone: requestMetadata.customFields.orderUserTimeZone,
            emcLast4Digits: requestMetadata.customFields.last4Digits,
            emcPaymentMethod: requestMetadata.customFields.paymentMethod,
          },
        },
      },
    })
    .execute();

  return order.body;
};

export default createOrderFromCart;
