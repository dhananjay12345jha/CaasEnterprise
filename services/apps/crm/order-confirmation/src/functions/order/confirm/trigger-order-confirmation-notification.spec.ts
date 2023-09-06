import { OrderConfirmation } from "./trigger-order-confirmation-notification";
import { faker } from "@faker-js/faker";
import {
  calculateBasketTotal,
  formatCurrency,
  toFriendlyCountryName,
  TrackUserRequest,
  UserAlias,
  UserOrderPlacedEvent,
} from "@ei-services/braze-service";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { Payload as OrderCreatedMessage } from "@everymile-schemas/order-created";
import {
  generateFakeAddress,
  generateFakeLineItem,
  generateFakeMoney,
} from "./test-utils";
import { BrandMeta } from "@ei-services/services";
import { AssertionError } from "node:assert/strict";

describe("TriggerOrderConfirmationEmail", () => {
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
  const CT_IMAGE_THUMBNAIL_LABEL = "thumbnail";

  describe("buildOrderConfirmationNotificationRequest()", () => {
    it("should construct a OrderConfirmationNotificationRequest for registered user w/ marketing preferences", async () => {
      const customerId = "customer-abc";
      const locale = faker.locale;
      const brandId = "brand-1";
      const brazeAppId = faker.datatype.string();
      const orderDate = new Date().toISOString();
      const brazeMarketingPreference = "opted_in";
      const customerTimeZone = "Time/Zone";
      const instance = new OrderConfirmation();
      const lineItemOne = generateFakeLineItem(locale, "GBP");
      const lineItemTwo = generateFakeLineItem(locale, "GBP");

      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [lineItemOne, lineItemTwo],
        locale: locale,
        createdAt: orderDate,
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: "opt_in",
            emcUserTimeZone: customerTimeZone,
          },
        },
      };

      const response = await instance.buildOrderConfirmationNotificationRequest(
        orderCreatedMessage,
        { type: "ExternalId", id: "brand-1:customer-abc" },
        brazeAppId,
        {
          brandId: "brand-1",
          brandName: "brand-a",
          languageCode: "lang-a",
          countryCode: "country-a",
        }
      );

      const expectedOrderConfirmationNotificationRequest: TrackUserRequest = {
        attributes: [
          {
            external_id: `${brandId}:${customerId}`,
            time_zone: customerTimeZone,
            email_subscribe: brazeMarketingPreference,
          },
        ],
        purchases: [
          {
            external_id: `${brandId}:${customerId}`,
            app_id: brazeAppId,
            product_id: lineItemOne.name[locale],
            currency: lineItemOne.price.value.currencyCode,
            price: Number(
              formatCurrency(
                lineItemOne.price.value.centAmount,
                lineItemOne.price.value.fractionDigits
              )
            ),
            quantity: lineItemOne.quantity,
            time: orderDate,
          },
          {
            external_id: `${brandId}:${customerId}`,
            app_id: brazeAppId,
            product_id: lineItemTwo.name[locale],
            currency: lineItemTwo.price.value.currencyCode,
            price: Number(
              formatCurrency(
                lineItemTwo.price.value.centAmount,
                lineItemTwo.price.value.fractionDigits
              )
            ),
            quantity: lineItemTwo.quantity,
            time: orderDate,
          },
        ],
        events: [
          {
            external_id: `${brandId}:${customerId}`,
            name: "order_placed",
            time: orderDate,
            properties: {
              products: [
                {
                  image: lineItemOne.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemOne.variant.sku,
                  name: lineItemOne.name[locale],
                  quantity: lineItemOne.quantity,
                  product_attributes: lineItemOne.variant.attributes.map(
                    (attribute) => ({
                      label: attribute.name,
                      value: attribute.value[locale],
                    })
                  ),
                  purchase_price: formatCurrency(
                    lineItemOne.price.value.centAmount,
                    lineItemOne.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemOne.totalPrice.centAmount,
                    lineItemOne.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
                {
                  image: lineItemTwo.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemTwo.variant.sku,
                  name: lineItemTwo.name[locale],
                  quantity: lineItemTwo.quantity,
                  product_attributes: lineItemTwo.variant.attributes.map(
                    (attribute) => ({
                      label: attribute.name,
                      value: attribute.value[locale],
                    })
                  ),
                  purchase_price: formatCurrency(
                    lineItemTwo.price.value.centAmount,
                    lineItemTwo.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemTwo.totalPrice.centAmount,
                    lineItemTwo.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
              ],
              order: {
                order_number: orderCreatedMessage.orderNumber,
                order_date: orderCreatedMessage.createdAt,
                order_url: "", // TODO: How to construct this URL??
                order_total_products: orderCreatedMessage.lineItems.reduce(
                  (n, { quantity }) => n + quantity,
                  0
                ),
              },
              billing: {
                tax_total_amount: formatCurrency(
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .centAmount,
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .fractionDigits
                ),
                total_price: formatCurrency(
                  orderCreatedMessage.totalPrice.centAmount,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                basket_total: calculateBasketTotal(
                  orderCreatedMessage.lineItems,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                shipping_price: formatCurrency(
                  orderCreatedMessage.shippingInfo?.price.centAmount,
                  orderCreatedMessage.shippingInfo?.price.fractionDigits
                ),
                currency: "£",
                address_same_as_shipping:
                  orderCreatedMessage.shippingAddress?.id ===
                  orderCreatedMessage.billingAddress?.id,
                title: orderCreatedMessage.billingAddress.title,
                company_name: orderCreatedMessage.billingAddress.company,
                first_name: orderCreatedMessage.billingAddress.firstName,
                last_name: orderCreatedMessage.billingAddress.lastName,
                address_line1: `${orderCreatedMessage.billingAddress.streetNumber} ${orderCreatedMessage.billingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.billingAddress.additionalStreetInfo,
                county: orderCreatedMessage.billingAddress.state,
                city: orderCreatedMessage.billingAddress.city,
                postcode: orderCreatedMessage.billingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.billingAddress.country
                ),
              },
              shipping: {
                delivery_method: "STRD1",
                title: orderCreatedMessage.shippingAddress.title,
                company_name: orderCreatedMessage.shippingAddress.company,
                first_name: orderCreatedMessage.shippingAddress.firstName,
                last_name: orderCreatedMessage.shippingAddress.lastName,
                address_line1: `${orderCreatedMessage.shippingAddress.streetNumber} ${orderCreatedMessage.shippingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.shippingAddress.additionalStreetInfo,
                county: orderCreatedMessage.shippingAddress.state,
                city: orderCreatedMessage.shippingAddress.city,
                postcode: orderCreatedMessage.shippingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.shippingAddress.country
                ),
              },
            },
          } as UserOrderPlacedEvent,
        ],
      };

      expect(response).toStrictEqual(
        expectedOrderConfirmationNotificationRequest
      );
    });

    it("should construct a OrderConfirmationNotificationRequest for registered user", async () => {
      const locale = faker.locale;
      const brazeAppId = faker.datatype.string();
      const orderDate = new Date().toISOString();
      const instance = new OrderConfirmation();
      const lineItemOne = generateFakeLineItem(locale, "GBP");
      const lineItemTwo = generateFakeLineItem(locale, "GBP");

      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [lineItemOne, lineItemTwo],
        locale: locale,
        createdAt: orderDate,
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
      };

      const response = await instance.buildOrderConfirmationNotificationRequest(
        orderCreatedMessage,
        { type: "ExternalId", id: "brand-1:customer-abc" },
        brazeAppId,
        {
          brandId: "brand-1",
          brandName: "brand-a",
          languageCode: "lang-a",
          countryCode: "country-a",
        }
      );

      const expectedOrderConfirmationNotificationRequest: TrackUserRequest = {
        attributes: [],
        purchases: [
          {
            external_id: "brand-1:customer-abc",
            app_id: brazeAppId,
            product_id: lineItemOne.name[locale],
            currency: lineItemOne.price.value.currencyCode,
            price: Number(
              formatCurrency(
                lineItemOne.price.value.centAmount,
                lineItemOne.price.value.fractionDigits
              )
            ),
            quantity: lineItemOne.quantity,
            time: orderDate,
          },
          {
            external_id: "brand-1:customer-abc",
            app_id: brazeAppId,
            product_id: lineItemTwo.name[locale],
            currency: lineItemTwo.price.value.currencyCode,
            price: Number(
              formatCurrency(
                lineItemTwo.price.value.centAmount,
                lineItemTwo.price.value.fractionDigits
              )
            ),
            quantity: lineItemTwo.quantity,
            time: orderDate,
          },
        ],
        events: [
          {
            external_id: "brand-1:customer-abc",
            name: "order_placed",
            time: orderDate,
            properties: {
              products: [
                {
                  image: lineItemOne.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemOne.variant.sku,
                  name: lineItemOne.name[locale],
                  quantity: lineItemOne.quantity,
                  product_attributes: lineItemOne.variant.attributes.map(
                    (attribute) => ({
                      label: attribute.name,
                      value: attribute.value[locale],
                    })
                  ),
                  purchase_price: formatCurrency(
                    lineItemOne.price.value.centAmount,
                    lineItemOne.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemOne.totalPrice.centAmount,
                    lineItemOne.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
                {
                  image: lineItemTwo.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemTwo.variant.sku,
                  name: lineItemTwo.name[locale],
                  quantity: lineItemTwo.quantity,
                  product_attributes: lineItemTwo.variant.attributes.map(
                    (attribute) => ({
                      label: attribute.name,
                      value: attribute.value[locale],
                    })
                  ),
                  purchase_price: formatCurrency(
                    lineItemTwo.price.value.centAmount,
                    lineItemTwo.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemTwo.totalPrice.centAmount,
                    lineItemTwo.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
              ],
              order: {
                order_number: orderCreatedMessage.orderNumber,
                order_date: orderCreatedMessage.createdAt,
                order_url: "", // TODO: How to construct this URL??
                order_total_products: orderCreatedMessage.lineItems.reduce(
                  (n, { quantity }) => n + quantity,
                  0
                ),
              },
              billing: {
                tax_total_amount: formatCurrency(
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .centAmount,
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .fractionDigits
                ),
                total_price: formatCurrency(
                  orderCreatedMessage.totalPrice.centAmount,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                basket_total: calculateBasketTotal(
                  orderCreatedMessage.lineItems,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                shipping_price: formatCurrency(
                  orderCreatedMessage.shippingInfo?.price.centAmount,
                  orderCreatedMessage.shippingInfo?.price.fractionDigits
                ),
                currency: "£",
                address_same_as_shipping:
                  orderCreatedMessage.shippingAddress?.id ===
                  orderCreatedMessage.billingAddress?.id,
                title: orderCreatedMessage.billingAddress.title,
                company_name: orderCreatedMessage.billingAddress.company,
                first_name: orderCreatedMessage.billingAddress.firstName,
                last_name: orderCreatedMessage.billingAddress.lastName,
                address_line1: `${orderCreatedMessage.billingAddress.streetNumber} ${orderCreatedMessage.billingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.billingAddress.additionalStreetInfo,
                county: orderCreatedMessage.billingAddress.state,
                city: orderCreatedMessage.billingAddress.city,
                postcode: orderCreatedMessage.billingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.billingAddress.country
                ),
              },
              shipping: {
                delivery_method: "STRD1",
                title: orderCreatedMessage.shippingAddress.title,
                company_name: orderCreatedMessage.shippingAddress.company,
                first_name: orderCreatedMessage.shippingAddress.firstName,
                last_name: orderCreatedMessage.shippingAddress.lastName,
                address_line1: `${orderCreatedMessage.shippingAddress.streetNumber} ${orderCreatedMessage.shippingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.shippingAddress.additionalStreetInfo,
                county: orderCreatedMessage.shippingAddress.state,
                city: orderCreatedMessage.shippingAddress.city,
                postcode: orderCreatedMessage.shippingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.shippingAddress.country
                ),
              },
            },
          } as UserOrderPlacedEvent,
        ],
      };

      expect(response).toStrictEqual(
        expectedOrderConfirmationNotificationRequest
      );
    });

    it("should construct a OrderConfirmationNotificationRequest for guest user w/ marketing preference", async () => {
      const locale = faker.locale;
      const brazeAppId = faker.datatype.string();
      const orderDate = faker.datatype.datetime().toISOString();
      const marketingPreference = "opt_in";
      const brazeMarketingPreference = "opted_in";
      const customerTimeZone = "Time/Zone";

      const instance = new OrderConfirmation();
      const lineItemOne = generateFakeLineItem(locale, "GBP");
      const lineItemTwo = generateFakeLineItem(locale, "GBP");
      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [lineItemOne, lineItemTwo],
        locale: locale,
        createdAt: orderDate,
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: marketingPreference,
            emcUserTimeZone: customerTimeZone,
          },
        },
      };

      const response = await instance.buildOrderConfirmationNotificationRequest(
        orderCreatedMessage,
        {
          type: "UserAlias",
          alias: { alias_name: "brand-1:id-hash", alias_label: "user_key" },
        },
        brazeAppId,
        brandTestMeta
      );

      const expectedUserAlias: UserAlias = {
        alias_name: "brand-1:id-hash",
        alias_label: "user_key",
      };
      const expectedOrderConfirmationNotificationRequest: TrackUserRequest = {
        attributes: [
          {
            user_alias: expectedUserAlias,
            email: "test@example.com",
            country_code: "EN",
            time_zone: customerTimeZone,
            email_subscribe: brazeMarketingPreference,
            account_status: "active",
            account_type: "guest",
            _update_existing_only: false,
          },
        ],
        purchases: [
          {
            user_alias: expectedUserAlias,
            app_id: brazeAppId,
            product_id: lineItemOne.name[locale],
            currency: "GBP",
            price: Number(
              formatCurrency(
                lineItemOne.price.value.centAmount,
                lineItemOne.price.value.fractionDigits
              )
            ),
            quantity: lineItemOne.quantity,
            time: orderDate,
          },
          {
            user_alias: expectedUserAlias,
            app_id: brazeAppId,
            product_id: lineItemTwo.name[locale],
            currency: "GBP",
            price: Number(
              formatCurrency(
                lineItemTwo.price.value.centAmount,
                lineItemTwo.price.value.fractionDigits
              )
            ),
            quantity: lineItemTwo.quantity,
            time: orderDate,
          },
        ],
        events: [
          {
            user_alias: expectedUserAlias,
            name: "order_placed",
            time: orderDate,
            properties: {
              products: [
                {
                  image: lineItemOne.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemOne.variant.sku,
                  name: lineItemOne.name[locale],
                  quantity: lineItemOne.quantity,
                  product_attributes: lineItemOne.variant.attributes.map(
                    (attribute) => ({
                      label: attribute.name,
                      value: attribute.value[locale],
                    })
                  ),
                  purchase_price: formatCurrency(
                    lineItemOne.price.value.centAmount,
                    lineItemOne.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemOne.totalPrice.centAmount,
                    lineItemOne.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
                {
                  image: lineItemTwo.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemTwo.variant.sku,
                  name: lineItemTwo.name[locale],
                  quantity: lineItemTwo.quantity,
                  product_attributes: lineItemTwo.variant.attributes.map(
                    (attribute) => ({
                      label: attribute.name,
                      value: attribute.value[locale],
                    })
                  ),
                  purchase_price: formatCurrency(
                    lineItemTwo.price.value.centAmount,
                    lineItemTwo.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemTwo.totalPrice.centAmount,
                    lineItemTwo.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
              ],
              order: {
                order_number: orderCreatedMessage.orderNumber,
                order_date: orderCreatedMessage.createdAt,
                order_url: "", // TODO: How to construct this URL??
                order_total_products: orderCreatedMessage.lineItems.reduce(
                  (n, { quantity }) => n + quantity,
                  0
                ),
              },
              billing: {
                tax_total_amount: formatCurrency(
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .centAmount,
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .fractionDigits
                ),
                total_price: formatCurrency(
                  orderCreatedMessage.totalPrice.centAmount,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                basket_total: calculateBasketTotal(
                  orderCreatedMessage.lineItems,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                shipping_price: formatCurrency(
                  orderCreatedMessage.shippingInfo?.price.centAmount,
                  orderCreatedMessage.shippingInfo?.price.fractionDigits
                ),
                currency: "£",
                address_same_as_shipping:
                  orderCreatedMessage.shippingAddress?.id ===
                  orderCreatedMessage.billingAddress?.id,
                title: orderCreatedMessage.billingAddress.title,
                company_name: orderCreatedMessage.billingAddress.company,
                first_name: orderCreatedMessage.billingAddress.firstName,
                last_name: orderCreatedMessage.billingAddress.lastName,
                address_line1: `${orderCreatedMessage.billingAddress.streetNumber} ${orderCreatedMessage.billingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.billingAddress.additionalStreetInfo,
                county: orderCreatedMessage.billingAddress.state,
                city: orderCreatedMessage.billingAddress.city,
                postcode: orderCreatedMessage.billingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.billingAddress.country
                ),
              },
              shipping: {
                delivery_method: "STRD1",
                title: orderCreatedMessage.shippingAddress.title,
                company_name: orderCreatedMessage.shippingAddress.company,
                first_name: orderCreatedMessage.shippingAddress.firstName,
                last_name: orderCreatedMessage.shippingAddress.lastName,
                address_line1: `${orderCreatedMessage.shippingAddress.streetNumber} ${orderCreatedMessage.shippingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.shippingAddress.additionalStreetInfo,
                county: orderCreatedMessage.shippingAddress.state,
                city: orderCreatedMessage.shippingAddress.city,
                postcode: orderCreatedMessage.shippingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.shippingAddress.country
                ),
              },
            },
          } as UserOrderPlacedEvent,
        ],
      };

      expect(response).toStrictEqual(
        expectedOrderConfirmationNotificationRequest
      );
    });

    it("should construct a OrderConfirmationNotificationRequest for guest user", async () => {
      const locale = faker.locale;
      const brazeAppId = faker.datatype.string();
      const orderDate = faker.datatype.datetime().toISOString();
      const customerTimeZone = "Europe/London";

      const instance = new OrderConfirmation();
      const lineItemOne = generateFakeLineItem(locale, "GBP");

      const lineItemTwo = generateFakeLineItem(locale, "GBP");
      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [lineItemOne, lineItemTwo],
        locale: locale,
        createdAt: orderDate,
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: "not_opt_in",
            emcUserTimeZone: customerTimeZone,
          },
        },
      };

      const response = await instance.buildOrderConfirmationNotificationRequest(
        orderCreatedMessage,
        {
          type: "UserAlias",
          alias: { alias_name: "brand-1:id-hash", alias_label: "user_key" },
        },
        brazeAppId,
        brandTestMeta
      );

      const expectedUserAlias: UserAlias = {
        alias_name: "brand-1:id-hash",
        alias_label: "user_key",
      };
      const expectedOrderConfirmationNotificationRequest: TrackUserRequest = {
        attributes: [
          {
            user_alias: expectedUserAlias,
            email: "test@example.com",
            country_code: "EN",
            account_status: "active",
            account_type: "guest",
            _update_existing_only: false,
          },
        ],
        purchases: [
          {
            user_alias: expectedUserAlias,
            app_id: brazeAppId,
            product_id: lineItemOne.name[locale],
            currency: "GBP",
            price: Number(
              formatCurrency(
                lineItemOne.price.value.centAmount,
                lineItemOne.price.value.fractionDigits
              )
            ),
            quantity: lineItemOne.quantity,
            time: orderDate,
          },
          {
            user_alias: expectedUserAlias,
            app_id: brazeAppId,
            product_id: lineItemTwo.name[locale],
            currency: "GBP",
            price: Number(
              formatCurrency(
                lineItemTwo.price.value.centAmount,
                lineItemTwo.price.value.fractionDigits
              )
            ),
            quantity: lineItemTwo.quantity,
            time: orderDate,
          },
        ],
        events: [
          {
            user_alias: expectedUserAlias,
            name: "order_placed",
            time: orderDate,
            properties: {
              products: [
                {
                  image: lineItemOne.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemOne.variant.sku,
                  name: lineItemOne.name[locale],
                  quantity: lineItemOne.quantity,
                  product_attributes: lineItemOne.variant.attributes.map(
                    (attribute) => ({
                      label: attribute.name,
                      value: attribute.value[locale],
                    })
                  ),
                  purchase_price: formatCurrency(
                    lineItemOne.price.value.centAmount,
                    lineItemOne.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemOne.totalPrice.centAmount,
                    lineItemOne.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
                {
                  image: lineItemTwo.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemTwo.variant.sku,
                  name: lineItemTwo.name[locale],
                  quantity: lineItemTwo.quantity,
                  product_attributes: lineItemTwo.variant.attributes.map(
                    (attribute) => ({
                      label: attribute.name,
                      value: attribute.value[locale],
                    })
                  ),
                  purchase_price: formatCurrency(
                    lineItemTwo.price.value.centAmount,
                    lineItemTwo.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemTwo.totalPrice.centAmount,
                    lineItemTwo.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
              ],
              order: {
                order_number: orderCreatedMessage.orderNumber,
                order_date: orderCreatedMessage.createdAt,
                order_url: "", // TODO: How to construct this URL??
                order_total_products: orderCreatedMessage.lineItems.reduce(
                  (n, { quantity }) => n + quantity,
                  0
                ),
              },
              billing: {
                tax_total_amount: formatCurrency(
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .centAmount,
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .fractionDigits
                ),
                total_price: formatCurrency(
                  orderCreatedMessage.totalPrice.centAmount,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                basket_total: calculateBasketTotal(
                  orderCreatedMessage.lineItems,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                shipping_price: formatCurrency(
                  orderCreatedMessage.shippingInfo?.price.centAmount,
                  orderCreatedMessage.shippingInfo?.price.fractionDigits
                ),
                currency: "£",
                address_same_as_shipping:
                  orderCreatedMessage.shippingAddress?.id ===
                  orderCreatedMessage.billingAddress?.id,
                title: orderCreatedMessage.billingAddress.title,
                company_name: orderCreatedMessage.billingAddress.company,
                first_name: orderCreatedMessage.billingAddress.firstName,
                last_name: orderCreatedMessage.billingAddress.lastName,
                address_line1: `${orderCreatedMessage.billingAddress.streetNumber} ${orderCreatedMessage.billingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.billingAddress.additionalStreetInfo,
                county: orderCreatedMessage.billingAddress.state,
                city: orderCreatedMessage.billingAddress.city,
                postcode: orderCreatedMessage.billingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.billingAddress.country
                ),
              },
              shipping: {
                delivery_method: "STRD1",
                title: orderCreatedMessage.shippingAddress.title,
                company_name: orderCreatedMessage.shippingAddress.company,
                first_name: orderCreatedMessage.shippingAddress.firstName,
                last_name: orderCreatedMessage.shippingAddress.lastName,
                address_line1: `${orderCreatedMessage.shippingAddress.streetNumber} ${orderCreatedMessage.shippingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.shippingAddress.additionalStreetInfo,
                county: orderCreatedMessage.shippingAddress.state,
                city: orderCreatedMessage.shippingAddress.city,
                postcode: orderCreatedMessage.shippingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.shippingAddress.country
                ),
              },
            },
          } as UserOrderPlacedEvent,
        ],
      };

      expect(response).toStrictEqual(
        expectedOrderConfirmationNotificationRequest
      );
    });

    it("should interpret types of variant attributes", async () => {
      const brazeAppId = faker.datatype.string();
      const orderDate = faker.datatype.datetime().toISOString();
      const customerTimeZone = "Europe/London";
      const instance = new OrderConfirmation();
      const lineItemOne = generateFakeLineItem("de", "GBP");
      lineItemOne.variant.attributes = [
        { name: "colour", value: { en: "blue", de: "blau" } }, // localise string attr
        { name: "surface", value: { en: "matte", de: undefined } }, // localised string unavailable
        { name: "size", value: "L" }, // string attr
        { name: "material", value: undefined }, // undef attr
        { name: "numAttr", value: 1 }, // undef attr
      ];
      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [lineItemOne],
        locale: "de",
        createdAt: orderDate,
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: "not_opt_in",
            emcUserTimeZone: customerTimeZone,
          },
        },
      };

      const response = await instance.buildOrderConfirmationNotificationRequest(
        orderCreatedMessage,
        {
          type: "UserAlias",
          alias: { alias_name: "brand-1:id-hash", alias_label: "user_key" },
        },
        brazeAppId,
        brandTestMeta
      );

      const expectedUserAlias: UserAlias = {
        alias_name: "brand-1:id-hash",
        alias_label: "user_key",
      };
      const expectedOrderConfirmationNotificationRequest: TrackUserRequest = {
        attributes: [
          {
            user_alias: expectedUserAlias,
            email: "test@example.com",
            country_code: "EN",
            account_status: "active",
            account_type: "guest",
            _update_existing_only: false,
          },
        ],
        purchases: [
          {
            user_alias: expectedUserAlias,
            app_id: brazeAppId,
            product_id: lineItemOne.name["de"],
            currency: "GBP",
            price: Number(
              formatCurrency(
                lineItemOne.price.value.centAmount,
                lineItemOne.price.value.fractionDigits
              )
            ),
            quantity: lineItemOne.quantity,
            time: orderDate,
          },
        ],
        events: [
          {
            user_alias: expectedUserAlias,
            name: "order_placed",
            time: orderDate,
            properties: {
              products: [
                {
                  image: lineItemOne.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemOne.variant.sku,
                  name: lineItemOne.name["de"],
                  quantity: lineItemOne.quantity,
                  product_attributes: [
                    { label: "colour", value: "blau" },
                    { label: "surface", value: "" },
                    { label: "size", value: "L" },
                    { label: "material", value: "" },
                    { label: "numAttr", value: "" },
                  ],
                  purchase_price: formatCurrency(
                    lineItemOne.price.value.centAmount,
                    lineItemOne.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemOne.totalPrice.centAmount,
                    lineItemOne.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
              ],
              order: {
                order_number: orderCreatedMessage.orderNumber,
                order_date: orderCreatedMessage.createdAt,
                order_url: "", // TODO: How to construct this URL??
                order_total_products: orderCreatedMessage.lineItems.reduce(
                  (n, { quantity }) => n + quantity,
                  0
                ),
              },
              billing: {
                tax_total_amount: formatCurrency(
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .centAmount,
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .fractionDigits
                ),
                total_price: formatCurrency(
                  orderCreatedMessage.totalPrice.centAmount,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                basket_total: calculateBasketTotal(
                  orderCreatedMessage.lineItems,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                shipping_price: formatCurrency(
                  orderCreatedMessage.shippingInfo?.price.centAmount,
                  orderCreatedMessage.shippingInfo?.price.fractionDigits
                ),
                currency: "£",
                address_same_as_shipping:
                  orderCreatedMessage.shippingAddress?.id ===
                  orderCreatedMessage.billingAddress?.id,
                title: orderCreatedMessage.billingAddress.title,
                company_name: orderCreatedMessage.billingAddress.company,
                first_name: orderCreatedMessage.billingAddress.firstName,
                last_name: orderCreatedMessage.billingAddress.lastName,
                address_line1: `${orderCreatedMessage.billingAddress.streetNumber} ${orderCreatedMessage.billingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.billingAddress.additionalStreetInfo,
                county: orderCreatedMessage.billingAddress.state,
                city: orderCreatedMessage.billingAddress.city,
                postcode: orderCreatedMessage.billingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.billingAddress.country
                ),
              },
              shipping: {
                delivery_method: "STRD1",
                title: orderCreatedMessage.shippingAddress.title,
                company_name: orderCreatedMessage.shippingAddress.company,
                first_name: orderCreatedMessage.shippingAddress.firstName,
                last_name: orderCreatedMessage.shippingAddress.lastName,
                address_line1: `${orderCreatedMessage.shippingAddress.streetNumber} ${orderCreatedMessage.shippingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.shippingAddress.additionalStreetInfo,
                county: orderCreatedMessage.shippingAddress.state,
                city: orderCreatedMessage.shippingAddress.city,
                postcode: orderCreatedMessage.shippingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.shippingAddress.country
                ),
              },
            },
          } as UserOrderPlacedEvent,
        ],
      };

      expect(response).toStrictEqual(
        expectedOrderConfirmationNotificationRequest
      );
    });

    it("should return empty attributes array if no variant attributes are defined", async () => {
      const brazeAppId = faker.datatype.string();
      const orderDate = faker.datatype.datetime().toISOString();
      const customerTimeZone = "Europe/London";
      const instance = new OrderConfirmation();
      const lineItemOne = generateFakeLineItem("de", "GBP");
      lineItemOne.variant.attributes = undefined;
      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [lineItemOne],
        locale: "de",
        createdAt: orderDate,
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: "not_opt_in",
            emcUserTimeZone: customerTimeZone,
          },
        },
      };

      const response = await instance.buildOrderConfirmationNotificationRequest(
        orderCreatedMessage,
        {
          type: "UserAlias",
          alias: { alias_name: "brand-1:id-hash", alias_label: "user_key" },
        },
        brazeAppId,
        brandTestMeta
      );

      const expectedUserAlias: UserAlias = {
        alias_name: "brand-1:id-hash",
        alias_label: "user_key",
      };
      const expectedOrderConfirmationNotificationRequest: TrackUserRequest = {
        attributes: [
          {
            user_alias: expectedUserAlias,
            email: "test@example.com",
            country_code: "EN",
            account_status: "active",
            account_type: "guest",
            _update_existing_only: false,
          },
        ],
        purchases: [
          {
            user_alias: expectedUserAlias,
            app_id: brazeAppId,
            product_id: lineItemOne.name["de"],
            currency: "GBP",
            price: Number(
              formatCurrency(
                lineItemOne.price.value.centAmount,
                lineItemOne.price.value.fractionDigits
              )
            ),
            quantity: lineItemOne.quantity,
            time: orderDate,
          },
        ],
        events: [
          {
            user_alias: expectedUserAlias,
            name: "order_placed",
            time: orderDate,
            properties: {
              products: [
                {
                  image: lineItemOne.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemOne.variant.sku,
                  name: lineItemOne.name["de"],
                  quantity: lineItemOne.quantity,
                  product_attributes: [],
                  purchase_price: formatCurrency(
                    lineItemOne.price.value.centAmount,
                    lineItemOne.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemOne.totalPrice.centAmount,
                    lineItemOne.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
              ],
              order: {
                order_number: orderCreatedMessage.orderNumber,
                order_date: orderCreatedMessage.createdAt,
                order_url: "", // TODO: How to construct this URL??
                order_total_products: orderCreatedMessage.lineItems.reduce(
                  (n, { quantity }) => n + quantity,
                  0
                ),
              },
              billing: {
                tax_total_amount: formatCurrency(
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .centAmount,
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .fractionDigits
                ),
                total_price: formatCurrency(
                  orderCreatedMessage.totalPrice.centAmount,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                basket_total: calculateBasketTotal(
                  orderCreatedMessage.lineItems,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                shipping_price: formatCurrency(
                  orderCreatedMessage.shippingInfo?.price.centAmount,
                  orderCreatedMessage.shippingInfo?.price.fractionDigits
                ),
                currency: "£",
                address_same_as_shipping:
                  orderCreatedMessage.shippingAddress?.id ===
                  orderCreatedMessage.billingAddress?.id,
                title: orderCreatedMessage.billingAddress.title,
                company_name: orderCreatedMessage.billingAddress.company,
                first_name: orderCreatedMessage.billingAddress.firstName,
                last_name: orderCreatedMessage.billingAddress.lastName,
                address_line1: `${orderCreatedMessage.billingAddress.streetNumber} ${orderCreatedMessage.billingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.billingAddress.additionalStreetInfo,
                county: orderCreatedMessage.billingAddress.state,
                city: orderCreatedMessage.billingAddress.city,
                postcode: orderCreatedMessage.billingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.billingAddress.country
                ),
              },
              shipping: {
                delivery_method: "STRD1",
                title: orderCreatedMessage.shippingAddress.title,
                company_name: orderCreatedMessage.shippingAddress.company,
                first_name: orderCreatedMessage.shippingAddress.firstName,
                last_name: orderCreatedMessage.shippingAddress.lastName,
                address_line1: `${orderCreatedMessage.shippingAddress.streetNumber} ${orderCreatedMessage.shippingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.shippingAddress.additionalStreetInfo,
                county: orderCreatedMessage.shippingAddress.state,
                city: orderCreatedMessage.shippingAddress.city,
                postcode: orderCreatedMessage.shippingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.shippingAddress.country
                ),
              },
            },
          } as UserOrderPlacedEvent,
        ],
      };

      expect(response).toStrictEqual(
        expectedOrderConfirmationNotificationRequest
      );
    });

    it("should fall back to config locale if none provided in request", async () => {
      const brazeAppId = faker.datatype.string();
      const orderDate = faker.datatype.datetime().toISOString();
      const customerTimeZone = "Europe/London";
      const instance = new OrderConfirmation();
      const lineItemOne = generateFakeLineItem("en", "GBP");
      lineItemOne.variant.attributes = [
        { name: "colour", value: { en: "blue", de: "blau" } }, // localise string attr
        { name: "size", value: "L" }, // string attr
        { name: "material", value: undefined }, // undef attr
      ];
      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [lineItemOne],
        createdAt: orderDate,
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: "not_opt_in",
            emcUserTimeZone: customerTimeZone,
          },
        },
      };

      const response = await instance.buildOrderConfirmationNotificationRequest(
        orderCreatedMessage,
        {
          type: "UserAlias",
          alias: { alias_name: "brand-1:id-hash", alias_label: "user_key" },
        },
        brazeAppId,
        { ...brandTestMeta, languageCode: "en" }
      );

      const expectedUserAlias: UserAlias = {
        alias_name: "brand-1:id-hash",
        alias_label: "user_key",
      };
      const expectedOrderConfirmationNotificationRequest: TrackUserRequest = {
        attributes: [
          {
            user_alias: expectedUserAlias,
            email: "test@example.com",
            country_code: "EN",
            account_status: "active",
            account_type: "guest",
            _update_existing_only: false,
          },
        ],
        purchases: [
          {
            user_alias: expectedUserAlias,
            app_id: brazeAppId,
            product_id: lineItemOne.name["en"],
            currency: "GBP",
            price: Number(
              formatCurrency(
                lineItemOne.price.value.centAmount,
                lineItemOne.price.value.fractionDigits
              )
            ),
            quantity: lineItemOne.quantity,
            time: orderDate,
          },
        ],
        events: [
          {
            user_alias: expectedUserAlias,
            name: "order_placed",
            time: orderDate,
            properties: {
              products: [
                {
                  image: lineItemOne.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemOne.variant.sku,
                  name: lineItemOne.name["en"],
                  quantity: lineItemOne.quantity,
                  product_attributes: [
                    { label: "colour", value: "blue" },
                    { label: "size", value: "L" },
                    { label: "material", value: "" },
                  ],
                  purchase_price: formatCurrency(
                    lineItemOne.price.value.centAmount,
                    lineItemOne.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemOne.totalPrice.centAmount,
                    lineItemOne.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
              ],
              order: {
                order_number: orderCreatedMessage.orderNumber,
                order_date: orderCreatedMessage.createdAt,
                order_url: "", // TODO: How to construct this URL??
                order_total_products: orderCreatedMessage.lineItems.reduce(
                  (n, { quantity }) => n + quantity,
                  0
                ),
              },
              billing: {
                tax_total_amount: formatCurrency(
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .centAmount,
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .fractionDigits
                ),
                total_price: formatCurrency(
                  orderCreatedMessage.totalPrice.centAmount,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                basket_total: calculateBasketTotal(
                  orderCreatedMessage.lineItems,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                shipping_price: formatCurrency(
                  orderCreatedMessage.shippingInfo?.price.centAmount,
                  orderCreatedMessage.shippingInfo?.price.fractionDigits
                ),
                currency: "£",
                address_same_as_shipping:
                  orderCreatedMessage.shippingAddress?.id ===
                  orderCreatedMessage.billingAddress?.id,
                title: orderCreatedMessage.billingAddress.title,
                company_name: orderCreatedMessage.billingAddress.company,
                first_name: orderCreatedMessage.billingAddress.firstName,
                last_name: orderCreatedMessage.billingAddress.lastName,
                address_line1: `${orderCreatedMessage.billingAddress.streetNumber} ${orderCreatedMessage.billingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.billingAddress.additionalStreetInfo,
                county: orderCreatedMessage.billingAddress.state,
                city: orderCreatedMessage.billingAddress.city,
                postcode: orderCreatedMessage.billingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.billingAddress.country
                ),
              },
              shipping: {
                delivery_method: "STRD1",
                title: orderCreatedMessage.shippingAddress.title,
                company_name: orderCreatedMessage.shippingAddress.company,
                first_name: orderCreatedMessage.shippingAddress.firstName,
                last_name: orderCreatedMessage.shippingAddress.lastName,
                address_line1: `${orderCreatedMessage.shippingAddress.streetNumber} ${orderCreatedMessage.shippingAddress.streetName}`,
                address_line2:
                  orderCreatedMessage.shippingAddress.additionalStreetInfo,
                county: orderCreatedMessage.shippingAddress.state,
                city: orderCreatedMessage.shippingAddress.city,
                postcode: orderCreatedMessage.shippingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.shippingAddress.country
                ),
              },
            },
          } as UserOrderPlacedEvent,
        ],
      };

      expect(response).toStrictEqual(
        expectedOrderConfirmationNotificationRequest
      );
    });

    it("should default to empty string when optional address attributes are undefined", async () => {
      const brazeAppId = faker.datatype.string();
      const orderDate = faker.datatype.datetime().toISOString();
      const customerTimeZone = "Europe/London";
      const instance = new OrderConfirmation();
      const lineItemOne = generateFakeLineItem("en", "GBP");
      const billingAddress = generateFakeAddress();
      billingAddress.title = undefined;
      billingAddress.company = undefined;
      billingAddress.additionalStreetInfo = undefined;
      billingAddress.state = undefined;
      const shippingAddress = generateFakeAddress();
      shippingAddress.title = undefined;
      shippingAddress.company = undefined;
      shippingAddress.additionalStreetInfo = undefined;
      shippingAddress.state = undefined;

      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: billingAddress,
        shippingAddress: shippingAddress,
        lineItems: [lineItemOne],
        locale: "en",
        createdAt: orderDate,
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: "not_opt_in",
            emcUserTimeZone: customerTimeZone,
          },
        },
      };

      const response = await instance.buildOrderConfirmationNotificationRequest(
        orderCreatedMessage,
        {
          type: "UserAlias",
          alias: { alias_name: "brand-1:id-hash", alias_label: "user_key" },
        },
        brazeAppId,
        brandTestMeta
      );

      const expectedUserAlias: UserAlias = {
        alias_name: "brand-1:id-hash",
        alias_label: "user_key",
      };
      const expectedOrderConfirmationNotificationRequest: TrackUserRequest = {
        attributes: [
          {
            user_alias: expectedUserAlias,
            email: "test@example.com",
            country_code: "EN",
            account_status: "active",
            account_type: "guest",
            _update_existing_only: false,
          },
        ],
        purchases: [
          {
            user_alias: expectedUserAlias,
            app_id: brazeAppId,
            product_id: lineItemOne.name["en"],
            currency: "GBP",
            price: Number(
              formatCurrency(
                lineItemOne.price.value.centAmount,
                lineItemOne.price.value.fractionDigits
              )
            ),
            quantity: lineItemOne.quantity,
            time: orderDate,
          },
        ],
        events: [
          {
            user_alias: expectedUserAlias,
            name: "order_placed",
            time: orderDate,
            properties: {
              products: [
                {
                  image: lineItemOne.variant.images.find(
                    (image) => image.label === CT_IMAGE_THUMBNAIL_LABEL
                  ).url,
                  sku: lineItemOne.variant.sku,
                  name: lineItemOne.name["en"],
                  quantity: lineItemOne.quantity,
                  product_attributes: lineItemOne.variant.attributes.map(
                    (attribute) => ({
                      label: attribute.name,
                      value: attribute.value["en"],
                    })
                  ),
                  purchase_price: formatCurrency(
                    lineItemOne.price.value.centAmount,
                    lineItemOne.price.value.fractionDigits
                  ),
                  total_purchase_price: formatCurrency(
                    lineItemOne.totalPrice.centAmount,
                    lineItemOne.totalPrice.fractionDigits
                  ),
                  page_url: "", // TODO: How to construct this URL??
                },
              ],
              order: {
                order_number: orderCreatedMessage.orderNumber,
                order_date: orderCreatedMessage.createdAt,
                order_url: "", // TODO: How to construct this URL??
                order_total_products: orderCreatedMessage.lineItems.reduce(
                  (n, { quantity }) => n + quantity,
                  0
                ),
              },
              billing: {
                tax_total_amount: formatCurrency(
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .centAmount,
                  orderCreatedMessage.taxedPrice.taxPortions[0].amount
                    .fractionDigits
                ),
                total_price: formatCurrency(
                  orderCreatedMessage.totalPrice.centAmount,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                basket_total: calculateBasketTotal(
                  orderCreatedMessage.lineItems,
                  orderCreatedMessage.totalPrice.fractionDigits
                ),
                shipping_price: formatCurrency(
                  orderCreatedMessage.shippingInfo?.price.centAmount,
                  orderCreatedMessage.shippingInfo?.price.fractionDigits
                ),
                currency: "£",
                address_same_as_shipping:
                  orderCreatedMessage.shippingAddress?.id ===
                  orderCreatedMessage.billingAddress?.id,
                title: "",
                company_name: "",
                first_name: orderCreatedMessage.billingAddress.firstName,
                last_name: orderCreatedMessage.billingAddress.lastName,
                address_line1: `${orderCreatedMessage.billingAddress.streetNumber} ${orderCreatedMessage.billingAddress.streetName}`,
                address_line2: "",
                county: "",
                city: orderCreatedMessage.billingAddress.city,
                postcode: orderCreatedMessage.billingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.billingAddress.country
                ),
              },
              shipping: {
                delivery_method: "STRD1",
                title: "",
                company_name: "",
                first_name: orderCreatedMessage.shippingAddress.firstName,
                last_name: orderCreatedMessage.shippingAddress.lastName,
                address_line1: `${orderCreatedMessage.shippingAddress.streetNumber} ${orderCreatedMessage.shippingAddress.streetName}`,
                address_line2: "",
                county: "",
                city: orderCreatedMessage.shippingAddress.city,
                postcode: orderCreatedMessage.shippingAddress.postalCode,
                country: toFriendlyCountryName(
                  orderCreatedMessage.shippingAddress.country
                ),
              },
            },
          } as UserOrderPlacedEvent,
        ],
      };

      expect(response).toStrictEqual(
        expectedOrderConfirmationNotificationRequest
      );
    });
  });

  describe("triggerNotification()", () => {
    const checkoutClientMock = new MockAdapter(axios);

    beforeEach(() => {
      checkoutClientMock.reset();
    });

    it("successfully triggers order confirmation notification", async () => {
      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [generateFakeLineItem("EN")],
        locale: "EN",
        createdAt: new Date().toISOString(),
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: "opt_in",
            emcUserTimeZone: "Europe/London",
          },
        },
      };
      const instance = new OrderConfirmation();
      instance.getBrazeServiceConfig = jest
        .fn()
        .mockResolvedValueOnce(brazeTestConfig);
      instance.getBrandName = jest.fn().mockResolvedValue("Foo");
      instance.getBrandLanguageCode = jest.fn().mockResolvedValue("EN");
      checkoutClientMock.onPost("/users/track").reply(200, {
        attributes_processed: 1,
        events_processed: 1,
        message: "success",
      });

      await instance.triggerNotification("brand-1", orderCreatedMessage);

      expect(checkoutClientMock.history.post[0].baseURL).toEqual(
        "https://braze-mock-url.example.com"
      );
      expect(checkoutClientMock.history.post[0].url).toEqual("/users/track");
    });

    it("successfully triggers order confirmation notification - registered user", async () => {
      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerId: "customer-abc",
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [generateFakeLineItem("EN")],
        locale: "EN",
        createdAt: new Date().toISOString(),
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: "opt_in",
            emcUserTimeZone: "Europe/London",
          },
        },
      };
      const instance = new OrderConfirmation();
      instance.getBrazeServiceConfig = jest
        .fn()
        .mockResolvedValueOnce(brazeTestConfig);
      instance.getBrandName = jest.fn().mockResolvedValue("Foo");
      instance.getBrandLanguageCode = jest.fn().mockResolvedValue("EN");
      checkoutClientMock.onPost("/users/track").reply(200, {
        attributes_processed: 1,
        events_processed: 1,
        message: "success",
      });

      await instance.triggerNotification("brand-1", orderCreatedMessage);

      expect(checkoutClientMock.history.post[0].baseURL).toEqual(
        "https://braze-mock-url.example.com"
      );
      expect(checkoutClientMock.history.post[0].url).toEqual("/users/track");
    });

    it("throws AssertionError if customerId and orderNumber are missing", async () => {
      const orderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [generateFakeLineItem("EN")],
        locale: "EN",
        createdAt: new Date().toISOString(),
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: "opt_in",
            emcUserTimeZone: "Europe/London",
          },
        },
      };
      const instance = new OrderConfirmation();
      instance.getBrazeServiceConfig = jest
        .fn()
        .mockResolvedValueOnce(brazeTestConfig);
      instance.getBrandName = jest.fn().mockResolvedValue("Foo");
      instance.getBrandLanguageCode = jest.fn().mockResolvedValue("EN");
      checkoutClientMock.onPost("/users/track").reply(200, {
        attributes_processed: 1,
        events_processed: 1,
        message: "success",
      });

      const triggerPromise = instance.triggerNotification(
        "brand-1",
        orderCreatedMessage as unknown as OrderCreatedMessage
      );

      await expect(triggerPromise).rejects.toThrowError(AssertionError);
      await expect(triggerPromise).rejects.toThrowError(
        "Cannot generate user identity - both customerId and orderNumber are missing"
      );
      expect(checkoutClientMock.history.post.length).toBe(0);
    });

    it("throws error on failed triggerNotification", async () => {
      const orderCreatedMessage: OrderCreatedMessage = {
        id: faker.datatype.uuid(),
        version: 1,
        customerEmail: "test@example.com",
        orderNumber: "order-1",
        billingAddress: generateFakeAddress(),
        shippingAddress: generateFakeAddress(),
        lineItems: [generateFakeLineItem("EN")],
        locale: "EN",
        createdAt: new Date().toISOString(),
        taxedPrice: {
          taxPortions: [{ amount: generateFakeMoney("GBP") }],
        },
        lastModifiedAt: faker.datatype.datetime().toISOString(),
        lastModifiedBy: {
          clientId: faker.datatype.string(),
          externalUserId: faker.datatype.string(),
          anonymousId: faker.datatype.string(),
          customer: {
            id: faker.datatype.string(),
          },
        },
        totalPrice: generateFakeMoney("GBP"),
        shippingInfo: {
          price: generateFakeMoney("GBP"),
          shippingMethodName: "STRD1",
        },
        orderState: "Open",
        custom: {
          type: {
            typeId: "type",
            id: faker.datatype.uuid(),
          },
          fields: {
            emcUserMarketingPreference: "opt_in",
            emcUserTimeZone: "Europe/London",
          },
        },
      };
      const instance = new OrderConfirmation();
      instance.getBrazeServiceConfig = jest
        .fn()
        .mockReturnValueOnce(brazeTestConfig);
      instance.getBrandName = jest.fn().mockResolvedValue("Foo");
      instance.getBrandLanguageCode = jest.fn().mockResolvedValue("EN");
      checkoutClientMock.onPost("/users/track").reply(200, {
        attributes_processed: 0,
        events_processed: 0,
        message: "error",
        errors: {
          message: "error",
        },
      });

      await expect(() =>
        instance.triggerNotification("brand-1", orderCreatedMessage)
      ).rejects.toThrow(Error);

      expect(checkoutClientMock.history.post[0].baseURL).toEqual(
        "https://braze-mock-url.example.com"
      );
      expect(checkoutClientMock.history.post[0].url).toEqual("/users/track");
    });
  });
});
