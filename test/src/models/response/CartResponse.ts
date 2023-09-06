export class CartResponse {
  // getTotalPrice(): TotalPrice {
  //   return this.totalPrice;
  // }
  //
  // setTotalPrice(value: TotalPrice) {
  //   this.totalPrice = value;
  // }
  type: string;
  id: string;
  version: number;
  versionModifiedAt: string;
  lastMessageSequenceNumber: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: LastModifiedBy;
  createdBy: CreatedBy;
  customerId: string;
  customerEmail: string;
  anonymousId: string;
  locale: string;
  lineItems: LineItem[];
  cartState: string;
  totalPrice: TotalPrice;
  taxedPrice: TaxedPrice2;
  shippingInfo: ShippingInfo;
  shippingAddress: ShippingAddress;
  customLineItems: any[];
  discountCodes: any[];
  directDiscounts: any[];
  custom: Custom;
  paymentInfo: PaymentInfo;
  inventoryMode: string;
  taxMode: string;
  taxRoundingMode: string;
  taxCalculationMode: string;
  deleteDaysAfterLastModification: number;
  refusedGifts: any[];
  origin: string;
  billingAddress: BillingAddress;
  itemShippingAddresses: any[];
  totalLineItemQuantity: number;
}

export class LastModifiedBy {
  clientId: string;
  isPlatformClient: boolean;
  customer: Customer;
  anonymousId: string;
}

export class Customer {
  typeId: string;
  id: string;
}

export class CreatedBy {
  clientId: string;
  isPlatformClient: boolean;
  customer: Customer2;
  anonymousId: string;
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
  lineItemMode: string;
  private totalPrice: TotalPrice;
  taxedPrice: TaxedPrice;
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
  prices: Price[];
  images: Image[];
  attributes: Attribute[];
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

export class Price2 {
  id: string;
  value: Value3;
}

export class Value3 {
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

export class State {
  quantity: number;
  state: State2;
}

export class State2 {
  typeId: string;
  id: string;
}

export class TotalPrice {
  // get fractionDigits(): number {
  //   return this._fractionDigits;
  // }
  //
  // set fractionDigits(value: number) {
  //   this._fractionDigits = value;
  // }
  // getCentAmount(): number {
  //   return this.centAmount;
  // }
  //
  // setCentAmount(value: number) {
  //   this.centAmount = value;
  // }
  // get currencyCode(): string {
  //   return this._currencyCode;
  // }
  //
  // set currencyCode(value: string) {
  //   this._currencyCode = value;
  // }
  // get type(): string {
  //   return this._type;
  // }
  //
  // set type(value: string) {
  //   this._type = value;
  // }
  private _type: string;
  currencyCode: string;
  centAmount: number;
  private _fractionDigits: number;
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

export class ShippingInfo {
  shippingMethodName: string;
  price: Price3;
  shippingRate: ShippingRate;
  taxRate: TaxRate2;
  taxCategory: TaxCategory;
  deliveries: any[];
  shippingMethod: ShippingMethod;
  taxedPrice: TaxedPrice3;
  shippingMethodState: string;
}

export class Price3 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class ShippingRate {
  price: Price4;
  freeAbove: FreeAbove;
  tiers: any[];
}

export class Price4 {
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

export class TaxRate2 {
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
}
