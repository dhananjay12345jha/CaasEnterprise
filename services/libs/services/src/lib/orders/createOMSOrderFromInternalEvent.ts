import {
  LineItem,
  LocalizedString,
  Metadata,
  OrderState,
  Payload,
} from "@everymile-schemas/order-created";
import {
  EXTERNAL_PROVIDER_TYPES,
  getBrandConfigCachedClient,
  OMS_CONFIG_KEYS,
  OmsProviderConfig,
} from "@ei-services/brand-config";
import { OrderPayload } from "@ei-services/order-management-service";
import resolveShippingMethodKey from "./resolveShippingMethodKey";

export const CT_STATUS = "Open";
export const OMS_STATUS = "completed";
const LOCALE = "en-GB"; // TODO localize this
const OMS_CHANNEL_TYPE = 5;

export function transformCentPrecisionMoney({
  centAmount,
  fractionDigits,
}: {
  centAmount: number;
  fractionDigits: number;
}): number {
  return Number.parseFloat((centAmount / 100).toFixed(fractionDigits));
}

export async function resolveBrandID(ubid: string): Promise<number> {
  const config =
    await getBrandConfigCachedClient().getProviderConfig<OmsProviderConfig>(
      ubid,
      [OMS_CONFIG_KEYS.OMS_BRAND_ID],
      EXTERNAL_PROVIDER_TYPES.OMS
    );
  return parseInt(config["oms-emc-brand-id"], 10);
}

export function transformStatus(ctOrderState: OrderState): string {
  if (ctOrderState !== CT_STATUS) {
    throw new Error(
      `The status of the order is not recognised. The recognisable status is "${CT_STATUS}" but received "${ctOrderState}".`
    );
  }
  return OMS_STATUS;
}

export function transformAmountPaid({
  centAmount,
  fractionDigits,
}: {
  centAmount: number;
  fractionDigits: number;
}): number {
  return transformCentPrecisionMoney({
    centAmount,
    fractionDigits,
  });
}

export function transformShippingCost({
  centAmount,
  fractionDigits,
}: {
  centAmount: number;
  fractionDigits: number;
}): number {
  return transformCentPrecisionMoney({
    centAmount,
    fractionDigits,
  });
}

export function transformAddressLine1(
  pOBox?: string,
  apartment?: string,
  building?: string,
  streetNumber?: string,
  streetName?: string
): string {
  const arr = pOBox ? [pOBox] : [apartment, building, streetNumber, streetName];
  return arr.filter(Boolean).join(" ");
}

export function transformAddressLine2(
  additionalStreetInfo?: string,
  additionalAddressInfo?: string,
  state?: string
): string {
  return [additionalStreetInfo, additionalAddressInfo, state]
    .filter(Boolean)
    .join(", ");
}

export function transformOrderItemsItemName(name: LocalizedString): string {
  if (!name[LOCALE]) {
    const unknownLocales = Object.keys(name).join(", ");
    throw new Error(`Unknown locale: ${unknownLocales}`);
  }
  return name[LOCALE];
}

export function transformOrderItemsItemCost({
  centAmount,
  fractionDigits,
}: {
  centAmount: number;
  fractionDigits: number;
}): number {
  return transformCentPrecisionMoney({
    centAmount,
    fractionDigits,
  });
}

export function transformOrderItems(lineItems: Array<LineItem>): Array<{
  quantity: number;
  itemSKU: string;
  saleItemReference: string;
  itemName: string;
  itemCost: number;
  vatRate: number;
}> {
  return lineItems.map((lineItem) => ({
    quantity: lineItem.quantity, // Required
    itemSKU: lineItem.variant.sku, // Required
    saleItemReference: lineItem.id, // Required
    itemName: transformOrderItemsItemName(lineItem.name), // Required
    itemCost: transformOrderItemsItemCost(lineItem.price.value), // Required
    vatRate: lineItem.taxRate.amount, // Required
  }));
}

export interface PayloadAndResolvedData {
  payload: Payload;
  resolvedData: {
    ctShippingMethodKey: string;
    omsBrandId: number;
  };
}

export function transformToOmsOrder({
  payload,
  resolvedData,
}: PayloadAndResolvedData): OrderPayload {
  return {
    // These properties are required.
    channelType: OMS_CHANNEL_TYPE, // We just need to hardcode this.
    brandID: resolvedData.omsBrandId,
    status: transformStatus(payload.orderState),
    currencyCode: payload.totalPrice.currencyCode,
    saleReference: payload.orderNumber,
    shippingService: resolvedData.ctShippingMethodKey,
    datePurchased: payload.createdAt,
    amountPaid: transformAmountPaid(payload.totalPrice),
    shippingCost: transformShippingCost(payload.shippingInfo.price),
    customerFirstName: payload.billingAddress.firstName,
    customerLastName: payload.billingAddress.lastName,
    customerAddressLine1: transformAddressLine1(
      payload.billingAddress.pOBox,
      payload.billingAddress.apartment,
      payload.billingAddress.building,
      payload.billingAddress.streetNumber,
      payload.billingAddress.streetName
    ),
    customerTownCity: payload.billingAddress.city,
    customerPostalCode: payload.billingAddress.postalCode,
    customerCountryCode: payload.billingAddress.country,
    customerEmail: payload.customerEmail, // TODO Clarify... This might be payload.billingAddress.email
    shippingFirstName: payload.shippingAddress.firstName,
    shippingLastName: payload.shippingAddress.lastName,
    shippingAddressLine1: transformAddressLine1(
      payload.shippingAddress.pOBox,
      payload.shippingAddress.apartment,
      payload.shippingAddress.building,
      payload.shippingAddress.streetNumber,
      payload.shippingAddress.streetName
    ),
    shippingTownCity: payload.shippingAddress.city,
    shippingPostalCode: payload.shippingAddress.postalCode,
    shippingCountryCode: payload.shippingAddress.country,
    shippingEmail: payload.shippingAddress.email,
    orderItems: transformOrderItems(payload.lineItems),
    /// These properties are optional.
    customerCompany: payload.billingAddress.company,
    customerAddressLine2: transformAddressLine2(
      payload.billingAddress.additionalStreetInfo,
      payload.billingAddress.additionalAddressInfo,
      payload.billingAddress.state
    ),
    customerCountyRegion: payload.billingAddress.region,
    customerPhone: payload.billingAddress.mobile,
    shippingCompany: payload.shippingAddress.company,
    shippingAddressLine2: transformAddressLine2(
      payload.shippingAddress.additionalStreetInfo,
      payload.shippingAddress.additionalAddressInfo,
      payload.shippingAddress.state
    ),
    shippingCountyRegion: payload.shippingAddress.region,
    shippingPhone: payload.shippingAddress.mobile,
  };
}

export interface PayloadAndMetadata {
  payload: Payload;
  metadata: Metadata;
}

export default async function createOMSOrderFromInternalEvent({
  payload,
  metadata,
}: PayloadAndMetadata): Promise<OrderPayload> {
  const [ctShippingMethodKey, omsBrandId] = await Promise.all([
    resolveShippingMethodKey(
      metadata["x-emc-ubid"],
      payload.shippingInfo.shippingMethod
    ),
    resolveBrandID(metadata["x-emc-ubid"]),
  ]);

  return transformToOmsOrder({
    payload,
    resolvedData: { ctShippingMethodKey, omsBrandId },
  });
}
