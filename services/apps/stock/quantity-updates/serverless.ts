import { baseServerlessConfiguration } from "../../../tools/serverless.base";
import functions from "./src/serverless/lambda/functions";
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
    memorySize: 256,
    httpApi: {
      shouldStartNameWithService: true,
      ...apiGatewayConfig,
    },
    environment: {
      EVENT_BUS_NAME: "${self:custom.emc.service.syncbus.name}",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["events:PutEvents"],
            Resource: "${self:custom.emc.service.syncbus.arn}",
          },
        ],
      },
    },
  },
  plugins: [
    ...(<string[]>baseServerlessConfiguration.plugins),
    "serverless-offline-aws-eventbridge", // Run EB locally
    "serverless-newrelic-lambda-layers", // NewRelic setup/layer plugin
  ],
  functions,
});

module.exports = serverlessConfiguration;
