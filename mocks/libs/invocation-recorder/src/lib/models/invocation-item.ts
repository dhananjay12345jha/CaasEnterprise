export interface InvocationItem {
  request: InvocationRequest;
  response: InvocationResponse;
}

export interface InvocationRequest {
  params: unknown;
  query: unknown;
  body: unknown;
  headers: unknown;
  method: unknown;
  path: unknown;
}

export interface InvocationResponse {
  statusCode: unknown;
  response: unknown;
}

export interface ExpressRequest {
  params: unknown;
  query: unknown;
  body: unknown;
  headers: unknown;
  method: unknown;
  path: unknown;
}

export interface ExpressResponse {
  statusCode: unknown;
}
