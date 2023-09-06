import {
  BrazeClient,
  calculateBasketTotal,
  formatCurrency,
  getSymbolFromCurrency,
  toFriendlyCountryName,
  TrackUserRequest,
  UserAttributes,
  UserEventBilling,
  UserEventOrder,
  UserEventProduct,
  UserEventShipping,
  UserOrderPlacedEvent,
  UserPurchase,
} from "@ei-services/braze-service";
import { BrandMeta, CRMBaseClass, UserIdentity } from "@ei-services/services";
import { strict as assert } from "node:assert";
import {
  Address,
  Attribute,
  LineItem,
  Payload as OrderCreatedMessage,
} from "@everymile-schemas/order-created";
import { BRAZE_CONFIG_KEYS } from "@ei-services/brand-config";

type CTImage = {
  url: string;
  label: string;
};

export class OrderConfirmation extends CRMBaseClass {
  static THUMBNAIL_IMAGE_LABEL = "thumbnail";

  async triggerNotification(
    brandId: string,
    orderCreatedMessage: OrderCreatedMessage
  ): Promise<void> {
    const brazeServiceConfig = await this.getBrazeServiceConfig(brandId, {
      apiKey: BRAZE_CONFIG_KEYS.API_KEY,
      baseURL: BRAZE_CONFIG_KEYS.API_BASE_URL,
      defaultCountryCode: BRAZE_CONFIG_KEYS.DEFAULT_COUNTRY_CODE,
      appGroupWeb: BRAZE_CONFIG_KEYS.API_APP_GROUP_WEB,
    });

    const brazeClient = new BrazeClient({
      apiKey: brazeServiceConfig.apiKey,
      baseURL: brazeServiceConfig.baseURL,
      shouldRetry: true,
    });

    console.info("Generating order confirmation notification request message");

    const brandMeta: BrandMeta = await this.getBrandMeta(
      brandId,
      brazeServiceConfig
    );
    const id = this.generateUserIdentity(brandId, orderCreatedMessage);
    const orderConfirmationNotificationRequest =
      this.buildOrderConfirmationNotificationRequest(
        orderCreatedMessage,
        id,
        brazeServiceConfig.appGroupWeb,
        brandMeta
      );

    console.debug(
      "Triggering CRM user track endpoint with order confirmation request:",
      JSON.stringify(orderConfirmationNotificationRequest)
    );
    const trackUserResponse = await brazeClient.trackUser(
      orderConfirmationNotificationRequest
    );
    console.debug(
      "Received response from CRM user track endpoint:",
      JSON.stringify(trackUserResponse)
    );

    if (trackUserResponse.errors) {
      throw new Error(
        "Error while tracking user. ErrorDetails=" +
          JSON.stringify(trackUserResponse.errors)
      );
    }
  }

  /**
   * @internal public for testing
   */
  buildOrderConfirmationNotificationRequest(
    orderCreatedMessage: OrderCreatedMessage,
    id: UserIdentity,
    brazeAppId: string,
    brandMeta: BrandMeta
  ): TrackUserRequest {
    const userAttributes = this.buildUserAttributesObject(
      orderCreatedMessage,
      id,
      brandMeta
    );

    return {
      purchases: orderCreatedMessage.lineItems.map((lineItem) =>
        this.buildUserPurchasesRequest(
          lineItem,
          id,
          this.getOrderLocale(orderCreatedMessage, brandMeta),
          orderCreatedMessage.createdAt,
          brazeAppId
        )
      ),
      events: [
        this.buildUserOrderPlacedEvent(orderCreatedMessage, id, brandMeta),
      ],
      attributes: userAttributes ? [userAttributes] : [],
    };
  }

  private generateUserIdentity(
    brandId: string,
    orderCreatedMessage: OrderCreatedMessage
  ): UserIdentity {
    if (orderCreatedMessage.customerId) {
      // registered user
      return {
        type: "ExternalId",
        id: this.buildExternalId(brandId, orderCreatedMessage.customerId),
      };
    } else if (orderCreatedMessage.orderNumber) {
      return {
        type: "UserAlias",
        alias: this.buildUserAlias(brandId, orderCreatedMessage.orderNumber),
      };
    } else {
      assert.fail(
        "Cannot generate user identity - both customerId and orderNumber are missing"
      );
    }
  }

