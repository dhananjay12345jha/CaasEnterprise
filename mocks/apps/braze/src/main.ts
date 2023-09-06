import "source-map-support/register";
import path from "path";
import OpenAPIBackend, { Context, Request } from "openapi-backend";
import express from "express";
import morgan from "morgan";
import NodeCache from "node-cache";
import { readFileSync } from "fs";
import { findKey } from "lodash";
import minimist from "minimist";
import yaml from "js-yaml";

const ctMocksCache = new NodeCache();
const argv = minimist(process.argv.slice(2));
const useInvocations = argv.invocations ?? false;

import { Request as ExpressReq, Response as ExpressRes } from "express";
import { ValidationResult } from "openapi-backend/validation";
import { ResponseObject } from "openapi3-ts/src/model/OpenApi";

import { InvocationRecorder } from "@mocks/invocation-recorder";

const app = express();
app.use(express.json());

const invocationRecorder = new InvocationRecorder();

// define api
const api = new OpenAPIBackend({
  definition: path.join(__dirname, "..", "braze/openapi.yaml"),
  handlers: {
    validationFail: async (c, req: ExpressReq, res: ExpressRes) => {
      console.error("Validation Error: ", JSON.stringify(c.validation.errors)),
        res.status(400).json({
          statusCode: 400,
          message: "ValidationError",
          errors: c.validation.errors,
        });
    },
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
  operationId: string,
  responseId: string,
  responseCode = "200"
) => {
  const opToFeature = {
    user: ["trackUser"],
  };
  const featureDir = findKey(opToFeature, (op) => op.includes(operationId));

  try {
    if (useInvocations) {
      let invocationCount: number = ctMocksCache.get(
        `invocations:${operationId}`
      );

      if (!invocationCount) {
        invocationCount = 1;
        ctMocksCache.set(`invocations:${operationId}`, invocationCount);
      }

      console.log(ctMocksCache.get(`invocations:${operationId}`));

      const file = yaml.load(
        readFileSync(
          `./services/braze/src/invocations/${featureDir}/${operationId}-${invocationCount}.yml`
        ).toString()
      );

      if (!file) {
        throw new Error("NotFound");
      }

      invocationCount += 1;
      ctMocksCache.set(`invocations:${operationId}`, invocationCount);

      return file;
    }

    const examples: ResponseObject = context.operation.responses[
      responseCode
    ] as ResponseObject;

    return examples.content["application/json"].examples[responseId];
  } catch (err) {
    throw new Error(err.message);
  }
};

api.register({
  trackUser: (c, req: ExpressReq, res: ExpressRes) => {
    const authHeader = c.request.headers.authorization;
    const responseId = (authHeader as string).split(" ")[1];

    const responseCode = 201;
    const result = getResult(
      c,
      "trackUser",
      responseId,
      responseCode.toString()
    );

    if (!result) {
      return res.status(404).json();
    }

    return {
      _includesMetadata: true,
      statusCode: responseCode,
      data: result,
    };
  },

  canvasTriggerSend: (c, req: ExpressReq, res: ExpressRes) => {
    const authHeader = c.request.headers.authorization;
    const responseId = (authHeader as string).split(" ")[1];

    const responseCode = 200;
    const result = getResult(
      c,
      "canvasTriggerSend",
      responseId,
      responseCode.toString()
    );

    if (!result) {
      return res.status(404).json();
    }

    return {
      _includesMetadata: true,
      statusCode: responseCode,
      data: result,
    };
  },

  postResponseHandler: (c, req, res) => {
    if (req.path.includes("/braze/invocations/reset")) {
      return res.status(200);
    }

    const valid: ValidationResult = c.api.validateResponse(
      c.response,
      c.operation
    );

    if (c.response._includesMetadata) {
      res.statusCode = c.response.statusCode;
    }

    invocationRecorder.recordInvocation(
      c,
      req,
      res,
      c.response._includesMetadata
    );

    if (valid.errors) {
      // response validation failed
      return res.status(502).json({ status: 502, err: valid.errors });
    }

    if (c.response._includesMetadata) {
      return res.status(c.response.statusCode).json(c.response.data.value);
    }

    return res.status(200).json(c.response.value);
  },
});
api.init();

// logging
app.use(morgan("combined"));
app.post("/braze/invocations/reset/:operationId", (req, res) => {
  try {
    const operationId: string = req.params.operationId;

    ctMocksCache.set(`invocations:${operationId}`, 0);

    return res.status(200).json({
      operationId,
      invocationCount: ctMocksCache.get(
        `invocations:${req.params.operationId}`
      ),
    });
  } catch (e) {
    console.error(e);
    throw new Error(e.message);
  }
});
app.get("/braze/invocations/history/latest/:invocationCount?", (req, res) => {
  try {
    const invocationCountParameters: string = req.params
      .invocationCount as string;
    const invocationCount: number = parseInt(invocationCountParameters);

    return res.status(200).json({
      invocations: invocationRecorder.getLatestInvocations(invocationCount),
    });
  } catch (e) {
    console.error(e);
    throw new Error(e.message);
  }
});
// use as express middleware
app.use((req, res) => api.handleRequest(req as Request, req, res));

// start server
app.listen(9005, () => console.info("api listening at http://localhost:9005"));
