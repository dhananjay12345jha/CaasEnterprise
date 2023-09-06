import { AWS } from "@serverless/typescript";

type PatchedFunctionsDeclaration = AWS["functions"] &
  Record<
    string,
    {
      [k: string]: unknown;
      iamRoleStatementsName?: string;
      iamRoleStatements?: Array<{
        Effect: string;
        Action: Array<string>;
        Resource: string;
      }>;
    }
  >;

const functions: PatchedFunctionsDeclaration = {
  updateQuantityCT: {
    description: "It updates stock of an inventory entry in Commerce Tools",
    handler: "src/functions/stock-update-quantity-ct/index.default",
    onError: "${self:custom.emc.service.syncbus.dlq.arn}",
    maximumRetryAttempts: 1,
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.syncbus.arn}",
          pattern: {
            "detail-type": [
              {
                prefix: "stock.quantity.updated",
              },
            ],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-update-quantity-ct",
    },
  },
};

export default functions;
