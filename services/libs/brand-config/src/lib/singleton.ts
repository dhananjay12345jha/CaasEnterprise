import { BrandConfigCachedClient } from "./brand-config";

let brandConfigCachedClient: BrandConfigCachedClient;

export function getBrandConfigCachedClient(): BrandConfigCachedClient {
  if (!brandConfigCachedClient) {
    brandConfigCachedClient = new BrandConfigCachedClient();
  }

  return brandConfigCachedClient;
}
