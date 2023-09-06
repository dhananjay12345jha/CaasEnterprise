import { BrazeConfig, CRMBaseClass } from "./index";
import {
  BrandConfigCachedClient,
  BRAZE_CONFIG_KEYS,
} from "@ei-services/brand-config";
import { AssertionError } from "assert/strict";

class TestClass extends CRMBaseClass {}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("buildExternalId", () => {
  const instance = new TestClass();

  it("SHOULD return composite string of brand and customer id value", async () => {
    const id = instance.buildExternalId("brand-1", "customer-value");

    expect(id).toBe("brand-1:customer-value");
  });

  it("SHOULD return composite string of brand and a different  customer id value if input is different", async () => {
    const id = instance.buildExternalId("brand-1", "other-customer-value");

    expect(id).toBe("brand-1:other-customer-value");
  });
});

describe("generateUserAliasId", () => {
  const instance = new TestClass();

  it("SHOULD return composite string of brand and hashed user value", async () => {
    const id = instance.generateUserAliasId("brand-1", "user-value");

    expect(id).toBe("brand-1:1yksdw2tvk7wmqucgo95qzbsa");
  });

  it("SHOULD return composite string of brand and a different hashed user value if input is different", async () => {
    const id = instance.generateUserAliasId("brand-1", "other-user-value");

    expect(id).toBe("brand-1:9w0a5pisxhr2l7ef4w4rugm43");
  });
});

describe("buildUserAlias", () => {
  const instance = new TestClass();

  it("SHOULD return object containing alias label and alias id", async () => {
    const id = instance.buildUserAlias("brand-1", "customer-value");

    expect(id).toEqual({
      alias_label: "user_key",
      alias_name: "brand-1:2ptqmzpr3aa3crn8o2yl9qv1x",
    });
  });
});

describe("getBrandMeta", () => {
  const instance = new TestClass();

  it(
    "SHOULD call brand config for brand name and language " +
      "AND return object containing meta data",
    async () => {
      const brandConfigClientMock = jest
        .spyOn(BrandConfigCachedClient.prototype, "getConfigMapItem")
        .mockResolvedValue("brand-A")
        .mockResolvedValue("lang-B");

      const meta = await instance.getBrandMeta("brand-1", {
        defaultCountryCode: "country-code-1",
      } as BrazeConfig);

      expect(brandConfigClientMock).toHaveBeenNthCalledWith(
        1,
        "brand-1",
        "brandName"
      );
      expect(brandConfigClientMock).toHaveBeenNthCalledWith(
        2,
        "brand-1",
        "languageCode"
      );
      expect(meta).toEqual({
        brandId: "brand-1",
        brandName: "lang-B",
        countryCode: "country-code-1",
        languageCode: "lang-B",
      });
    }
  );
});

describe("getBrandName", () => {
  const instance = new TestClass();

  it(
    "SHOULD call brand config with brand and code " +
      "AND return brandName from brand config",
    async () => {
      const brandConfigClientMock = jest
        .spyOn(BrandConfigCachedClient.prototype, "getConfigMapItem")
        .mockResolvedValue("brand-A");

      const name = await instance.getBrandName("brand-1");

      expect(brandConfigClientMock).toHaveBeenCalledWith(
        "brand-1",
        "brandName"
      );
      expect(name).toBe("brand-A");
    }
  );

  it("SHOULD throw assertion error if brand config returns nothing", async () => {
    const brandConfigClientMock = jest
      .spyOn(BrandConfigCachedClient.prototype, "getConfigMapItem")
      .mockResolvedValue("");

    const brandPromise = instance.getBrandName("brand-1");

    await expect(brandPromise).rejects.toThrowError(AssertionError);
    expect(brandConfigClientMock).toHaveBeenCalledWith("brand-1", "brandName");
  });
});

describe("getBrandLanguageCode", () => {
  const instance = new TestClass();

  it(
    "SHOULD call brand config with brand and code " +
      "AND return languageCode from brand config",
    async () => {
      const brandConfigClientMock = jest
        .spyOn(BrandConfigCachedClient.prototype, "getConfigMapItem")
        .mockResolvedValue("lang-A");

      const languageCode = await instance.getBrandLanguageCode("brand-1");

      expect(brandConfigClientMock).toHaveBeenCalledWith(
        "brand-1",
        "languageCode"
      );
      expect(languageCode).toBe("lang-A");
    }
  );

  it("SHOULD throw assertion error if brand config returns nothing", async () => {
    const brandConfigClientMock = jest
      .spyOn(BrandConfigCachedClient.prototype, "getConfigMapItem")
      .mockResolvedValue("");

    const brandPromise = instance.getBrandLanguageCode("brand-1");

    await expect(brandPromise).rejects.toThrowError(AssertionError);
    expect(brandConfigClientMock).toHaveBeenCalledWith(
      "brand-1",
      "languageCode"
    );
  });
});