  private buildUserAttributesObject(
    orderCreatedMessage: OrderCreatedMessage,
    id: UserIdentity,
    brandMeta: BrandMeta
  ): UserAttributes | null {
    const accountType = id.type === "ExternalId" ? "full" : "guest";
    const userTimeZone = orderCreatedMessage.custom?.fields?.emcUserTimeZone;
    const userMarketingPreference =
      orderCreatedMessage.custom?.fields?.emcUserMarketingPreference;
    const brazeMarketingPreferenceStatus = this.getBrazeSubscriptionStatus(
      userMarketingPreference
    );

    if (id.type === "ExternalId") {
      if (userMarketingPreference === "opt_in") {
        return {
          external_id: id.id,
          email_subscribe: brazeMarketingPreferenceStatus,
          time_zone: userTimeZone,
        };
      }
    } else {
      const userAttributes: UserAttributes = {
        user_alias: id.alias,
        email: orderCreatedMessage.customerEmail,
        country_code: brandMeta.countryCode,
        account_type: accountType,
        account_status: "active",
        _update_existing_only: false,
      };

      if (userMarketingPreference === "opt_in") {
        userAttributes.email_subscribe = brazeMarketingPreferenceStatus;
        userAttributes.time_zone = userTimeZone;
      }
      return userAttributes;
    }
    return null;
  }

  private buildUserOrderPlacedEvent(
    orderCreatedMessage: OrderCreatedMessage,
    id: UserIdentity,
    brandMeta: BrandMeta
  ): UserOrderPlacedEvent {
    return {
      name: "order_placed",
      time: orderCreatedMessage.createdAt,
      properties: {
        products: orderCreatedMessage.lineItems.map((lineItem: LineItem) =>
          this.buildUserOrderPlacedEventProduct(
            lineItem,
            this.getOrderLocale(orderCreatedMessage, brandMeta)
          )
        ),
        order: this.buildUserOrderPlacedEventOrder(orderCreatedMessage),
        billing: this.buildUserOrderPlacedEventBilling(orderCreatedMessage),
        shipping: this.buildUserOrderPlacedEventShipping(orderCreatedMessage),
      },
      ...(id.type === "ExternalId" ? { external_id: id.id } : undefined),
      ...(id.type === "UserAlias" ? { user_alias: id.alias } : undefined),
    };
  }

  private buildUserOrderPlacedEventBilling(
    orderCreatedMessage: OrderCreatedMessage
  ): UserEventBilling {
    const shippingPriceValue = orderCreatedMessage.shippingInfo?.price;
    assert.ok(
      shippingPriceValue,
      "Expected order to have a shipping price value - order.id: " +
        orderCreatedMessage.id
    );
    const taxAmountValue =
      orderCreatedMessage.taxedPrice?.taxPortions?.[0]?.amount;
    assert.ok(
      taxAmountValue,
      "Expected order to have a tax amount value - order.id: " +
        orderCreatedMessage.id
    );
    return {
      tax_total_amount: formatCurrency(
        taxAmountValue.centAmount,
        taxAmountValue.fractionDigits
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
        shippingPriceValue.centAmount,
        shippingPriceValue.fractionDigits
      ),
      currency: getSymbolFromCurrency(
        orderCreatedMessage.totalPrice.currencyCode
      ),
      address_same_as_shipping:
        orderCreatedMessage.shippingAddress.id ===
        orderCreatedMessage.billingAddress.id,
      title: orderCreatedMessage.billingAddress.title ?? "",
      company_name: orderCreatedMessage.billingAddress.company ?? "",
      first_name: orderCreatedMessage.billingAddress.firstName,
      last_name: orderCreatedMessage.billingAddress.lastName,
      address_line1: this.formatAddressLine1(
        orderCreatedMessage.billingAddress
      ),
      address_line2:
        orderCreatedMessage.billingAddress.additionalStreetInfo ?? "",
      county: orderCreatedMessage.billingAddress.state ?? "",
      city: orderCreatedMessage.billingAddress.city,
      postcode: orderCreatedMessage.billingAddress.postalCode,
      country: toFriendlyCountryName(
        orderCreatedMessage.billingAddress.country
      ),
    };
  }

  private buildUserOrderPlacedEventShipping(
    orderCreatedMessage: OrderCreatedMessage
  ): UserEventShipping {
    const addressLine1Formatted = this.formatAddressLine1(
      orderCreatedMessage.shippingAddress
    );

    return {
      delivery_method: orderCreatedMessage.shippingInfo.shippingMethodName,
      title: orderCreatedMessage.shippingAddress.title ?? "",
      company_name: orderCreatedMessage.shippingAddress.company ?? "",
      first_name: orderCreatedMessage.shippingAddress.firstName,
      last_name: orderCreatedMessage.shippingAddress.lastName,
      address_line1: addressLine1Formatted,
      address_line2:
        orderCreatedMessage.shippingAddress.additionalStreetInfo ?? "",
      county: orderCreatedMessage.shippingAddress.state ?? "",
      city: orderCreatedMessage.shippingAddress.city,
      postcode: orderCreatedMessage.shippingAddress.postalCode,
      country: toFriendlyCountryName(
        orderCreatedMessage.shippingAddress.country
      ),
    };
  }

