import { baseServerlessConfiguration } from "../../../tools/serverless.base";
import functions from "./src/serverless/lambda/functions";
import resources from "./src/serverless/resources";
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
    },
    insightRuleName: "${self:custom.stage}-${self:service}-insight-rule",
  },
  provider: {
    environment: {
      TRANSACT_BUS_NAME: "${self:custom.emc.service.transactbus.name}",
      TRANSACT_BUS_DLQ_URL: "${self:custom.emc.service.transactbus.dlq.url}",
      TRANSACT_BUS_DLQ_REGION: "${self:provider.region}",
      COMMERCETOOLS_INGRESS_BUS_DLQ_URL:
        "${self:custom.emc.service.commercetoolsingressbus.dlq.url}",
      COMMERCETOOLS_INGRESS_BUS_DLQ_REGION: "${self:provider.region}",
      TRANSACT_BUS_MAX_PUT_MESSAGES_ATTEMPTS: 3,
    },
    memorySize: 256,
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["SQS:SendMessage"],
            Resource: "${self:custom.emc.service.transactbus.dlq.arn}",
          },
          {
            Effect: "Allow",
            Action: ["SQS:SendMessage"],
            Resource:
              "${self:custom.emc.service.commercetoolsingressbus.dlq.arn}",
          },
          {
            Effect: "Allow",
            Action: ["events:PutEvents"],
            Resource: "${self:custom.emc.service.transactbus.arn}",
          },
        ],
      },
    },
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
  resources,
});

module.exports = serverlessConfiguration;
