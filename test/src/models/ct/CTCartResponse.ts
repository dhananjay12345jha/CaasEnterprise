export class CTCartResponse {
  type: string;
  id: string;
  version: number;
  lastMessageSequenceNumber: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: LastModifiedBy;
  createdBy: CreatedBy;
  customerId: string;
  lineItems: LineItem[];
  cartState: string;
  totalPrice: TotalPrice2;
  taxedPrice: TaxedPrice2;
  customLineItems: any[];
  discountCodes: any[];
  directDiscounts: any[];
  custom: Custom;
  inventoryMode: string;
  taxMode: string;
  taxRoundingMode: string;
  taxCalculationMode: string;
  deleteDaysAfterLastModification: number;
  refusedGifts: any[];
  origin: string;
  shippingAddress: ShippingAddress;
  itemShippingAddresses: any[];
  totalLineItemQuantity: number;
}

export class LastModifiedBy {
  customer: Customer;
}

export class Customer {
  typeId: string;
  id: string;
}

export class CreatedBy {
  customer: Customer2;
}

export class Customer2 {
  typeId: string;
  id: string;
}

export class LineItem {
  id: string;
  productId: string;
  productKey: string;
  name: Name;
  productType: ProductType;
  productSlug: ProductSlug;
  variant: Variant;
  price: Price2;
  quantity: number;
  discountedPricePerQuantity: any[];
  taxRate: TaxRate;
  addedAt: string;
  lastModifiedAt: string;
  state: State[];
  priceMode: string;
  totalPrice: TotalPrice;
  taxedPrice: TaxedPrice;
  lineItemMode: string;
}

export class Name {
  "en-US": string;
}

export class ProductType {
  typeId: string;
  id: string;
  version: number;
}

export class ProductSlug {
  "en-US": string;
  "en-GB": string;
}

export class Variant {
  id: number;
  sku: string;
  key: string;
  prices: Price[];
  images: Image[];
  attributes: any[];
  assets: any[];
  availability: Availability;
}

export class Price {
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
  dimensions: Dimensions;
}

export class Dimensions {
  w: number;
  h: number;
}

export class Availability {
  isOnStock: boolean;
  availableQuantity: number;
  version: number;
  id: string;
}

export class Price2 {
  id: string;
  value: Value2;
}

export class Value2 {
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

export class TotalPrice {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TaxedPrice {
  totalNet: TotalNet;
  totalGross: TotalGross;
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

export class TotalTax {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TotalPrice2 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class TaxedPrice2 {
  totalNet: TotalNet2;
  totalGross: TotalGross2;
  taxPortions: TaxPortion[];
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

export class TotalTax2 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
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
  emcUserMarketingPreference: string;
  emcUserTimeZone: string;
}

export class ShippingAddress {
  country: string;
}
