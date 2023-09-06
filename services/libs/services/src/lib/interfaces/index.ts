export interface BrandConfigErrorStatus {
  status: number;
  statusText: string;
}
export interface BrandConfigError {
  response: BrandConfigErrorStatus;
}

export enum CommerceServiceErrorTypes {
  BadRequest = "BadRequest",
  ValidationError = "ValidationError",
  NotFound = "NotFound",
  InternalServerError = "InternalServerError",
}

export interface CommerceServiceErrorDetails {
  errorType: CommerceServiceErrorTypes | string;
  message: string;
  metadata?: { [key: string]: unknown };
}

export interface CommerceServiceErrorInterface {
  requestParameters: object;
  requestHeaders: object;
  details: Array<CommerceServiceErrorDetails>;
}

export interface CTExternalOrderResource {
  type: "Order";
  [key: string]: unknown;
}

export interface CTExternalOrderCreatedEvent {
  projectKey: string;
  id: string;
  type: "OrderCreated";
  order: CTExternalOrderResource;
}
