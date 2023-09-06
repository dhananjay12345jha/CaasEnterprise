import { baseServerlessConfiguration } from "../../../tools/serverless.base";
import functions from "./src/serverless/lambda/functions";
import { mergeDeepRight } from "ramda";

const serverlessConfiguration = mergeDeepRight(baseServerlessConfiguration, {
  provider: {
    memorySize: 256,
    environment: {
      BRAND_CONFIG_GQL_ENDPOINT:
        "${self:custom.emc.service.brandconfig.endpoint}",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["SQS:SendMessage"],
            Resource: "${self:custom.emc.service.transactbus.dlq.arn}",
          },
        ],
      },
    },
  },
  plugins: [
    ...(<string[]>baseServerlessConfiguration.plugins),
    "serverless-offline-aws-eventbridge",
    "serverless-newrelic-lambda-layers", // NewRelic setup/layer plugin
  ],
  custom: {
    "serverless-offline": {
      printOutput: true,
    },
    "serverless-offline-aws-eventbridge": {
      port: "${env:SLS_OFFLINE_EVENTBRIDGE_PORT}",
      pubSubPort: "${env:SLS_OFFLINE_EVENTBRIDGE_PUB_SUB_PORT}",
      debug: true,
    },
    newRelic: {
      accountId: "${self:custom.emc.provider.newrelic.accountId}",
      apiKey: "${self:custom.emc.provider.newrelic.apiKey}",
      nrRegion: "${self:custom.emc.provider.newrelic.nrRegion}",
      enableFunctionLogs: true, // send logs directly avoiding cloudwatch log subscription proxying via "newrelic-log-ingestion" lambda
      logEnabled: true,
    },
  },
  functions,
});

module.exports = serverlessConfiguration;
