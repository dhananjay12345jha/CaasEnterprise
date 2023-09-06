export interface TrackUserRequest {
  attributes: UserAttributes[];
  purchases: UserPurchase[];
  events: UserEvent[];
}

export interface RegisterUserRequest {
  attributes: UserAttributes[];
}

export interface UserEvent {
  external_id?: string;
  user_alias?: UserAlias;
  name: string;
  time: string;
}

export interface UserOrderPlacedEvent extends UserEvent {
  properties: UserOrderPlacedEventProperties;
}

export interface UserOrderPlacedEventProperties {
  products: UserEventProduct[];
  order: UserEventOrder;
  promo?: UserEventPromo[];
  billing: UserEventBilling;
  shipping: UserEventShipping;
}

export interface UserEventProduct {
  image: string;
  sku: string;
  name: string;
  quantity: number;
  product_attributes: UserEventProductAttribute[];
  purchase_price: string;
  total_purchase_price: string;
  page_url: string;
}

export interface UserEventProductAttribute {
  label: string;
  value: string;
}

export interface UserEventOrder {
  order_number: string;
  order_date: string;
  order_url: string;
  order_total_products: number;
  gift_message?: string;
}

export interface UserEventPromo {
  name: string;
  discount_amount: string;
}

export interface UserEventBilling {
  tax_total_amount: string;
  total_discount_amount?: string;
  total_price: string;
  basket_total: string;
  shipping_price: string;
  currency: string;
  payment_method?: string;
  payment_method_detail?: string;
  address_same_as_shipping: boolean;
  title: string;
  company_name: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  county: string;
  city: string;
  postcode: string;
  country: string;
}

export interface UserEventShipping {
  delivery_method: string;
  delivery_date?: string;
  title: string;
  company_name: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  county: string;
  city: string;
  postcode: string;
  country: string;
}

export interface UserAttributes {
  external_id?: string | null;
  user_alias?: UserAlias | null;
  email?: string;
  language_code?: string;
  brand_name?: string;
  country_code?: string;
  time_zone?: string;
  account_status?: string | null;
  account_type?: string;
  _update_existing_only?: boolean;
  profile_creation_date?: string;
  email_subscribe?: string | null;
  first_name?: string;
  last_name?: string;
}

export interface UserPurchase {
  external_id?: string;
  user_alias?: UserAlias;
  app_id: string;
  product_id: string;
  currency: string;
  price: number;
  quantity: number;
  time: string;
}

export interface TrackUserResponse {
  message: string;
  errors: string[];
  attributes_processed: number;
  events_processed: number;
  purchases_processed: number;
}

export interface UserAlias {
  alias_name: string;
  alias_label: string;
}

export interface CanvasTriggerSendRequest {
  canvas_id: string;
  recipients?: CanvasRecipients[];
}

export interface CanvasProperties {
  [key: string]: unknown;
}

export interface CanvasRecipients {
  user_alias?: UserAlias;
  external_user_id?: string;
  canvas_entry_properties: CanvasProperties;
  trigger_properties?: CanvasProperties;
  attributes?: UserAttributes;
  send_to_existing_only: boolean;
}

export interface CanvasTriggerSendResponse {
  dispatch_id: string;
}

export interface RegisteredUser {
  first_name: string;
  last_name: string;
  email: string;
}

export interface OrderDispatchedOrderDetails {
  order_number: string;
}

export interface OrderDispatchedBilling {
  title: string;
  first_name: string;
  last_name: string;
}

export interface OrderDispatchedShipping {
  delivery_method: string;
  delivery_date?: string; // marked as optional until we implement WCAAS-4238
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  county: string;
  city: string;
  postcode: string;
}

export interface OrderDispatchedCanvasProperties extends CanvasProperties {
  order: OrderDispatchedOrderDetails;
  billing: OrderDispatchedBilling;
  shipping: OrderDispatchedShipping;
}

export interface OrderDispatchedRecipient extends CanvasRecipients {
  canvas_entry_properties: OrderDispatchedCanvasProperties;
}

export interface OrderDispatchedSendRequest extends CanvasTriggerSendRequest {
  recipients: OrderDispatchedRecipient[];
}
