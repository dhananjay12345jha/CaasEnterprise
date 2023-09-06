import {
  BrandConfigCachedClient,
  EXTERNAL_PROVIDER_TYPES,
  PAYMENT_CONFIG_KEYS,
  SPECIAL_BRAND_IDS,
} from "@ei-services/brand-config";
import { ExternalProviderConfig } from "@everymile-idp/brand-config-sdk";
import { getAdyenHmacKey } from ".";

const hmacKeyValues: ExternalProviderConfig[] = [
  {
    key: PAYMENT_CONFIG_KEYS.ADYEN_HMAC_KEY,
    value: "valuevaluevalue",
  },
];

const externalProviderMock = jest
  .spyOn(BrandConfigCachedClient.prototype, "fetchExternalProviderConfigs")
  .mockResolvedValue(hmacKeyValues);

describe("getAdyenHmacKey", () => {
  it("Requests brand config correctly", async () => {
    const brandId = "random-brand-id";
    const result = await getAdyenHmacKey(brandId);

    expect(externalProviderMock).toHaveBeenLastCalledWith(
      brandId,
      EXTERNAL_PROVIDER_TYPES.PAYMENT
    );
    expect(result).toBe(hmacKeyValues[0].value);
  });

  it("Throws correct error if config not found", async () => {
    const brandId = "random-brand-id";
    try {
      externalProviderMock.mockResolvedValueOnce([
        {
          key: "not right",
          value: "worse",
        },
      ]);
      await getAdyenHmacKey(brandId);
      // Should never reach here
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toEqual(new Error("Unable to get HMAC key from brand config"));
      expect(externalProviderMock).toHaveBeenLastCalledWith(
        brandId,
        EXTERNAL_PROVIDER_TYPES.PAYMENT
      );
    }
  });
});
