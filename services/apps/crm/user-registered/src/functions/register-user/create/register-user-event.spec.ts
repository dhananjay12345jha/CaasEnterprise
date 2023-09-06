import { RegisterUser } from "./register-user-event";
import { faker } from "@faker-js/faker";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

afterEach(() => {
  jest.useRealTimers();
});

describe("RegisterUser", () => {
  const brazeTestConfig = {
    apiKey: "super-secret",
    baseURL: "https://braze-mock-url.example.com",
    defaultCountryCode: "default-country-code-one",
    passwordResetCanvasId: "canvasId-test",
    appGroupWeb: "appGroup-test",
  };

  describe("buildRegisterUserRequest()", () => {
    it("should construct a buildRegisterUserRequest", async () => {
      const customerId = faker.datatype.uuid();
      jest.useFakeTimers().setSystemTime(new Date("2022-09-20T10:15:30Z"));
      const instance = new RegisterUser();
      instance.getBrazeServiceConfig = jest
        .fn()
        .mockResolvedValueOnce(brazeTestConfig);

      const response = await instance.buildRegisterUserRequest(
        {
          brandId: "brand-1",
          brandName: "brand-A",
          countryCode: "country-a",
          languageCode: "lang-a",
        },
        customerId,
        {
          first_name: "foo",
          last_name: "bar",
          email: "foo@bar.com",
        }
      );

      expect(response).toStrictEqual({
        attributes: [
          {
            external_id: `brand-1:${customerId}`,
            email: "foo@bar.com",
            language_code: "lang-a",
            brand_name: "brand-A",
            country_code: "country-a",
            time_zone: "",
            account_status: "active",
            _update_existing_only: false,
            account_type: "full",
            profile_creation_date: "2022-09-20T10:15:30.000Z",
            first_name: "foo",
            last_name: "bar",
            email_subscribe: "subscribed", // need to come from auth
          },
        ],
      });
    });
  });

  describe("trackRegisterUserEvent()", () => {
    const checkoutClientMock = new MockAdapter(axios);

    beforeEach(() => {
      checkoutClientMock.reset();
    });

    it("successfully tracks a user registered event", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2022-09-20T10:15:30Z"));
      const instance = new RegisterUser();
      instance.getBrazeServiceConfig = jest
        .fn()
        .mockResolvedValueOnce(brazeTestConfig);
      instance.getBrandName = jest.fn().mockResolvedValue("Foo");
      instance.getBrandLanguageCode = jest.fn().mockResolvedValue("EN");
      checkoutClientMock.onPost("/users/track").reply(200, {
        attributes_processed: 1,
        message: "success",
      });

      await instance.trackRegisterUserEvent("brand-1", "test@test.com", {
        first_name: "foo",
        last_name: "bar",
        email: "foo@bar.com",
      });

      expect(checkoutClientMock.history.post[0].baseURL).toEqual(
        "https://braze-mock-url.example.com"
      );
      expect(checkoutClientMock.history.post[0].url).toEqual("/users/track");
      expect(checkoutClientMock.history.post[0].headers.Authorization).toEqual(
        "Bearer super-secret"
      );
      expect(JSON.parse(checkoutClientMock.history.post[0].data)).toEqual({
        attributes: [
          {
            _update_existing_only: false,
            account_status: "active",
            account_type: "full",
            brand_name: "Foo",
            country_code: "default-country-code-one",
            email: "foo@bar.com",
            email_subscribe: "subscribed",
            external_id: "brand-1:test@test.com",
            first_name: "foo",
            language_code: "EN",
            last_name: "bar",
            profile_creation_date: "2022-09-20T10:15:30.000Z",
            time_zone: "",
          },
        ],
      });
    });

    it("throws error on failed setMarketingPreference", async () => {
      const instance = new RegisterUser();
      instance.getBrazeServiceConfig = jest
        .fn()
        .mockResolvedValueOnce(brazeTestConfig);
      instance.getBrandName = jest.fn().mockResolvedValue("Foo");
      instance.getBrandLanguageCode = jest.fn().mockResolvedValue("EN");

      checkoutClientMock.onPost("/users/track").reply(200, {
        attributes_processed: 0,
        message: "error",
        errors: {
          message: "error",
        },
      });

      await expect(() =>
        instance.trackRegisterUserEvent("brand-1", "test@test.com", {
          first_name: "foo",
          last_name: "bar",
          email: "foo@bar.com",
        })
      ).rejects.toThrow(Error);

      expect(checkoutClientMock.history.post[0].baseURL).toEqual(
        "https://braze-mock-url.example.com"
      );
      expect(checkoutClientMock.history.post[0].url).toEqual("/users/track");
    });
  });
});
