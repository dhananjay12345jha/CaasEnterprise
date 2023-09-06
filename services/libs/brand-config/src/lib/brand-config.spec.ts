import { BrandConfigClient } from "@everymile-idp/brand-config-sdk";
import {
  ADYEN_CONFIG_KEYS,
  AdyenProviderConfig,
  BRAND_FOR_ALIAS_TYPES,
  CommerceToolsProviderConfig,
  CT_CONFIG_KEYS,
  EXTERNAL_PROVIDER_TYPES,
} from "./types";
import { BrandConfigCachedClient } from "./brand-config";

describe("brandConfig", () => {
  const brandId = "test";
  const etld = "some-domain.com";
  let brandConfig: BrandConfigCachedClient;

  beforeEach(() => {
    jest.clearAllMocks();
    brandConfig = new BrandConfigCachedClient();
  });

  it("should throw error if a provider cannot be found", async () => {
    jest.spyOn(brandConfig, "getPrivateConfig").mockResolvedValue({
      getPrivateConfig: {
        externalProviders: [],
      },
    });

    const expectedError = new Error(
      "Provider config for actual-brand-id does not exist."
    );

    await expect(() =>
      brandConfig.getProviderConfig(
        brandId,
        ["actual-brand-id"],
        EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
      )
    ).rejects.toThrow(expectedError);
  });

  it("should return an empty string when a provider is found but the type is not COMMERCEAPI", async () => {
    jest.spyOn(brandConfig, "getPrivateConfig").mockResolvedValue({
      getPrivateConfig: {
        externalProviders: [
          {
            brandId,
            type: "NOT-COMMERCEAPI",
            providerConfigs: [
              {
                key: "foo",
                value: "bar",
              },
            ],
          },
        ],
      },
    });

    const expectedError = new Error(
      "Provider config for actual-brand-id does not exist."
    );

    await expect(() =>
      brandConfig.getProviderConfig(
        brandId,
        ["actual-brand-id"],
        EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
      )
    ).rejects.toThrow(expectedError);
  });

  it("should return an empty string when a provider is found type is COMMERCEAPI but the ct-project-key does not exist", async () => {
    jest.spyOn(brandConfig, "getPrivateConfig").mockResolvedValue({
      getPrivateConfig: {
        externalProviders: [
          {
            brandId,
            type: EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS,
            providerConfigs: [
              {
                key: "foo",
                value: "bar",
              },
            ],
          },
        ],
      },
    });

    const expectedError = new Error(
      "Provider config for actual-brand-id does not exist."
    );

    await expect(() =>
      brandConfig.getProviderConfig(
        brandId,
        ["actual-brand-id"],
        EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
      )
    ).rejects.toThrow(expectedError);
  });

  it("getPrivateConfig initiates brandConfigClient private config using correct brandID", async () => {
    const privateConfigMock = jest
      .spyOn(BrandConfigClient.prototype, "getPrivateConfig")
      .mockResolvedValueOnce({} as any);

    await brandConfig.fetchExternalProviderConfigs(
      brandId,
      EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
    );

    expect(privateConfigMock.mock.calls[0][0]).toBe(brandId);
  });

  it("Should return an empty array when external providers are empty", async () => {
    jest.spyOn(brandConfig, "getPrivateConfig").mockResolvedValue({
      getPrivateConfig: {},
    });

    const result = await brandConfig.fetchExternalProviderConfigs(
      brandId,
      EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
    );
    expect(result).toStrictEqual([]);
  });

  it("should return an project-key-found when COMMERCEAPI exists and providerConfigs contains a ct-project-key", async () => {
    jest.spyOn(brandConfig, "getPrivateConfig").mockResolvedValue({
      getPrivateConfig: {
        externalProviders: [
          {
            brandId,
            type: EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS,
            providerConfigs: [
              {
                key: CT_CONFIG_KEYS.PROJECT_KEY,
                value: "project-key-found",
              },
            ],
          },
        ],
      },
    });

    const expectedError = new Error(
      "Provider config for actual-brand-id does not exist."
    );

    await expect(() =>
      brandConfig.getProviderConfig(
        brandId,
        ["actual-brand-id"],
        EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
      )
    ).rejects.toThrow(expectedError);
  });

  it("should return a brands public config", async () => {
    jest
      .spyOn(BrandConfigClient.prototype, "getPublicConfig")
      .mockResolvedValue({
        getPublicConfig: {
          brand: {
            etld: "some-domain",
            brandId,
            tenantId: "some-id",
          },
        },
      });

    const config = await brandConfig.getPublicConfig(brandId);
    expect(config.getPublicConfig.brand.brandId).toEqual(brandId);
    expect(config.getPublicConfig.brand.etld).toEqual("some-domain");
  });

  it("should return result for multiple external provider type key request", async () => {
    jest.spyOn(brandConfig, "getPrivateConfig").mockResolvedValue({
      getPrivateConfig: {
        externalProviders: [
          {
            brandId,
            type: EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS,
            providerConfigs: [
              {
                key: CT_CONFIG_KEYS.PROJECT_KEY,
                value: "project-key-found",
              },
            ],
          },
          {
            brandId,
            type: EXTERNAL_PROVIDER_TYPES.PAYMENT,
            providerConfigs: [
              {
                key: ADYEN_CONFIG_KEYS.MERCHANT_ACCOUNT_ID,
                value: "adyen-merchant-one",
              },
            ],
          },
        ],
      },
    });

    const actualCommerceServiceConfigResult =
      await brandConfig.getProviderConfig<CommerceToolsProviderConfig>(
        brandId,
        [CT_CONFIG_KEYS.PROJECT_KEY],
        EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
      );

    expect(actualCommerceServiceConfigResult).toStrictEqual({
      [CT_CONFIG_KEYS.PROJECT_KEY]: "project-key-found",
    });

    const actualPaymentConfigResult =
      await brandConfig.getProviderConfig<AdyenProviderConfig>(
        brandId,
        [ADYEN_CONFIG_KEYS.MERCHANT_ACCOUNT_ID],
        EXTERNAL_PROVIDER_TYPES.PAYMENT
      );

    expect(actualPaymentConfigResult).toStrictEqual({
      [ADYEN_CONFIG_KEYS.MERCHANT_ACCOUNT_ID]: "adyen-merchant-one",
    });
  });

  describe("getBrandIdForAlias()", () => {
    it("should resolve with our brandId value with correct params", async () => {
      const expectedBrandId = "3f92bfc4-d4da-4561-81b3-015d42be586c";
      jest
        .spyOn((brandConfig as any).brandConfigClient, "getBrandForAlias")
        .mockResolvedValue({
          getBrandAlias: {
            brandId: expectedBrandId,
            aliasId: "oms#1234",
          },
        });

      const result = await brandConfig.getBrandIdForAlias(
        "1234",
        BRAND_FOR_ALIAS_TYPES.OMS
      );

      expect(
        (brandConfig as any).brandConfigClient.getBrandForAlias
      ).toHaveBeenCalledTimes(1);

      expect(
        (brandConfig as any).brandConfigClient.getBrandForAlias
      ).toHaveBeenCalledWith("1234", BRAND_FOR_ALIAS_TYPES.OMS);

      expect(result).toEqual(expectedBrandId);
    });

    it("should reject with error when internal getBrandForAlias() rejects", async () => {
      const aliasId = "1234";

      jest
        .spyOn((brandConfig as any).brandConfigClient, "getBrandForAlias")
        .mockRejectedValue(new Error("something happened"));

      await expect(() =>
        brandConfig.getBrandIdForAlias(aliasId, BRAND_FOR_ALIAS_TYPES.OMS)
      ).rejects.toThrow(
        `Could not resolve brandId from aliasId: "${aliasId}" and aliasType: "${BRAND_FOR_ALIAS_TYPES.OMS}"`
      );
    });

    it("should reject with error when corresponding brandId value could not be found", async () => {
      const aliasId = "1234";

      jest
        .spyOn((brandConfig as any).brandConfigClient, "getBrandForAlias")
        .mockResolvedValue({
          getBrandAlias: null,
        });

      await expect(() =>
        brandConfig.getBrandIdForAlias(aliasId, BRAND_FOR_ALIAS_TYPES.OMS)
      ).rejects.toThrow(
        `Could not resolve brandId from aliasId: "${aliasId}" and aliasType: "${BRAND_FOR_ALIAS_TYPES.OMS}"`
      );
    });
  });

  describe("getConfigMapItem()", () => {
    it("should return the correct value for the key", async () => {
      jest
        .spyOn((brandConfig as any).brandConfigClient, "getPublicConfig")
        .mockResolvedValue({
          getPublicConfig: {
            brand: {
              etld: "some-domain",
              brandId,
              tenantId: "some-id",
            },
            configMap: [
              {
                brandId,
                items: [
                  {
                    key: "my-key",
                    value: "my-value",
                  },
                ],
              },
            ],
          },
        });

      const result = await brandConfig.getConfigMapItem(brandId, "my-key");

      expect(
        (brandConfig as any).brandConfigClient.getPublicConfig
      ).toHaveBeenCalledTimes(1);

      expect(
        (brandConfig as any).brandConfigClient.getPublicConfig
      ).toHaveBeenCalledWith(brandId);

      expect(result).toEqual("my-value");
    });
  });

  describe("getRoutingConfig()", () => {
    const routingConfig = {
      getRoutingConfig: {
        publicEndpoints: [
          {
            type: "WEB_STOREFRONT",
            url: "https://www.some-url.com",
            brandId,
          },
        ],
      },
    };

    it("should return routing config for brand", async () => {
      jest
        .spyOn((brandConfig as any).brandConfigClient, "getRoutingConfig")
        .mockResolvedValue(routingConfig);

      const result = await brandConfig.getRoutingConfig(etld);

      expect(
        (brandConfig as any).brandConfigClient.getRoutingConfig
      ).toHaveBeenCalledTimes(1);

      expect(
        (brandConfig as any).brandConfigClient.getRoutingConfig
      ).toHaveBeenCalledWith(etld);

      expect(result).toEqual(routingConfig);
    });
  });
});
