import nock from "nock";
import { faker } from "@faker-js/faker";
import { BrazeClient } from "./braze-client";
import {
  BrazeApiClientConfig,
  TrackUserResponse,
  TrackUserRequest,
  UserOrderPlacedEvent,
} from "../interfaces";

describe("BrazeClient", () => {
  const baseURL = "http://localhost:8000";
  const retryBrazeApiClientConfig: BrazeApiClientConfig = {
    baseURL,
    apiKey: "super$ecret",
    shouldRetry: true,
    retryCount: 2,
    retryDelay: 100,
    logRetryRequests: true,
  };
  const brazeApiClientConfig: BrazeApiClientConfig = {
    baseURL,
    apiKey: "super$ecret",
    shouldRetry: false,
  };

  describe("constructor()", () => {
    it("correctly instantiates the object", async () => {
      const instance = new BrazeClient(brazeApiClientConfig);

      expect(instance.axiosInstance.defaults.baseURL).toBe(
        brazeApiClientConfig.baseURL
      );
      expect(instance.axiosInstance.defaults.headers["Authorization"]).toBe(
        `Bearer ${brazeApiClientConfig.apiKey}`
      );
    });
  });

  describe("trackUser()", () => {
    const expectedResponseBody: TrackUserResponse = {
      message: "success",
      errors: null,
      attributes_processed: 1,
      events_processed: 1,
      purchases_processed: 1,
    };

    const trackUserRequest: TrackUserRequest = {
      attributes: [
        {
          external_id: faker.datatype.string(),
          email: faker.internet.email(),
          language_code: faker.locale,
          brand_name: faker.datatype.string(),
          country_code: faker.datatype.string(),
          time_zone: faker.datatype.string(),
          account_status: faker.datatype.string(),
          _update_existing_only: faker.datatype.boolean(),
          account_type: faker.datatype.string(),
          profile_creation_date: faker.date.past().toISOString(),
          email_subscribe: faker.datatype.string(),
        },
      ],
      purchases: [
        {
          external_id: faker.datatype.string(),
          app_id: faker.datatype.string(),
          product_id: faker.commerce.product(),
          currency: faker.finance.currencyCode(),
          price: faker.datatype.number(),
          quantity: faker.datatype.number(),
          time: faker.datatype.datetime().toUTCString(),
        },
      ],
      events: [
        {
          external_id: faker.datatype.string(),
          name: faker.datatype.string(),
          time: faker.datatype.datetime().toUTCString(),
          properties: {
            products: [
              {
                image: faker.internet.url(),
                sku: faker.commerce.product(),
                name: faker.commerce.product(),
                quantity: faker.datatype.number(),
                product_attributes: [
                  {
                    label: faker.commerce.productAdjective(),
                    value: faker.commerce.productDescription(),
                  },
                ],
                purchase_price: faker.commerce.price().toString(),
                total_purchase_price: faker.commerce.price().toString(),
                page_url: faker.internet.url(),
              },
            ],
            order: {
              order_number: faker.datatype.string(),
              order_date: faker.datatype.datetime().toUTCString(),
              order_url: faker.internet.url(),
              order_total_products: faker.datatype.number(),
              gift_message: faker.datatype.string(),
            },
            promo: [
              {
                name: faker.datatype.string(),
                discount_amount: faker.commerce.price().toString(),
              },
            ],
            billing: {
              tax_total_amount: faker.commerce.price().toString(),
              total_discount_amount: faker.commerce.price().toString(),
              total_price: faker.commerce.price().toString(),
              basket_total: faker.commerce.price().toString(),
              shipping_price: faker.commerce.price().toString(),
              currency: faker.finance.currencyCode(),
              payment_method: faker.datatype.string(),
              payment_method_detail: faker.datatype.string(),
              address_same_as_shipping: faker.datatype.boolean(),
              title: faker.name.prefix(),
              company_name: faker.company.companyName(),
              first_name: faker.name.firstName(),
              last_name: faker.name.lastName(),
              address_line1: faker.address.street(),
              address_line2: faker.address.secondaryAddress(),
              county: faker.address.county(),
              city: faker.address.city(),
              postcode: faker.address.zipCode(),
              country: faker.address.countryCode(),
            },
            shipping: {
              delivery_method: faker.datatype.string(),
              delivery_date: faker.datatype.datetime().toUTCString(),
              title: faker.name.prefix(),
              company_name: faker.company.companyName(),
              first_name: faker.name.firstName(),
              last_name: faker.name.lastName(),
              address_line1: faker.address.street(),
              address_line2: faker.address.secondaryAddress(),
              county: faker.address.county(),
              city: faker.address.city(),
              postcode: faker.address.zipCode(),
              country: faker.address.countryCode(),
            },
          },
        } as UserOrderPlacedEvent,
      ],
    };

    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it("should make a call to Braze track user endpoint", async () => {
      const instance = new BrazeClient(brazeApiClientConfig);

      nock(baseURL).post("/users/track").reply(200, expectedResponseBody);

      // Act
      const actualResult = await instance.trackUser(trackUserRequest);

      // Assert
      expect(actualResult).toEqual(expectedResponseBody);
    });

    it("should retry 5xx calls to Braze track user endpoint", async () => {
      const instance = new BrazeClient(retryBrazeApiClientConfig);

      nock(baseURL)
        .post("/users/track")
        .reply(500)
        .post("/users/track")
        .delayConnection(200)
        .reply(200, expectedResponseBody);

      // Act
      const actualResult = await instance.trackUser(trackUserRequest);

      // Assert
      expect(actualResult).toEqual(expectedResponseBody);
    });

    it("should use default retry values if missing from config", async () => {
      const { retryCount, retryDelay, ...config } = retryBrazeApiClientConfig;
      const instance = new BrazeClient(config);

      nock(baseURL)
        .post("/users/track")
        .reply(500)
        .post("/users/track")
        .delayConnection(200)
        .reply(500)
        .post("/users/track")
        .delayConnection(200)
        .reply(200, expectedResponseBody);

      const actualResult = await instance.trackUser(trackUserRequest);

      expect(actualResult).toEqual(expectedResponseBody);
    });
  });

  describe("registerUser()", () => {
    it("should make a call correct call to Braze to register a user", async () => {
      const instance = new BrazeClient(brazeApiClientConfig);

      const expectedResponseBody = {
        message: "success",
        errors: null,
      };

      const registerUserRequest = {
        attributes: [
          {
            user_alias: {
              alias_name: "foo@bar.com",
              alias_label: "email",
            },
            email: "test@test.com",
            language_code: "EN",
            brand_name: "Test",
            country_code: "GB",
            time_zone: "Europe/London",
            account_status: "active",
            _update_existing_only: false,
            account_type: "full",
            profile_creation_date: "2022-09-20T10:15:30Z",
            first_name: "foo",
            last_name: "bar",
            email_subscribe: "subscribed",
          },
        ],
      };

      nock(baseURL).post("/users/track").reply(200, expectedResponseBody);

      // Act
      const actualResult = await instance.registerUser(registerUserRequest);

      // Assert
      expect(actualResult).toEqual(expectedResponseBody);
    });
  });
});
