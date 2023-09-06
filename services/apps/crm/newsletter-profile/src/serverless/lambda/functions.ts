import { AWS } from "@serverless/typescript";

const functions: AWS["functions"] = {
  createNewsletterProfile: {
    description: "Triggers create newsletter profile sequence",
    handler: "src/functions/newsletter-profile/create/index.default",
    onError: "${self:custom.emc.service.transactbus.dlq.arn}",
    maximumRetryAttempts: 1,
    events: [
      {
        eventBridge: {
          eventBus: "${self:custom.emc.service.transactbus.arn}",
          pattern: {
            "detail-type": ["newsletter.signup.request"],
          },
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-createNewsletterProfile",
    },
  },
};

export default functions;
