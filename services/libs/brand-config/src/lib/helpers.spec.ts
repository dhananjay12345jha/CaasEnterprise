import { BRAND_FOR_ALIAS_TYPES } from "./types";
import { getBrandConfigCachedClient } from "./singleton";
import { getBrandStorefrontUrl, resolveBrandIdFromOms } from "./helpers";

import { EndpointType, EndpointScope } from "@everymile-idp/brand-config-sdk";

jest.mock("./singleton");

describe("Brand Config Helpers", () => {
  let brandConfigMock;
  const getBrandIdForAliasMock = jest.fn();
  const getPublicConfigMock = jest.fn();
  const getRoutingConfigMock = jest.fn();

  beforeEach(() => {
    brandConfigMock = {
      getBrandIdForAlias: getBrandIdForAliasMock,
      getPublicConfig: getPublicConfigMock,
      getRoutingConfig: getRoutingConfigMock,
    };

    jest.mocked(getBrandConfigCachedClient).mockReturnValue(brandConfigMock);
  });

  describe("resolveBrandIdFromOms()", () => {
    it("should call getBrandIdForAlias() with correct parameters", async () => {
      const expectedOmsBrandId = "1234";
      await resolveBrandIdFromOms(expectedOmsBrandId);

      expect(getBrandIdForAliasMock).toHaveBeenCalledTimes(1);
      expect(getBrandIdForAliasMock).toHaveBeenCalledWith(
        expectedOmsBrandId,
        BRAND_FOR_ALIAS_TYPES.OMS
      );
    });

    it("should resolve with our brandId when registered OMS brand Id is passed in", async () => {
      const expectedInternalBrandId = "7a733796-ae2c-4032-89f7-24d4c4179612";

      getBrandIdForAliasMock.mockResolvedValue(expectedInternalBrandId);
      const result = await resolveBrandIdFromOms("1234");

      expect(result).toEqual(expectedInternalBrandId);
    });

    it("should throw if getBrandIdForAlias() throws", async () => {
      getBrandIdForAliasMock.mockRejectedValue(new Error("some error"));

      await expect(() => resolveBrandIdFromOms("1234")).rejects.toThrow(
        "some error"
      );
    });
  });

  describe("getBrandStorefrontUrl()", () => {
    const brandId = "7a733796-ae2c-4032-89f7-24d4c4179612";

    it("should throw if getPublicConfig throws", async () => {
      getPublicConfigMock.mockRejectedValue(new Error("some error"));

      await expect(() => getBrandStorefrontUrl(brandId)).rejects.toThrow(
        "some error"
      );
    });

    it("should retrieve a brands storefront url", async () => {
      getPublicConfigMock.mockResolvedValue({
        getPublicConfig: {
          brand: {
            brandId,
            etld: "some-domain",
          },
        },
      });

      getRoutingConfigMock.mockResolvedValue({
        getRoutingConfig: {
          publicEndpoints: [
            {
              brandId,
              type: EndpointType.WebStorefront,
              url: "some-storefront-url",
              endpointScope: EndpointScope.Public,
            },
          ],
        },
      });

      const result = await getBrandStorefrontUrl(brandId);
      expect(result).toEqual("some-storefront-url");
    });
  });
});
