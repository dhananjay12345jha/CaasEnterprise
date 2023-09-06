import { AWS } from "@serverless/typescript";

const functions: AWS["functions"] = {
  "update-order-ct": {
    description: "Updates an order in Commerce Tools",
    handler: "./src/functions/update-order-ct/index.default",
    onError: "${self:custom.emc.service.transactbus.dlq.arn}",
    maximumRetryAttempts: 1,
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.transactbus.arn}",
          pattern: {
            "detail-type": ["order.status.changed"],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-updateOrderStatus",
    },
  },
};

export default functions;
