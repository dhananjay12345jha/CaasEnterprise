"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandConfigClient = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@apollo/client/core");
const aws_appsync_auth_link_1 = require("aws-appsync-auth-link");
const apollo_cache_policies_1 = require("@nerdwallet/apollo-cache-policies");
const credential_provider_node_1 = require("@aws-sdk/credential-provider-node");
const aws_appsync_subscription_link_1 = require("aws-appsync-subscription-link");
const cross_fetch_1 = tslib_1.__importDefault(require("cross-fetch"));
class BrandConfigClient {
    constructor(endpoint, cacheOptions) {
        this.cacheOptions = cacheOptions;
        this.getBrandPrivateConfigQuery = () => (0, core_1.gql) `
    query getPrivateConfig($brandId: ID!) {
      getPrivateConfig(brandId: $brandId) {
        brand {
          brandId
          etld
          tenantId
        }
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
          type
          providerConfigs {
            key
            value
          }
        }
      }
    }
  `;
        this.getBrandRoutingConfigQuery = () => (0, core_1.gql) `
      query getRoutingConfig($etld: String!) {
        getRoutingConfig(etld: $etld) {
          brand {
            brandId
            etld
            tenantId
          }
          privateEndpoints {
            brandId
            endpointScope
            token
            type
            url
          }
          publicEndpoints {
            brandId
            endpointScope
            token
            type
            url
          }
        }
      }
    `;
        this.getBrandPublicConfigQuery = () => (0, core_1.gql) `
      query getPublicConfig($brandId: ID!) {
        getPublicConfig(brandId: $brandId) {
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
            type
            items {
              key
              value
            }
          }
        }
      }
    `;
        this.getBrandAliasQuery = () => (0, core_1.gql) `
      query getBrandAlias($aliasId: ID!) {
        getBrandAlias(aliasId: $aliasId) {
          aliasId
          brandId
        }
      }
    `;
        const url = endpoint;
        const region = process.env.AWS_REGION;
        const auth = {
            type: "AWS_IAM",
            credentials: (0, credential_provider_node_1.defaultProvider)(),
        };
        const link = core_1.ApolloLink.from([
            (0, aws_appsync_auth_link_1.createAuthLink)({ url, region, auth }),
            (0, aws_appsync_subscription_link_1.createSubscriptionHandshakeLink)({ url, region, auth }, new core_1.HttpLink({ uri: url, fetch: cross_fetch_1.default })),
        ]);
        this.appSyncClient = new core_1.ApolloClient({
            link,
            cache: new apollo_cache_policies_1.InvalidationPolicyCache({
                invalidationPolicies: {
                    timeToLive: cacheOptions.stdTTL ?? 30000,
                    renewalPolicy: apollo_cache_policies_1.RenewalPolicy.AccessAndWrite,
                },
            }),
            defaultOptions: {
                query: {
                    fetchPolicy: cacheOptions.enabled ? "cache-first" : "no-cache",
                },
            },
        });
    }
    async getPrivateConfig(brandId) {
        const variables = {
            brandId: brandId,
        };
        const brandPrivateConfigResponse = await this.appSyncClient.query({
            query: this.getBrandPrivateConfigQuery(),
            variables,
        });
        this.validateGraphQLResponse(brandPrivateConfigResponse);
        return brandPrivateConfigResponse.data;
    }
    async getRoutingConfig(etld) {
        const variables = {
            etld: etld,
        };
        const brandRoutingConfigResponse = await this.appSyncClient.query({
            query: this.getBrandRoutingConfigQuery(),
            variables,
        });
        this.validateGraphQLResponse(brandRoutingConfigResponse);
        return brandRoutingConfigResponse.data;
    }
    async getPublicConfig(brandId) {
        const variables = {
            brandId: brandId,
        };
        const brandPublicConfigResponse = await this.appSyncClient.query({
            query: this.getBrandPublicConfigQuery(),
            variables,
        });
        this.validateGraphQLResponse(brandPublicConfigResponse);
        return brandPublicConfigResponse.data;
    }
    async getBrandForAlias(aliasId, aliasType) {
        const COMPOUND_SEPERATOR = "#";
        const compoundId = `${aliasType}${COMPOUND_SEPERATOR}${aliasId}`;
        const getBrandAliasQuery = this.getBrandAliasQuery();
        const variables = {
            aliasId: compoundId,
        };
        const brandAliasResponse = await this.appSyncClient.query({
            query: getBrandAliasQuery,
            variables,
        });
        this.validateGraphQLResponse(brandAliasResponse);
        return brandAliasResponse.data;
    }
    validateGraphQLResponse(response) {
        if (response?.errors?.find((e) => e?.message?.length > 0)) {
            const errorMessage = `Query failed with errors: ${JSON.stringify(response?.errors)}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
exports.BrandConfigClient = BrandConfigClient;
//# sourceMappingURL=brand-config-client.js.map