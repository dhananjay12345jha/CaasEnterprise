import {
  EXTERNAL_PROVIDER_TYPES,
  getBrandConfigCachedClient,
  PAYMENT_CONFIG_KEYS,
} from "@ei-services/brand-config";

export async function getAdyenHmacKey(brandId: string): Promise<string> {
  const brandConfig = getBrandConfigCachedClient();
  const globalConfig = await brandConfig.fetchExternalProviderConfigs(
    brandId,
    EXTERNAL_PROVIDER_TYPES.PAYMENT
  );
  const hmacKeyValue = globalConfig.find(
    (n) => n.key === PAYMENT_CONFIG_KEYS.ADYEN_HMAC_KEY
  );
  if (!hmacKeyValue || !hmacKeyValue.value) {
    throw Error("Unable to get HMAC key from brand config");
  }

  return hmacKeyValue.value;
}
