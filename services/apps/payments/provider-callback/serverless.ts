import { baseServerlessConfiguration } from "../../../tools/serverless.base";
import functions from "./src/serverless/functions";
import { mergeDeepRight } from "ramda";

const apiGatewayConfig =
  // each PR should create it's own gateway, and not use the shard one - this is for isolation, to prevent Gateway Resource clashes
  process.env.IS_PR && process.env.IS_PR === "true"
    ? {
        shouldStartNameWithService: false,
      }
    : {
        id: "${self:custom.emc.service.webhooks.apiId}",
      };

const pluginConfig = {
  "serverless-offline-aws-eventbridge": {
    port: "${self:custom.emc.serverless-offline-aws-eventbridge.port, null}",
  },
};

const serverlessConfiguration = mergeDeepRight(baseServerlessConfiguration, {
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
          {
            Effect: "Allow",
            Action: ["events:PutEvents"],
            Resource: "${self:custom.emc.service.transactbus.arn}",
          },
        ],
      },
    },
    environment: {
      EVENT_BUS_NAME: "${self:custom.emc.service.transactbus.name}",
      EVENT_BRIDGE_ENDPOINT:
        '${self:custom.emc.serverless-offline-aws-eventbridge.endpoint, ""}',
      MAX_PUT_MESSAGES_ATTEMPTS: 3,
      TRANSACT_BUS_NAME: "${self:custom.emc.service.transactbus.name}",
      TRANSACT_BUS_DLQ_URL: "${self:custom.emc.service.transactbus.dlq.url}",
      TRANSACT_BUS_DLQ_REGION: "${self:provider.region}",
      TRANSACT_BUS_MAX_PUT_MESSAGES_ATTEMPTS: 3,
    },
    httpApi: {
      shouldStartNameWithService: true,
      ...apiGatewayConfig,
    },
  },
  custom: {
    newRelic: {
      accountId: "${self:custom.emc.provider.newrelic.accountId}",
      apiKey: "${self:custom.emc.provider.newrelic.apiKey}",
      nrRegion: "${self:custom.emc.provider.newrelic.nrRegion}",
      enableFunctionLogs: true, // send logs directly avoiding cloudwatch log subscription proxying via "newrelic-log-ingestion" lambda
      logEnabled: true,
    },
    ...pluginConfig,
  },
  functions: functions,
  plugins: [
    ...(<string[]>baseServerlessConfiguration.plugins),
    // For mocking tests with event bridge
    "serverless-offline-aws-eventbridge",
    "serverless-newrelic-lambda-layers", // NewRelic setup/layer plugin
  ],
});

module.exports = serverlessConfiguration;
