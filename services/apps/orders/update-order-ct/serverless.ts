import { baseServerlessConfiguration } from "../../../tools/serverless.base";
import functions from "./src/serverless/lambda/functions";
import { mergeDeepRight } from "ramda";

const serverlessConfiguration = mergeDeepRight(baseServerlessConfiguration, {
  custom: {
    "serverless-offline-aws-eventbridge": {
      port: "${env:SLS_OFFLINE_EVENTBRIDGE_PORT}",
      pubSubPort: "${env:SLS_OFFLINE_EVENTBRIDGE_PUB_SUB_PORT}",
    },
    newRelic: {
      accountId: "${self:custom.emc.provider.newrelic.accountId}",
      apiKey: "${self:custom.emc.provider.newrelic.apiKey}",
      nrRegion: "${self:custom.emc.provider.newrelic.nrRegion}",
      enableFunctionLogs: true, // send logs directly avoiding cloudwatch log subscription proxying via "newrelic-log-ingestion" lambda
      logEnabled: true,
    },
  },
  provider: {
    memorySize: 256,
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
    "serverless-offline-aws-eventbridge", // Run EB locally,
    "serverless-newrelic-lambda-layers", // NewRelic setup/layer plugin
  ],
  functions,
});

module.exports = serverlessConfiguration;
