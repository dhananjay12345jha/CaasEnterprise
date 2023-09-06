import { NewsletterProfile } from "./create-newsletter-profile";
import { faker } from "@faker-js/faker";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { TrackUserRequest, UserAlias } from "@ei-services/braze-service";
import { BrandMeta } from "@ei-services/services";
import { NewsletterSignupMessage } from "./index";

describe("CreateNewsletterProfile", () => {
  const brazeTestConfig = {
    apiKey: "super-secret",
    baseURL: "https://braze-mock-url.example.com",
    defaultCountryCode: "default-country-code-one",
    passwordResetCanvasId: "canvasId-test",
    appGroupWeb: "appGroup-test",
  };
  const brandTestMeta: BrandMeta = {
    brandId: "brand-1",
    brandName: "Foo",
    countryCode: "EN",
    languageCode: "lang-a",
  };

  describe("buildCreateNewsletterProfileRequest()", () => {
    it("should construct a createNewsletterProfileRequest for opting in", async () => {
      const timezone = faker.datatype.string();
      const email = "test@test.com";
      const marketingPreference = "opt_in";
      const messageDate = faker.date.past().toISOString();

      const instance = new NewsletterProfile();

      const expectedUserAlias: UserAlias = {
        alias_name: `brand-1:665ocufch1x4zax8l6syjv42c`,
        alias_label: "user_key",
      };

      const newsletterSignupMessage: NewsletterSignupMessage = {
        timezone: timezone,
        email: email,
        marketingPreference: marketingPreference,
      };

      const brandMeta: BrandMeta = {
        brandId: "brand-1",
        brandName: "Foo",
        countryCode: "EN",
        languageCode: "lang-a",
      };

      const response = await instance.buildCreateNewsletterProfileRequest(
        brandMeta,
        newsletterSignupMessage,
        messageDate
      );

      const expectedNewsletterProfileCreationRequest: TrackUserRequest = {
        attributes: [
          {
            user_alias: expectedUserAlias,
            email: email,
            language_code: "lang-a",
            brand_name: "Foo",
            country_code: "EN",
            time_zone: timezone,
            email_subscribe: "opted_in",
            account_type: "newsletter",
            profile_creation_date: messageDate,
            _update_existing_only: false,
          },
        ],
        purchases: [],
        events: [],
      };

      expect(response).toStrictEqual(expectedNewsletterProfileCreationRequest);
    });

    it("should construct a createNewsletterProfileRequest for opting out", async () => {
      const timezone = faker.datatype.string();
      const email = "test@test.com";
      const marketingPreference = "opt_out";
      const messageDate = faker.date.past().toISOString();

      const instance = new NewsletterProfile();

      const expectedUserAlias: UserAlias = {
        alias_name: `brand-1:665ocufch1x4zax8l6syjv42c`,
        alias_label: "user_key",
      };

      const newsletterSignupMessage: NewsletterSignupMessage = {
        timezone: timezone,
        email: email,
        marketingPreference: marketingPreference,
      };

      const brandMeta: BrandMeta = {
        brandId: "brand-1",
        brandName: "Foo",
        countryCode: "EN",
        languageCode: "lang-a",
      };

      const response = await instance.buildCreateNewsletterProfileRequest(
        brandMeta,
        newsletterSignupMessage,
        messageDate
      );

      const expectedNewsletterProfileCreationRequest: TrackUserRequest = {
        attributes: [
          {
            user_alias: expectedUserAlias,
            email: email,
            language_code: "lang-a",
            brand_name: "Foo",
            country_code: "EN",
            time_zone: timezone,
            email_subscribe: "unsubscribed",
            account_type: "newsletter",
            profile_creation_date: messageDate,
            _update_existing_only: false,
          },
        ],
        purchases: [],
        events: [],
      };

      expect(response).toStrictEqual(expectedNewsletterProfileCreationRequest);
    });

    it("should throw error for invalid value on marketing preference", async () => {
      const timezone = faker.datatype.string();
      const email = "test@test.com";
      const marketingPreference = "INVALID_VALUE";
      const messageDate = faker.date.past().toISOString();

      const instance = new NewsletterProfile();
      instance.getBrazeServiceConfig = jest
        .fn()
        .mockResolvedValueOnce(brazeTestConfig);
      instance.getBrandName = jest.fn().mockResolvedValue("Foo");
      instance.getBrandLanguageCode = jest.fn().mockResolvedValue("EN");

      const newsletterSignupMessage: NewsletterSignupMessage = {
        timezone: timezone,
        email: email,
        marketingPreference: marketingPreference as "opt_in",
      };

      expect(() =>
        instance.buildCreateNewsletterProfileRequest(
          brandTestMeta,
          newsletterSignupMessage,
          messageDate
        )
      ).toThrow(Error);
    });
  });

  describe("setMarketingPreference()", () => {
    const clientMock = new MockAdapter(axios);

    it("successfully sets marketing preference of newsletter profile and returns execution status", async () => {
      const instance = new NewsletterProfile();
      instance.getBrazeServiceConfig = jest
        .fn()
        .mockResolvedValueOnce(brazeTestConfig);
      instance.getBrandName = jest.fn().mockResolvedValue("Foo");
      instance.getBrandLanguageCode = jest.fn().mockResolvedValue("EN");
      clientMock.onPost("/users/track").reply(200, {
        attributes_processed: 1,
        message: "success",
      });
      const newsletterSignupMessage: NewsletterSignupMessage = {
        timezone: "Europe/London",
        email: "test@test.com",
        marketingPreference: "opt_out",
      };

      await instance.setMarketingPreference(
        "brand-1",
        newsletterSignupMessage,
        new Date("2022-09-20T10:15:30Z").toISOString()
      );

      expect(clientMock.history.post[0].headers.Authorization).toEqual(
        "Bearer super-secret"
      );
      expect(clientMock.history.post[0].baseURL).toEqual(
        "https://braze-mock-url.example.com"
      );
      expect(clientMock.history.post[0].url).toEqual("/users/track");
      expect(JSON.parse(clientMock.history.post[0].data)).toEqual({
        attributes: [
          {
            _update_existing_only: false,
            account_type: "newsletter",
            brand_name: "Foo",
            country_code: "default-country-code-one",
            email: "test@test.com",
            email_subscribe: "unsubscribed",
            language_code: "EN",
            profile_creation_date: "2022-09-20T10:15:30.000Z",
            time_zone: "Europe/London",
            user_alias: {
              alias_label: "user_key",
              alias_name: "brand-1:665ocufch1x4zax8l6syjv42c",
            },
          },
        ],
        events: [],
        purchases: [],
      });
    });

    it("throws error on failed setMarketingPreference", async () => {
      const instance = new NewsletterProfile();
      instance.getBrazeServiceConfig = jest
        .fn()
        .mockResolvedValueOnce(brazeTestConfig);
      instance.getBrandName = jest.fn().mockResolvedValue("Foo");
      instance.getBrandLanguageCode = jest.fn().mockResolvedValue("EN");
      clientMock.onPost("/users/track").reply(200, {
        attributes_processed: 0,
        message: "error",
        errors: {
          message: "error",
        },
      });
      const newsletterSignupMessage: NewsletterSignupMessage = {
        timezone: "Europe/London",
        email: "test@test.com",
        marketingPreference: "opt_out",
      };

      await expect(() =>
        instance.setMarketingPreference(
          "brand-1",
          newsletterSignupMessage,
          new Date().toISOString()
        )
      ).rejects.toThrow(Error);

      expect(clientMock.history.post[0].baseURL).toEqual(
        "https://braze-mock-url.example.com"
      );
      expect(clientMock.history.post[0].url).toEqual("/users/track");
    });
  });
});
