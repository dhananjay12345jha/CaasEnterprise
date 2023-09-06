import { UserAlias, UserAttributes, toFnv1a } from "@ei-services/braze-service";
import {
  BRAND_META,
  BRAZE_CONFIG_KEYS,
  BrazeProviderConfig,
  EXTERNAL_PROVIDER_TYPES,
  getBrandConfigCachedClient,
} from "@ei-services/brand-config";
import { strict as assert } from "node:assert";

export interface BrandMeta {
  brandId: string;
  brandName: string;
  languageCode: string;
  countryCode: string;
}

export interface BrazeConfig {
  apiKey: string;
  defaultCountryCode: string;
  appGroupWeb: string;
  passwordResetCanvasId: string;
  baseURL: string;
}

export interface ExternalIdIdentity {
  type: "ExternalId";
  id: string;
}

export interface UserAliasIdentity {
  type: "UserAlias";
  alias: UserAlias;
}

export type UserIdentity = ExternalIdIdentity | UserAliasIdentity;

export abstract class CRMBaseClass {
  async getBrazeServiceConfig<T extends Record<string, BRAZE_CONFIG_KEYS>>(
    brandId: string,
    requestedConfigKeys: T
  ): Promise<Record<keyof T, string>> {
    const brandConfigKeys = Object.values(requestedConfigKeys);
    const resolvedConfig =
      await getBrandConfigCachedClient().getProviderConfig<BrazeProviderConfig>(
        brandId,
        brandConfigKeys,
        EXTERNAL_PROVIDER_TYPES.BRAZE
      );
    const checkedConfigEntries = Object.entries(requestedConfigKeys).map(
      ([ownKey, brandConfigKey]) => {
        const configValue = resolvedConfig[brandConfigKey];
        assert.ok(
          configValue,
          `Expected '${brandConfigKey}' from brand config to be defined`
        );
        return [ownKey, configValue];
      }
    );
    return Object.fromEntries(checkedConfigEntries) as Record<keyof T, string>;
  }

  async getBrandMeta(
    brandId: string,
    brazeConfig: { defaultCountryCode: string }
  ): Promise<BrandMeta> {
    const brandName = await this.getBrandName(brandId);
    const languageCode = await this.getBrandLanguageCode(brandId);
    return {
      brandId,
      brandName,
      languageCode,
      countryCode: brazeConfig.defaultCountryCode,
    };
  }

  async getBrandName(brandId: string): Promise<string> {
    const brandName = await getBrandConfigCachedClient().getConfigMapItem(
      brandId,
      BRAND_META.BRAND_NAME
    );
    assert.ok(brandName);
    return brandName;
  }

  async getBrandLanguageCode(brandId: string): Promise<string> {
    const languageCode = await getBrandConfigCachedClient().getConfigMapItem(
      brandId,
      BRAND_META.LANGUAGE_CODE
    );
    assert.ok(languageCode);
    return languageCode;
  }

  buildUserAlias(brandId: string, aliasValue: string): UserAlias {
    return {
      alias_name: this.generateUserAliasId(brandId, aliasValue),
      alias_label: "user_key",
    };
  }

  buildExternalId(brandId: string, customerId: string) {
    return `${brandId}:${customerId}`;
  }

  generateUserAliasId(brandId: string, aliasValue: string) {
    return `${brandId}:${toFnv1a(aliasValue, 128)}`;
  }

  getBrazeSubscriptionStatus(
    marketingPreference: string | undefined
  ): string | null {
    switch (marketingPreference) {
      case "opt_in":
        return "opted_in";
      case "opt_out":
        return "unsubscribed";
      case "not_opt_in":
        return "not_opt_in"; // to support potential data coming from checkout steps
      case undefined:
        return null;
      default:
        throw new Error(
          `Unexpected value on marketingPreference: ${marketingPreference}`
        );
    }
  }
}
