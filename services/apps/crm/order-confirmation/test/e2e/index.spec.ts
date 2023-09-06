import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsRequestEntry,
} from "@aws-sdk/client-eventbridge";
import { faker } from "@faker-js/faker";
import axios from "axios";
import {
  generateFakeAddress,
  generateFakeLineItem,
  generateFakeMoney,
} from "../../src/functions/order/confirm/test-utils";

const ebClient = new EventBridgeClient({ endpoint: "http://localhost:4342" });

const maxInvocationHistoryRetrievalRetryCount = 4;

describe("trigger order confirmation notification", () => {
  it("should trigger order confirmation notification for registered user with success result", async () => {
    const brandId = "746120b5-702d-44a1-9c7e-e8c46b3a6e17";
    const brazeAppId = "f3764d75-4219-404b-96c9-3cb507fcb10d";

    const customerId = faker.datatype.uuid();
    const orderNumber = faker.datatype.string();
    const locale = faker.locale;
    const orderCreatedMessageId = faker.datatype.uuid();
    const orderDate = new Date().toISOString();
    const shippingMethodName = faker.datatype.string();
    const customerEmail = faker.datatype.string();

    const billingAddress = generateFakeAddress("GB");
    const shippingAddress = generateFakeAddress("GB");

    const lineItemOne = generateFakeLineItem(locale, "GBP");
    const lineItemTwo = generateFakeLineItem(locale, "GBP");

    const orderCreatedMessage = {
      customerId: customerId,
      customerEmail: customerEmail,
      orderNumber: orderNumber,
      billingAddress: billingAddress,
      shippingAddress: shippingAddress,
      lineItems: [lineItemOne, lineItemTwo],
      locale: locale,
      createdAt: orderDate,
      taxedPrice: {
        taxPortions: [
          {
            amount: generateFakeMoney("GBP"),
          },
        ],
      },
      totalPrice: generateFakeMoney("GBP"),
      shippingInfo: {
        price: generateFakeMoney("GBP"),
        shippingMethodName: shippingMethodName,
      },
    };

    const orderCreatedEvent = {
      version: "0",
      id: orderCreatedMessageId,
      DetailType: "order.created",
      Detail: JSON.stringify({
        payload: orderCreatedMessage,
        referenced: true,
        correlationId: faker.datatype.uuid(),
        metadata: {
          "x-emc-ubid": brandId,
        },
      }),
    } as PutEventsRequestEntry;

    const command = new PutEventsCommand({
      Entries: [orderCreatedEvent],
    });

    await ebClient.send(command);

    const expectedStatusCode = 201;
    const expectedResponse = {
      attributes_processed: 1,
      events_processed: 1,
      message: "success",
    };

    const expectedOrderConfirmationNotificationRequest = {
      attributes: [
        {
          external_id: `${brandId}:${customerId}`,
          user_alias: null,
          email: customerEmail,
          language_code: "", // ???
          brand_name: "", // ???
          country_code: billingAddress.country,
          time_zone: "", // ???
          account_status: "active",
          _update_existing_only: false,
        },
      ],
      purchases: [
        {
          external_id: `${brandId}:${customerId}`,
          user_alias: null,
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
          user_alias: null,
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
          user_alias: null,
          name: "order_placed",
          time: orderDate,
          properties: {
            products: [
              {
                image: lineItemOne.variant.images[1].url,
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
                image: lineItemTwo.variant.images[1].url,
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
              gift_message: null,
            },
            promo: null,
            billing: {
              tax_total_amount: formatCurrency(
                orderCreatedMessage.taxedPrice.taxPortions[0].amount.centAmount,
                orderCreatedMessage.taxedPrice.taxPortions[0].amount
                  .fractionDigits
              ),
              total_discount_amount: null,
              total_price: formatCurrency(
                orderCreatedMessage.totalPrice.centAmount,
                orderCreatedMessage.totalPrice.fractionDigits
              ),
              basket_total: formatCurrency(
                orderCreatedMessage.totalPrice.centAmount,
                orderCreatedMessage.totalPrice.fractionDigits
              ),
              shipping_price: formatCurrency(
                orderCreatedMessage.shippingInfo?.price.centAmount,
                orderCreatedMessage.shippingInfo?.price.fractionDigits
              ),
              currency: "£",
              payment_method: null,
              payment_method_detail: null,
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
              country: "United Kingdom",
            },
            shipping: {
              delivery_method: shippingMethodName,
              delivery_date: null,
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
              country: "United Kingdom",
            },
          },
        },
      ],
    };

    await assertInvocationRecord(
      expectedStatusCode,
      expectedResponse,
      expectedOrderConfirmationNotificationRequest
    );
  });

  it("should trigger order confirmation notification for guest user with success result", async () => {
    const brandId = "746120b5-702d-44a1-9c7e-e8c46b3a6e17";
    const brazeAppId = "f3764d75-4219-404b-96c9-3cb507fcb10d";

    const customerId = null;
    const customerEmail = faker.internet.email();
    const orderNumber = "peGIK[,>$w";
    const locale = faker.locale;
    const orderCreatedMessageId = faker.datatype.uuid();
    const orderDate = new Date().toISOString();
    const shippingMethodName = faker.datatype.string();

    const expectedUserAlias = {
      alias_name: `${brandId}:2ns2tt6gvypvk7r4ft4jkstuf`,
      alias_label: "user_key",
    };

    const billingAddress = generateFakeAddress("GB");
    const shippingAddress = generateFakeAddress("GB");

    const lineItemOne = generateFakeLineItem(locale);
    const lineItemTwo = generateFakeLineItem(locale);

    const orderCreatedMessage = {
      customerId: customerId,
      customerEmail: customerEmail,
      orderNumber: orderNumber,
      billingAddress: billingAddress,
      shippingAddress: shippingAddress,
      lineItems: [lineItemOne, lineItemTwo],
      locale: locale,
      createdAt: orderDate,
      taxedPrice: {
        taxPortions: [
          {
            amount: generateFakeMoney("GBP"),
          },
        ],
      },
      totalPrice: generateFakeMoney("GBP"),
      shippingInfo: {
        price: generateFakeMoney("GBP"),
        shippingMethodName: shippingMethodName,
      },
    };

    const orderCreatedEvent = {
      version: "0",
      id: orderCreatedMessageId,
      DetailType: "order.created",
      Detail: JSON.stringify({
        referenced: true,
        correlationId: faker.datatype.uuid(),
        payload: orderCreatedMessage,
        metadata: {
          "x-emc-ubid": brandId,
        },
      }),
    } as PutEventsRequestEntry;

    const command = new PutEventsCommand({
      Entries: [orderCreatedEvent],
    });

    await ebClient.send(command);

    const expectedStatusCode = 201;
    const expectedResponse = {
      attributes_processed: 1,
      events_processed: 1,
      message: "success",
    };

    const expectedOrderConfirmationNotificationRequest = {
      attributes: [
        {
          external_id: null,
          user_alias: expectedUserAlias,
          email: customerEmail,
          language_code: "", // ???
          brand_name: "", // ???
          country_code: billingAddress.country,
          time_zone: "", // ???
          account_status: "active",
          _update_existing_only: false,
        },
      ],
      purchases: [
        {
          external_id: null,
          user_alias: expectedUserAlias,
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
          external_id: null,
          user_alias: expectedUserAlias,
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
          external_id: null,
          user_alias: expectedUserAlias,
          name: "order_placed",
          time: orderDate,
          properties: {
            products: [
              {
                image: lineItemOne.variant.images[1].url,
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
                image: lineItemTwo.variant.images[1].url,
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
              gift_message: null,
            },
            promo: null,
            billing: {
              tax_total_amount: formatCurrency(
                orderCreatedMessage.taxedPrice.taxPortions[0].amount.centAmount,
                orderCreatedMessage.taxedPrice.taxPortions[0].amount
                  .fractionDigits
              ),
              total_discount_amount: null,
              total_price: formatCurrency(
                orderCreatedMessage.totalPrice.centAmount,
                orderCreatedMessage.totalPrice.fractionDigits
              ),
              basket_total: formatCurrency(
                orderCreatedMessage.totalPrice.centAmount,
                orderCreatedMessage.totalPrice.fractionDigits
              ),
              shipping_price: formatCurrency(
                orderCreatedMessage.shippingInfo?.price.centAmount,
                orderCreatedMessage.shippingInfo?.price.fractionDigits
              ),
              currency: "£",
              payment_method: null,
              payment_method_detail: null,
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
              country: "United Kingdom",
            },
            shipping: {
              delivery_method: shippingMethodName,
              delivery_date: null,
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
              country: "United Kingdom",
            },
          },
        },
      ],
    };

    await assertInvocationRecord(
      expectedStatusCode,
      expectedResponse,
      expectedOrderConfirmationNotificationRequest
    );
  });

  it("should trigger order confirmation notification for registered user with failed result", async () => {
    const brandId = "746120b5-702d-44a1-9c7e-e8c46b3a6e18";
    const brazeAppId = "f3764d75-4219-404b-96c9-3cb507fcb10d";

    const customerId = faker.datatype.uuid();
    const orderNumber = faker.datatype.string();
    const locale = faker.locale;
    const orderCreatedMessageId = faker.datatype.uuid();
    const orderDate = new Date().toISOString();
    const shippingMethodName = faker.datatype.string();
    const customerEmail = faker.internet.email();

    const billingAddress = generateFakeAddress("GB");
    const shippingAddress = generateFakeAddress("GB");

    const lineItemOne = generateFakeLineItem(locale);
    const lineItemTwo = generateFakeLineItem(locale);

    const orderCreatedMessage = {
      customerId: customerId,
      customerEmail: customerEmail,
      orderNumber: orderNumber,
      billingAddress: billingAddress,
      shippingAddress: shippingAddress,
      lineItems: [lineItemOne, lineItemTwo],
      locale: locale,
      createdAt: orderDate,
      taxedPrice: {
        taxPortions: [
          {
            amount: generateFakeMoney(),
          },
        ],
      },
      totalPrice: generateFakeMoney("GBP"),
      shippingInfo: {
        price: generateFakeMoney(),
        shippingMethodName: shippingMethodName,
      },
    };

    const orderCreatedEvent = {
      version: "0",
      id: orderCreatedMessageId,
      DetailType: "order.created",
      Detail: JSON.stringify({
        referenced: true,
        correlationId: faker.datatype.uuid(),
        payload: orderCreatedMessage,
        metadata: {
          "x-emc-ubid": brandId,
        },
      }),
    } as PutEventsRequestEntry;

    const command = new PutEventsCommand({
      Entries: [orderCreatedEvent],
    });

    await ebClient.send(command);

    const expectedStatusCode = 201;
    const expectedResponse = {
      message: "400 Bad Request",
      errors: {
        items: [
          {
            type: "400 Bad Request",
            input_array: "400 Bad Request",
            index: 0,
          },
        ],
      },
    };

    const expectedOrderConfirmationNotificationRequest = {
      attributes: [
        {
          external_id: `${brandId}:${customerId}`,
          user_alias: null,
          email: customerEmail,
          language_code: "", // ???
          brand_name: "", // ???
          country_code: billingAddress.country,
          time_zone: "", // ???
          account_status: "active",
          _update_existing_only: false,
        },
      ],
      purchases: [
        {
          external_id: `${brandId}:${customerId}`,
          user_alias: null,
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
          user_alias: null,
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
          user_alias: null,
          name: "order_placed",
          time: orderDate,
          properties: {
            products: [
              {
                image: lineItemOne.variant.images[1].url,
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
                image: lineItemTwo.variant.images[1].url,
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
              gift_message: null,
            },
            promo: null,
            billing: {
              tax_total_amount: formatCurrency(
                orderCreatedMessage.taxedPrice.taxPortions[0].amount.centAmount,
                orderCreatedMessage.taxedPrice.taxPortions[0].amount
                  .fractionDigits
              ),
              total_discount_amount: null,
              total_price: formatCurrency(
                orderCreatedMessage.totalPrice.centAmount,
                orderCreatedMessage.totalPrice.fractionDigits
              ),
              basket_total: formatCurrency(
                orderCreatedMessage.totalPrice.centAmount,
                orderCreatedMessage.totalPrice.fractionDigits
              ),
              shipping_price: formatCurrency(
                orderCreatedMessage.shippingInfo?.price.centAmount,
                orderCreatedMessage.shippingInfo?.price.fractionDigits
              ),
              currency: "£",
              payment_method: null,
              payment_method_detail: null,
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
              country: "United Kingdom",
            },
            shipping: {
              delivery_method: shippingMethodName,
              delivery_date: null,
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
              country: "United Kingdom",
            },
          },
        },
      ],
    };

    await assertInvocationRecord(
      expectedStatusCode,
      expectedResponse,
      expectedOrderConfirmationNotificationRequest
    );
  });
});

async function assertInvocationRecord(
  expectedStatusCode: number,
  expectedResponse,
  expectedRequestBody
) {
  let assertedInvocationHistory = false;

  let invocationHistory;
  for (
    let counter = 0;
    counter < maxInvocationHistoryRetrievalRetryCount;
    counter++
  ) {
    await delay(1000);
    invocationHistory = await getInvocationHistory();

    if (!invocationHistory || invocationHistory.invocations?.length === 0) {
      continue;
    }

    const latestInvocation = invocationHistory.invocations[0];

    expect(latestInvocation.response.statusCode).toBe(expectedStatusCode);
    expect(latestInvocation.response.response.value).toStrictEqual(
      expectedResponse
    );
    expect(latestInvocation.request.body).toStrictEqual(expectedRequestBody);

    assertedInvocationHistory = true;
    break;
  }

  if (assertedInvocationHistory === false) {
    throw new Error("Failed to find invocation record");
  }
}

// Requires min. NodeJS v16.6.0
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const brazeMockBaseURL = process.env.BRAZE_MOCK_URL || "";
const axiosInstance = axios.create({
  baseURL: brazeMockBaseURL,
});

async function getInvocationHistory() {
  const response = await axiosInstance.get(
    "/braze/invocations/history/latest/1"
  );

  return response.data;
}

function formatCurrency(
  centAmount: number,
  fractionDigits: number,
  formatFractionDigits = 2
): string {
  return (centAmount / Math.pow(10, fractionDigits)).toFixed(
    formatFractionDigits
  );
}
