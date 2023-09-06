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
  createCtOrderFromCart: {
    description: "Converts a Commerce Tools cart into an order",
    handler: "src/functions/create-ct-order/index.default",
    onError: "${self:custom.emc.service.transactbus.dlq.arn}",
    maximumRetryAttempts: 1,
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.transactbus.arn}",
          pattern: {
            "detail-type": ["payment.order.auth.accepted"],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-createCtOrderFromCart",
    },
  },
  createOMSOrder: {
    description: "It creates an order in Order Management Service",
    handler: "src/functions/create-oms-order/index.default",
    onError: "${self:custom.emc.service.transactbus.dlq.arn}",
    maximumRetryAttempts: 1,
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.transactbus.arn}",
          pattern: {
            "detail-type": [
              {
                prefix: "order.created",
              },
            ],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-create-oms-order",
    },
  },
  publishIntOrderCreatedEvent: {
    description: "It publishes an internal order.created event",
    handler: "src/functions/publish-int-order-created-evnt/index.default",
    onError: "${self:custom.emc.service.commercetoolsingressbus.dlq.arn}",
    maximumRetryAttempts: 1,
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.commercetoolsingressbus.arn}",
          pattern: {
            "detail-type": [
              {
                prefix: "OrderCreated",
              },
            ],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-publish-int-order-created-evnt",
    },
  },
};

export default functions;
