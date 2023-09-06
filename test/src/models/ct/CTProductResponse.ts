export class CTProductResponse {
  id: string;
  version: number;
  lastMessageSequenceNumber: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: LastModifiedBy;
  createdBy: CreatedBy;
  productType: ProductType;
  masterData: MasterData;
  key: string;
  taxCategory: TaxCategory;
  lastVariantId: number;
}

export class LastModifiedBy {
  isPlatformClient: boolean;
}

export class CreatedBy {
  isPlatformClient: boolean;
  user: User;
}

export class User {
  typeId: string;
  id: string;
}

export class ProductType {
  typeId: string;
  id: string;
}

export class MasterData {
  current: Current;
  staged: Staged;
  published: boolean;
  hasStagedChanges: boolean;
}

export class Current {
  name: Name;
  description: Description;
  categories: Category[];
  categoryOrderHints: CategoryOrderHints;
  slug: Slug;
  metaTitle: MetaTitle;
  metaDescription: MetaDescription;
  masterVariant: MasterVariant;
  variants: Variant[];
  searchKeywords: SearchKeywords;
}

export class Name {
  "de-DE": string;
  "en-US": string;
}

export class Description {
  "de-DE": string;
  "en-US": string;
}

export class Category {
  typeId: string;
  id: string;
}

export class CategoryOrderHints {}

export class Slug {
  "de-DE": string;
  "en-US": string;
}

export class MetaTitle {
  "de-DE": string;
  "en-US": string;
}

export class MetaDescription {
  "de-DE": string;
  "en-US": string;
}

export class MasterVariant {
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
  tiers: Tier[];
}

export class Value {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class Tier {
  minimumQuantity: number;
  value: Value2;
}

export class Value2 {
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
  value: Value3;
}

export class Value3 {
  "en-US": string;
  "de-DE": string;
}

export class Availability {
  isOnStock: boolean;
  availableQuantity: number;
  version: number;
  id: string;
}

export class Variant {
  id: number;
  sku: string;
  key: string;
  prices: Price2[];
  images: any[];
  attributes: Attribute2[];
  assets: any[];
}

export class Price2 {
  id: string;
  value: Value4;
  tiers: Tier2[];
}

export class Value4 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class Tier2 {
  minimumQuantity: number;
  value: Value5;
}

export class Value5 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class Attribute2 {
  name: string;
  value: Value6;
}

export class Value6 {
  "en-US": string;
  "de-DE": string;
}

export class SearchKeywords {}

export class Staged {
  name: Name2;
  description: Description2;
  categories: Category2[];
  categoryOrderHints: CategoryOrderHints2;
  slug: Slug2;
  metaTitle: MetaTitle2;
  metaDescription: MetaDescription2;
  masterVariant: MasterVariant2;
  variants: Variant2[];
  searchKeywords: SearchKeywords2;
}

export class Name2 {
  "de-DE": string;
  "en-US": string;
}

export class Description2 {
  "de-DE": string;
  "en-US": string;
}

export class Category2 {
  typeId: string;
  id: string;
}

export class CategoryOrderHints2 {}

export class Slug2 {
  "de-DE": string;
  "en-US": string;
}

export class MetaTitle2 {
  "de-DE": string;
  "en-US": string;
}

export class MetaDescription2 {
  "de-DE": string;
  "en-US": string;
}

export class MasterVariant2 {
  id: number;
  sku: string;
  key: string;
  prices: Price3[];
  images: Image2[];
  attributes: Attribute3[];
  assets: any[];
  availability: Availability2;
}

export class Price3 {
  id: string;
  value: Value7;
  tiers: Tier3[];
}

export class Value7 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class Tier3 {
  minimumQuantity: number;
  value: Value8;
}

export class Value8 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class Image2 {
  url: string;
  label: string;
  dimensions: Dimensions2;
}

export class Dimensions2 {
  w: number;
  h: number;
}

export class Attribute3 {
  name: string;
  value: Value9;
}

export class Value9 {
  "en-US": string;
  "de-DE": string;
}

export class Availability2 {
  isOnStock: boolean;
  availableQuantity: number;
  version: number;
  id: string;
}

export class Variant2 {
  id: number;
  sku: string;
  key: string;
  prices: Price4[];
  images: any[];
  attributes: Attribute4[];
  assets: any[];
}

export class Price4 {
  id: string;
  value: Value10;
  tiers: Tier4[];
}

export class Value10 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class Tier4 {
  minimumQuantity: number;
  value: Value11;
}

export class Value11 {
  type: string;
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

export class Attribute4 {
  name: string;
  value: Value12;
}

export class Value12 {
  "en-US": string;
  "de-DE": string;
}

export class SearchKeywords2 {}

export class TaxCategory {
  typeId: string;
  id: string;
}
