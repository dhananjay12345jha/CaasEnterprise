export class CTOrderResponse {
  type: string;
  id: string;
  version: number;
  versionModifiedAt: string;
  lastMessageSequenceNumber: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: LastModifiedBy;
  createdBy: CreatedBy;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  locale: string;
  totalPrice: TotalPrice;
  taxedPrice: TaxedPrice;
  orderState: string;
  syncInfo: any[];
  returnInfo: any[];
  taxMode: string;
  inventoryMode: string;
  taxRoundingMode: string;
  taxCalculationMode: string;
  origin: string;
  shippingInfo: ShippingInfo;
  shippingAddress: ShippingAddress;
  lineItems: LineItem[];
  customLineItems: any[];
  transactionFee: boolean;
  discountCodes: any[];
  directDiscounts: any[];
  cart: Cart;
  custom: Custom;
  paymentInfo: PaymentInfo;
  billingAddress: BillingAddress;
  itemShippingAddresses: any[];
  refusedGifts: any[];
}

export class LastModifiedBy {
  clientId: string;
  isPlatformClient: boolean;
  customer: Customer;
}

export class Customer {
  typeId: string;
  id: string;
}

export class CreatedBy {
  clientId: string;
  isPlatformClient: boolean;
}

export class TotalPrice {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TaxedPrice {
  totalNet: TotalNet;
  totalGross: TotalGross;
  taxPortions: TaxPortion[];
  totalTax: TotalTax;
}

export class TotalNet {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TotalGross {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TaxPortion {
  rate: number;
  amount: Amount;
  name: string;
}

export class Amount {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TotalTax {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class ShippingInfo {
  shippingMethodName: string;
  price: Price;
  shippingRate: ShippingRate;
  taxRate: TaxRate;
  taxCategory: TaxCategory;
  deliveries: Delivery[];
  shippingMethod: ShippingMethod;
  taxedPrice: TaxedPrice2;
  shippingMethodState: string;
}

export class Price {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class ShippingRate {
  price: Price2;
  freeAbove: FreeAbove;
  tiers: any[];
}

export class Price2 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class FreeAbove {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TaxRate {
  name: string;
  amount: number;
  includedInPrice: boolean;
  country: string;
  state: string;
  id: string;
  subRates: any[];
}

export class TaxCategory {
  typeId: string;
  id: string;
}

export class ShippingMethod {
  typeId: string;
  id: string;
}

export class TaxedPrice2 {
  totalNet: TotalNet2;
  totalGross: TotalGross2;
  totalTax: TotalTax2;
}

export class TotalNet2 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TotalGross2 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TotalTax2 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class ShippingAddress {
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  streetName: string;
  streetNumber: string;
  additionalStreetInfo: string;
  postalCode: string;
  city: string;
  region: string;
  state: string;
  country: string;
  company: string;
  building: string;
  apartment: string;
  pOBox: string;
  phone: string;
  mobile: string;
  email: string;
  additionalAddressInfo: string;
}

export class LineItem {
  id: string;
  productId: string;
  productKey: string;
  name: Name;
  productType: ProductType;
  productSlug: ProductSlug;
  variant: Variant;
  price: Price4;
  quantity: number;
  discountedPricePerQuantity: any[];
  taxRate: TaxRate2;
  addedAt: string;
  lastModifiedAt: string;
  state: State[];
  priceMode: string;
  lineItemMode: string;
  totalPrice: TotalPrice2;
  taxedPrice: TaxedPrice3;
}

export class Name {
  "en-GB": string;
  "en-US"?: string;
}

export class ProductType {
  typeId: string;
  id: string;
  version: number;
}

export class ProductSlug {
  "en-GB": string;
  "en-US"?: string;
}

export class Variant {
  id: number;
  sku: string;
  key: string;
  prices: Price3[];
  images: Image[];
  attributes: Attribute[];
  assets: any[];
  availability: Availability;
}

export class Price3 {
  id: string;
  value: Value;
}

export class Value {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class Image {
  url: string;
  label: string;
  dimensions: Dimensions;
}

export class Dimensions {
  w: number;
  h: number;
}

export class Attribute {
  name: string;
  value: Value2;
}

export class Value2 {
  "en-GB"?: string;
  "en-US"?: string;
}

export class Availability {
  isOnStock: boolean;
  availableQuantity: number;
  version: number;
  id: string;
}

export class Price4 {
  id: string;
  value: Value3;
}

export class Value3 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TaxRate2 {
  name: string;
  amount: number;
  includedInPrice: boolean;
  country: string;
  state: string;
  id: string;
  subRates: any[];
}

export class State {
  quantity: number;
  state: State2;
}

export class State2 {
  typeId: string;
  id: string;
}

export class TotalPrice2 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TaxedPrice3 {
  totalNet: TotalNet3;
  totalGross: TotalGross3;
  totalTax: TotalTax3;
}

export class TotalNet3 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TotalGross3 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TotalTax3 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class Cart {
  typeId: string;
  id: string;
}

export class Custom {
  type: Type;
  fields: Fields;
}

export class Type {
  typeId: string;
  id: string;
}

export class Fields {
  emcOrderId: string;
  emcPaymentMethod: string;
  emcLast4Digits: string;
}

export class PaymentInfo {
  payments: Payment[];
}

export class Payment {
  typeId: string;
  id: string;
}

export class BillingAddress {
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  streetName: string;
  streetNumber: string;
  additionalStreetInfo: string;
  postalCode: string;
  city: string;
  region: string;
  state: string;
  country: string;
  company: string;
  building: string;
  apartment: string;
  pOBox: string;
  email: string;
  additionalAddressInfo: string;
  key: string;
  mobile: string;
  phone: string;
}
export class Delivery {
  id: string;
  createdAt: string;
  items: Item[];
  parcels: Parcel[];
}
export interface Item {
  id: string;
  quantity: number;
}

export interface Parcel {
  id: string;
  createdAt: string;
  items: Item[];
  trackingData?: TrackingData;
}

export interface TrackingData {
  trackingId: string;
  carrier: string;
  isReturn: boolean;
}
