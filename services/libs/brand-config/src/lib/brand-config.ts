import { BrandConfigClient } from "@everymile-idp/brand-config-sdk";
import { CacheOptions } from "@everymile-idp/brand-config-sdk/interfaces/cache-options";
import { ExternalProviderConfig } from "@everymile-idp/brand-config-sdk/models/typed-document-nodes";
import {
  BRAND_FOR_ALIAS_TYPES,
  EXTERNAL_PROVIDER_TYPES,
  ConfigMapItem,
  ConfigMapRow,
} from "./types";

export class BrandConfigCachedClient {
  private readonly brandConfigClient: BrandConfigClient;

  constructor() {
    const cacheOptions: CacheOptions = {
      enabled: true,
      stdTTL: 5 * 60,
    };

    this.brandConfigClient = new BrandConfigClient(
      process.env.BRAND_CONFIG_GQL_ENDPOINT ?? "",
      cacheOptions
    );
  }

  getPrivateConfig(brandId: string) {
    return this.brandConfigClient.getPrivateConfig(brandId);
  }

  getPublicConfig(brandId: string) {
    return this.brandConfigClient.getPublicConfig(brandId);
  }

  getRoutingConfig(etld: string) {
    return this.brandConfigClient.getRoutingConfig(etld);
  }

  async getBrandIdForAlias(aliasId: string, aliasType: BRAND_FOR_ALIAS_TYPES) {
    try {
      const response = await this.brandConfigClient.getBrandForAlias(
        aliasId,
        aliasType
      );

      return response.getBrandAlias.brandId;
    } catch (e) {
      throw new Error(
        `Could not resolve brandId from aliasId: "${aliasId}" and aliasType: "${aliasType}"`
      );
    }
  }

  async fetchExternalProviderConfigs(
    brandId: string,
    type: string
  ): Promise<Array<ExternalProviderConfig>> {
    const privateConfig = await this.getPrivateConfig(brandId);

    try {
      const externalProviderConfig =
        privateConfig.getPrivateConfig.externalProviders.find(
          (externalProvider) =>
            externalProvider.brandId === brandId &&
            externalProvider.type === type
        );

      return externalProviderConfig?.providerConfigs ?? [];
    } catch (e) {
      return [];
    }
  }

  async getProviderConfig<T>(
    brandId: string,
    keys: (keyof T)[],
    providerType: EXTERNAL_PROVIDER_TYPES
  ): Promise<Partial<T>> {
    const externalProviderConfigs = await this.fetchExternalProviderConfigs(
      brandId,
      providerType
    );

    return keys.reduce((result, configKey) => {
      const config = this.getExternalProviderConfigByKey(
        externalProviderConfigs,
        configKey as string
      );

      result[config.key] = config.value;
      return result;
    }, {});
  }

  async getConfigMapItem(brandId: string, key: string): Promise<string> {
    const publicConfig = await this.getPublicConfig(brandId);

    console.log("Found publicConfig", JSON.stringify(publicConfig));

    const configMapItems: ConfigMapRow[] =
      publicConfig?.getPublicConfig?.configMap;

    console.log(
      "Iterating over configMapItems",
      JSON.stringify(configMapItems)
    );

    const brandConfigMapItem = configMapItems.find(
      (configMapItem) => configMapItem.brandId === brandId
    ) as ConfigMapRow;

    if (brandConfigMapItem && brandConfigMapItem.items) {
      return (
        brandConfigMapItem?.items.find(
          (item: ConfigMapItem) => item.key === key
        )?.value ?? ""
      );
    }

    return "";
  }

  private getExternalProviderConfigByKey(
    externalProviderConfigs: ExternalProviderConfig[],
    key: string
  ): ExternalProviderConfig {
    const config = externalProviderConfigs.find(
      (providerConfig) => providerConfig.key === key
    );

    if (!config) {
      throw new Error(`Provider config for ${key} does not exist.`);
    }

    return config;
  }
}
