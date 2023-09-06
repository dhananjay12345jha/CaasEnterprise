import { AWS } from "@serverless/typescript";

const functions: AWS["functions"] = {
  triggerOrderConfirmationEmail: {
    description: "Triggers send order confirmation notification sequence",
    handler: "src/functions/order/confirm/index.default",
    onError: "${self:custom.emc.service.transactbus.dlq.arn}",
    maximumRetryAttempts: 1,
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.transactbus.arn}",
          pattern: {
            "detail-type": ["order.created"],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-triggerOrderConfirmationNotification",
    },
  },
};

export default functions;
