import { AWS } from "@serverless/typescript";

const functions: AWS["functions"] = {
  triggerUserRegisteredEvent: {
    description: "Triggers a user.registered event",
    handler: "src/functions/register-user/create/index.default",
    onError: "${self:custom.emc.service.transactbus.dlq.arn}",
    maximumRetryAttempts: 1,
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.transactbus.arn}",
          pattern: {
            "detail-type": ["user.registered"],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-userRegistered",
    },
  },
};

export default functions;
