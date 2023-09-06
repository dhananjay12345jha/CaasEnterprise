import {
  getBrandConfigCachedClient,
  EXTERNAL_PROVIDER_TYPES,
  OMS_CONFIG_KEYS,
  SPECIAL_BRAND_IDS,
  OmsProviderConfig,
} from "@ei-services/brand-config";

const getOmsPresharedKey = async () => {
  const config =
    await getBrandConfigCachedClient().getProviderConfig<OmsProviderConfig>(
      SPECIAL_BRAND_IDS.GLOBAL,
      [OMS_CONFIG_KEYS.EMC_WEBHOOK_API_KEY],
      EXTERNAL_PROVIDER_TYPES.OMS
    );

  return config[OMS_CONFIG_KEYS.EMC_WEBHOOK_API_KEY];
};

export const validatePsk = async (input: string) => {
  const validPsk = await getOmsPresharedKey();
  return input === validPsk;
};
