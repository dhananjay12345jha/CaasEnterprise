import { baseServerlessConfiguration } from "../../../tools/serverless.base";
import functions from "./src/serverless/lambda/functions";
import { mergeDeepRight } from "ramda";

const serverlessConfiguration = mergeDeepRight(baseServerlessConfiguration, {
  custom: {
    newRelic: {
      accountId: "${self:custom.emc.provider.newrelic.accountId}",
      apiKey: "${self:custom.emc.provider.newrelic.apiKey}",
      nrRegion: "${self:custom.emc.provider.newrelic.nrRegion}",
      enableFunctionLogs: true, // send logs directly avoiding cloudwatch log subscription proxying via "newrelic-log-ingestion" lambda
      logEnabled: true,
    },
    "serverless-offline-aws-eventbridge": {
      port: "${env:SLS_OFFLINE_EVENTBRIDGE_PORT}",
      pubSubPort: "${env:SLS_OFFLINE_EVENTBRIDGE_PUB_SUB_PORT}",
      debug: true,
    },
  },
  provider: {
    environment: {
      SYNC_BUS_NAME: "${self:custom.emc.service.syncbus.name}",
      SYNC_BUS_DLQ_URL: "${self:custom.emc.service.syncbus.dlq.url}",
      SYNC_BUS_DLQ_REGION: "${self:provider.region}",
      SYNC_BUS_MAX_PUT_MESSAGES_ATTEMPTS: 3,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["SQS:SendMessage"],
            Resource: "${self:custom.emc.service.syncbus.dlq.arn}",
          },
        ],
      },
    },
    memorySize: 256,
    tracing: { lambda: true },
  },
  plugins: [
    ...(<string[]>baseServerlessConfiguration.plugins),
    "serverless-offline-aws-eventbridge", // Run EB locally
    "serverless-newrelic-lambda-layers", // NewRelic setup/layer plugin

    // Cannot use this until it is fixed
    // https://github.com/functionalone/serverless-iam-roles-per-function/pull/87
    // "serverless-iam-roles-per-function", // Use function specific roles
  ],
  functions,
});

module.exports = serverlessConfiguration;
