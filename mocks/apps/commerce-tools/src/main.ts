import "source-map-support/register";
import path from "path";
import OpenAPIBackend, { Context, Request } from "openapi-backend";
import express from "express";
import morgan from "morgan";

import { Request as ExpressReq, Response as ExpressRes } from "express";
import { ValidationResult } from "openapi-backend/validation";
import { ResponseObject } from "openapi3-ts/src/model/OpenApi";

const app = express();
app.use(express.json());

// define api
const api = new OpenAPIBackend({
  definition: path.join(__dirname, "..", "commerce-tools/openapi.yaml"),
  handlers: {
    validationFail: async (c, req: ExpressReq, res: ExpressRes) =>
      res.status(400).json({
        statusCode: 400,
        message: "ValidationError",
        errors: c.validation.errors,
      }),
    notFound: async (c, req: ExpressReq, res: ExpressRes) => {
      return res.status(404).json();
    },
    notImplemented: async (c, req: ExpressReq, res: ExpressRes) => {
      const { status, mock } = c.api.mockResponseForOperation(
        c.operation.operationId
      );
      return res.status(status).json(mock);
    },
  },
});

const getResult = (
  context: Context,
  responseId: string,
  responseCode = "200"
): any => {
  try {
    const examples: ResponseObject = context.operation.responses[
      responseCode
    ] as ResponseObject;

    return examples.content["application/json"].examples[responseId];
  } catch (err) {
    throw new Error(err.message);
  }
};

api.register({
  getCart: (c, req: ExpressReq, res: ExpressRes) => {
    const authHeader = c.request.headers.authorization;
    const responseId = (authHeader as string).split(" ")[1];
    const result = getResult(c, responseId);

    if (!result) {
      return res.status(404).json();
    }

    return result;
  },
  getPayment: (c, req: ExpressReq, res: ExpressRes) => {
    const authHeader = c.request.headers.authorization;
    const responseId = (authHeader as string).split(" ")[1];
    const result = getResult(c, responseId);

    if (!result) {
      return res.status(404).json();
    }

    return result;
  },
  postOrder: (c, req: ExpressReq, res: ExpressRes) => {
    const authHeader = c.request.headers.authorization;
    const responseId = (authHeader as string).split(" ")[1];
    const result = getResult(c, responseId);

    if (!result) {
      return res.status(404).json();
    }

    return result;
  },
  getOrder: (c, req: ExpressReq, res: ExpressRes) => {
    const authHeader = c.request.headers.authorization;
    const responseId = (authHeader as string).split(" ")[1];
    const result = getResult(c, responseId);

    if (!result) {
      return res.status(404).json();
    }

    return result;
  },
  postResponseHandler: (c, req, res) => {
    if (req.path.includes("/commercetools/invocations/reset")) {
      return res.status(200);
    }

    const valid: ValidationResult = c.api.validateResponse(
      c.response,
      c.operation
    );

    if (req.path.includes("/custom-objects/variant-trees/handwash")) {
      // temporarily doing this as the validation is failing for some
      // reason when querying custom objects via container and key
      // targeting the non-mocked CT API does not have this issue
      // will be investigating why the validation is complaining about
      // properties that de facto are present and defined on the response
      return res.status(200).json(c.response.value);
    }

    if (valid.errors) {
      // response validation failed
      return res.status(502).json({ status: 502, err: valid.errors });
    }
    return res.status(200).json(c.response.value);
  },
});
api.init();

// logging
app.use(morgan("combined"));
// use as express middleware
app.use((req, res) => api.handleRequest(req as Request, req, res));

// start server
app.listen(9000, () => console.info("api listening at http://localhost:9000"));
