import type { AWS } from "@serverless/typescript";
import * as path from "path";

const buildConfigPath = path.join(__dirname, "build-config.js");

export const baseServerlessConfiguration: Partial<AWS> = {
  service: "${env:APP_NAME_SHORT, env:APP_NAME}",
  frameworkVersion: "3",
  useDotenv: true,
  package: {
    individually: true,
    excludeDevDependencies: true,
  },
  plugins: ["serverless-webpack", "serverless-offline"],
  custom: {
    emc: "${file(" + buildConfigPath + ")}",
    webpack: {
      webpackConfig: "./webpack.config.ts",
      includeModules: false,
      packager: "yarn",
      excludeFiles: "**/src/**/*.spec.ts",
    },
    product: "enterprise-integration",
    region:
      "${self:custom.emc.deploy.target.region, env:AWS_REGION, aws:region, sls:region}",
    accountId: "${self:custom.emc.deploy.target.accountId, aws:accountId}",
    stage: "${self:custom.emc.delivery.stage, env:DELIVERY_STAGE, sls:stage}",
    prefix: "${self:service}-${self:custom.stage}",
    basePath: '${env:GATEWAY_BASE_PATH, ""}',
  },
  provider: {
    name: "aws",
    stackName: "${self:custom.product}-${self:custom.stage}-${self:service}",
    // @ts-ignore
    stackTags: "${self:custom.emc.delivery.tags}",
    runtime: "nodejs16.x",
    deploymentMethod: "direct",
    // @ts-ignore
    memorySize: 128,
    stage: "${self:custom.stage}",
    // @ts-ignore
    region: "${self:custom.region}",
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      BRAND_CONFIG_GQL_ENDPOINT:
        "${self:custom.emc.service.brandconfig.endpoint}",
    },
    iam: {
      role: {
        managedPolicies: [
          "${self:custom.emc.service.brandconfig.policy.read.arn}",
        ],
      },
    },
    deploymentPrefix:
      "${self:service}/${self:custom.emc.delivery.prefix, self:custom.stage}",
    deploymentBucket: {
      name: "${self:custom.emc.deploy.target.bucket}",
      // @ts-ignore
      tags: "${self:custom.emc.delivery.tags}",
    },
    // @ts-ignore
    tags: "${self:custom.emc.delivery.tags}",
  },
};
