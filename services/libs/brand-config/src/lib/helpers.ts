import { getBrandConfigCachedClient } from "./singleton";
import { BRAND_FOR_ALIAS_TYPES } from "./types";

export const resolveBrandIdFromOms = (omsBrandId: string) => {
  return getBrandConfigCachedClient().getBrandIdForAlias(
    omsBrandId,
    BRAND_FOR_ALIAS_TYPES.OMS
  );
};

export const getBrandStorefrontUrl = async (
  brandId: string
): Promise<string> => {
  const brandConfigClient = getBrandConfigCachedClient();
  const {
    getPublicConfig: { brand },
  } = await brandConfigClient.getPublicConfig(brandId);
  const {
    getRoutingConfig: { publicEndpoints },
  } = await brandConfigClient.getRoutingConfig(brand.etld);
  const storefrontUrl = publicEndpoints.find(
    (endpoint) => endpoint.type === "WEB_STOREFRONT"
  );
  return storefrontUrl.url;
};