  private buildUserOrderPlacedEventOrder(
    orderCreatedMessage: OrderCreatedMessage
  ): UserEventOrder {
    return {
      order_number: orderCreatedMessage.orderNumber,
      order_date: orderCreatedMessage.createdAt,
      order_url: "", // There is no front end page to display the order by order number
      order_total_products: orderCreatedMessage.lineItems.reduce(
        (n: number, { quantity }: LineItem) => n + quantity,
        0
      ),
    };
  }

  private buildUserOrderPlacedEventProduct(
    lineItem: LineItem,
    orderLocale: string
  ): UserEventProduct {
    // use image.label === thumbnail, see https://jira.salmon.com/browse/WCAAS-3355
    // previous logic, see https://jira.salmon.com/browse/WCAAS-1839
    const imageUrl = lineItem.variant?.images?.find(
      (image: CTImage) =>
        image.label === OrderConfirmation.THUMBNAIL_IMAGE_LABEL
    ).url;
    assert.ok(
      imageUrl,
      "Expected line item to have image URL with a label of thumbnail - item.id: " +
        lineItem.id
    );
    const itemPriceValue = lineItem?.price?.value;
    assert.ok(
      itemPriceValue,
      "Expected line item to have price - item.id: " + lineItem.id
    );

    return {
      image: imageUrl,
      sku: lineItem.variant.sku,
      name: lineItem.name[orderLocale],
      quantity: lineItem.quantity,
      product_attributes:
        lineItem.variant.attributes?.map((attribute) => {
          return this.mapAttribute(attribute, lineItem, orderLocale);
        }) ?? [],
      purchase_price: formatCurrency(
        itemPriceValue.centAmount,
        itemPriceValue.fractionDigits
      ),
      total_purchase_price: formatCurrency(
        lineItem.totalPrice.centAmount,
        lineItem.totalPrice.fractionDigits
      ),
      page_url: "", // There is no front end page to display the product by sku
    };
  }

  private mapAttribute(
    attribute: Attribute,
    lineItem: LineItem,
    orderLocale: string
  ) {
    // CT SDK types treat name as required
    assert.ok(
      attribute.name,
      "Expected product variant attribute name to be defined. product.id: " +
        lineItem.productId
    );
    const attributeValue = this.getAttributeValue(attribute, orderLocale);
    if (attributeValue === null) {
      console.warn(
        "Could not get attribute value",
        JSON.stringify({ attribute, productId: lineItem.productId })
      );
    }
    return {
      label: attribute.name,
      value: attributeValue ?? "",
    };
  }

  private getAttributeValue(
    attribute: Attribute,
    orderLocale: string
  ): string | null {
    if (typeof attribute.value === "string") {
      return attribute.value;
    } else if (
      typeof attribute.value === "object" &&
      attribute.value != null &&
      !Array.isArray(attribute.value)
    ) {
      const maybeLocalised = attribute.value?.[orderLocale];
      return typeof maybeLocalised === "string" ? maybeLocalised : null;
    } else {
      return null;
    }
  }

  private buildUserPurchasesRequest(
    lineItem: LineItem,
    id: UserIdentity,
    orderLocale: string,
    orderDate: string,
    brazeAppId: string
  ): UserPurchase {
    const priceValue = lineItem?.price?.value;
    assert.ok(
      priceValue,
      "Expected line item to have price - item.id: " + lineItem.id
    );
    return {
      app_id: brazeAppId,
      product_id: lineItem.name[orderLocale],
      currency: priceValue.currencyCode,
      price: Number(
        formatCurrency(priceValue.centAmount, priceValue.fractionDigits)
      ),
      quantity: lineItem.quantity,
      time: orderDate,
      ...(id.type === "ExternalId" ? { external_id: id.id } : undefined),
      ...(id.type === "UserAlias" ? { user_alias: id.alias } : undefined),
    };
  }

  private formatAddressLine1(shippingAddress: Address): string {
    return [shippingAddress.streetNumber, shippingAddress.streetName]
      .filter(Boolean)
      .join(" ");
  }

  private getOrderLocale(
    orderCreatedMessage: OrderCreatedMessage,
    brandMeta: BrandMeta
  ): string {
    return orderCreatedMessage.locale ?? brandMeta.languageCode;
  }
}
