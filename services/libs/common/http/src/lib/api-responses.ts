import { HttpStatusCode } from "./http-status-codes";
import { ZodIssue } from "zod";

export interface APIGatewayResponse {
  statusCode: number;
  headers?: { [key: string]: string };
  body?: string;
}

export const preAddHeaders = ({
  statusCode,
  headers,
  body,
}: {
  statusCode: number;
  headers?: { [key: string]: string };
  body?: string;
}) =>
  ({
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    statusCode,
    body,
  } as APIGatewayResponse);

const buildBadRequestErrorResponse = (error: Error | ZodIssue[]) => {
  const errorType = "ValidationError";
  let details: unknown[];

  if (Array.isArray(error)) {
    details = error.map((issue) => {
      return {
        errorType,
        message: issue.message,
        metadata: {
          code: issue.code,
          path: issue.path,
        },
      };
    });
  } else {
    details = [
      {
        errorType,
        message: error.message,
      },
    ];
  }

  return { error: { requestParameters: {}, requestHeaders: {}, details } };
};

const Ok = (data: unknown = {}, headers?: { [key: string]: string }) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.Ok,
    headers,
    body: JSON.stringify(data),
  });
};

const Created = (data: unknown = {}, headers?: { [key: string]: string }) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.Created,
    headers,
    body: JSON.stringify(data),
  });
};

const Accepted = (data: unknown = {}, headers?: { [key: string]: string }) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.Accepted,
    headers,
    body: JSON.stringify(data),
  });
};

const NoContent = (data: unknown = {}, headers?: { [key: string]: string }) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.NoContent,
    headers,
    body: JSON.stringify(data),
  });
};

const BadRequest = (
  error: Error | ZodIssue[],
  headers?: { [key: string]: string }
) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.BadRequest,
    headers,
    body: JSON.stringify(buildBadRequestErrorResponse(error)),
  });
};

const Unauthorized = (error: Error, headers?: { [key: string]: string }) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.Unauthorized,
    headers,
    body: error.message,
  });
};

const Forbidden = (error: Error, headers?: { [key: string]: string }) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.Forbidden,
    headers,
    body: error.message,
  });
};

const NotFound = (error: Error, headers?: { [key: string]: string }) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.NotFound,
    headers,
  });
};

const MethodNotAllowed = (
  error: Error,
  headers?: { [key: string]: string }
) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.MethodNotAllowed,
    headers,
    body: error.message,
  });
};

const Conflict = (error: Error, headers?: { [key: string]: string }) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.Conflict,
    headers,
    body: JSON.stringify({ error }),
  });
};

const InternalServerError = (headers?: { [key: string]: string }) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.InternalServerError,
    headers,
    body: "",
  });
};

const BadGateway = (error: Error, headers?: { [key: string]: string }) => {
  return preAddHeaders({
    statusCode: HttpStatusCode.BadGateway,
    headers,
  });
};

const Error = (statusCode: number, error: Error) => {
  if (statusCode) {
    switch (statusCode) {
      case 400:
        return BadRequest(error);
      case 401:
        return Unauthorized(error);
      case 403:
        return Forbidden(error);
      case 404:
        return NotFound(error);
      case 409:
        return Conflict(error);
      case 500:
        return InternalServerError();
      case 502:
        return BadGateway(error);
    }
  }
  return InternalServerError();
};

export const APIResponses = {
  Ok,
  Created,
  Accepted,
  NoContent,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  MethodNotAllowed,
  Conflict,
  InternalServerError,
  BadGateway,
  Error,
};
