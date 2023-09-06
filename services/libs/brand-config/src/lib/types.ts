export enum EXTERNAL_PROVIDER_TYPES {
  COMMERCE_TOOLS = "COMMERCEAPI",
  CMS = "CMS",
  OMS = "OMS",
  PAYMENT = "PAYMENT",
  PUBLIC = "PUBLIC",
  BRAZE = "BRAZE",
}

export enum CT_CONFIG_KEYS {
  PROJECT_KEY = "ct-project-key",
  API_URL = "ct-api-url",
  AUTH_URL = "ct-auth-url",
  REGION = "ct-region",
  CLIENT_ID = "ct-client-id",
  CLIENT_SECRET = "ct-client-secret",
  CURRENCY = "ct-currency",
  CART_DEFAULT_LOCALE = "ct-cart-default-locale",
}

export enum ADYEN_CONFIG_KEYS {
  MERCHANT_ACCOUNT_ID = "adyen-merchant-account-id",
  API_BASE_URL = "adyen-payment-api-base-url",
  API_KEY = "adyen-payment-api-key",
  ALLOWED_PAYMENT_METHODS = "adyen-payment-allowed-payment-methods",
}

export enum OMS_CONFIG_KEYS {
  EMC_WEBHOOK_API_KEY = "oms-emc-webhook-api-key",
  EMC_API_BASE = "oms-emc-api-base",
  EMC_CLIENT_ID = "oms-emc-client-id",
  EMC_CLIENT_SECRET = "oms-emc-client-secret",
  OMS_BRAND_ID = "oms-emc-brand-id",
}

export enum PAYMENT_CONFIG_KEYS {
  ADYEN_HMAC_KEY = "payment-adyen-hmac-key",
}

export enum BRAZE_CONFIG_KEYS {
  API_KEY = "api-key",
  API_BASE_URL = "instance-url",
  API_APP_GROUP_WEB = "app-group-web",
  DEFAULT_COUNTRY_CODE = "default-country-code",
  PASSWORD_RESET_CANVAS_ID = "password-reset-email-canvas-id",
  PASSWORD_UPDATED_CANVAS_ID = "password-updated-email-canvas-id",
  ORDER_DISPATCH_CANVAS_ID = "order-dispatch-email-canvas-id",
}

export enum SPECIAL_BRAND_IDS {
  GLOBAL = "GLOBAL",
}

export enum BRAND_FOR_ALIAS_TYPES {
  OMS = "oms",
}

export type CommerceToolsProviderConfig = Record<CT_CONFIG_KEYS, string>;

export type AdyenProviderConfig = Record<ADYEN_CONFIG_KEYS, string>;

export type OmsProviderConfig = Record<OMS_CONFIG_KEYS, string>;

export type BrazeProviderConfig = Record<BRAZE_CONFIG_KEYS, string>;

export type ConfigMapItem = {
  key: string;
  value: string;
};

export type ConfigMapRow = {
  brandId: string;
  items?: ConfigMapItem[];
};

export enum BRAND_META {
  BRAND_NAME = "brandName",
  LANGUAGE_CODE = "languageCode",
}