describe("getBrazeSubscriptionStatus", () => {
  const instance = new TestClass();

  it("SHOULD return opted_in when passed opt_in", () => {
    expect(instance.getBrazeSubscriptionStatus("opt_in")).toBe("opted_in");
  });

  it("SHOULD return unsubscribed when passed opt_out", () => {
    expect(instance.getBrazeSubscriptionStatus("opt_out")).toBe("unsubscribed");
  });

  it("SHOULD return null if passed undefined", () => {
    expect(instance.getBrazeSubscriptionStatus(undefined)).toBe(null);
  });

  it("SHOULD throw error when encountering an unexpected error", () => {
    expect(() =>
      instance.getBrazeSubscriptionStatus("opt_outandabout")
    ).toThrowError(`Unexpected value on marketingPreference: opt_outandabout`);
  });
});

describe("getBrazeServiceConfig", () => {
  const instance = new TestClass();

  it("SHOULD return expected config object from brandConfigClient when passing all possible braze config keys", async () => {
    const brandConfigClientMock = jest
      .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
      .mockImplementationOnce(() =>
        Promise.resolve({
          ["api-key"]: "a2k34f",
          ["instance-url"]: "asdfasdf",
          ["app-group-web"]: "asdf",
          ["default-country-code"]: "country-test",
          ["password-reset-email-canvas-id"]: "cancas-test",
        })
      );

    const response = await instance.getBrazeServiceConfig("brandTest", {
      apiKey: BRAZE_CONFIG_KEYS.API_KEY,
      appGroupWeb: BRAZE_CONFIG_KEYS.API_APP_GROUP_WEB,
      baseURL: BRAZE_CONFIG_KEYS.API_BASE_URL,
      defaultCountryCode: BRAZE_CONFIG_KEYS.DEFAULT_COUNTRY_CODE,
      passwordResetCanvasId: BRAZE_CONFIG_KEYS.PASSWORD_RESET_CANVAS_ID,
    });

    expect(response).toStrictEqual({
      apiKey: "a2k34f",
      appGroupWeb: "asdf",
      baseURL: "asdfasdf",
      defaultCountryCode: "country-test",
      passwordResetCanvasId: "cancas-test",
    });
    expect(brandConfigClientMock).toHaveBeenCalledWith(
      "brandTest",
      [
        "api-key",
        "app-group-web",
        "instance-url",
        "default-country-code",
        "password-reset-email-canvas-id",
      ],
      "BRAZE"
    );
  });

  it("SHOULD return config for just the requested elements", async () => {
    const brandConfigClientMock = jest
      .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
      .mockImplementationOnce(() =>
        Promise.resolve({
          ["api-key"]: "test-apiKey",
          ["instance-url"]: "asdfasdf",
        })
      );

    const response = await instance.getBrazeServiceConfig("brandTest", {
      apiKey: BRAZE_CONFIG_KEYS.API_KEY,
      url: BRAZE_CONFIG_KEYS.API_BASE_URL,
    });

    expect(response).toStrictEqual({
      apiKey: "test-apiKey",
      url: "asdfasdf",
    });
    expect(brandConfigClientMock).toHaveBeenCalledWith(
      "brandTest",
      ["api-key", "instance-url"],
      "BRAZE"
    );
  });

  it("SHOULD throw an AssertionError if config does not provide a requested element", async () => {
    const brandConfigClientMock = jest
      .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
      .mockImplementationOnce(() =>
        Promise.resolve({
          ["api-key"]: "test-apiKey",
          // ["instance-url"]: "asdfasdf", MISSING
        })
      );

    const responsePromise = instance.getBrazeServiceConfig("brandTest", {
      apiKey: BRAZE_CONFIG_KEYS.API_KEY,
      url: BRAZE_CONFIG_KEYS.API_BASE_URL,
    });

    await expect(responsePromise).rejects.toThrowError(AssertionError);
    await expect(responsePromise).rejects.toThrowError(
      "Expected 'instance-url' from brand config to be defined"
    );
    expect(brandConfigClientMock).toHaveBeenCalledWith(
      "brandTest",
      ["api-key", "instance-url"],
      "BRAZE"
    );
  });
});
