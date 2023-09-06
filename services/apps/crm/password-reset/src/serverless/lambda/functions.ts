import { AWS } from "@serverless/typescript";

const functions: AWS["functions"] = {
  triggerForgotPasswordReset: {
    description: "Triggers forgot password reset email",
    handler: "src/functions/password/reset/index.default",
    onError: "${self:custom.emc.service.transactbus.dlq.arn}",
    maximumRetryAttempts: 1,
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.transactbus.arn}",
          pattern: {
            "detail-type": ["forgotpassword.reset.request"],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-triggerForgotPasswordReset",
    },
  },
  triggerPasswordChanged: {
    description: "Triggers password changed email.",
    handler: "src/functions/password/changed/index.default",
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.transactbus.arn}",
          pattern: {
            "detail-type": ["forgotpassword.reset.completed"],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-triggerPasswordChanged",
    },
  },
};

export default functions;
