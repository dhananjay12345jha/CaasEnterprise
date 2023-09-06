import { AWS } from "@serverless/typescript";

const functions: AWS["functions"] = {
  triggerOrderConfirmationEmail: {
    description: "Triggers send order dispatch notification sequence",
    handler: "src/functions/order/dispatch/index.default",
    onError: "${self:custom.emc.service.transactbus.dlq.arn}",
    maximumRetryAttempts: 1,
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.transactbus.arn}",
          pattern: {
            "detail-type": ["order.shipment.changed"],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-triggerOrderDispatchedNotification",
    },
  },
};

export default functions;
