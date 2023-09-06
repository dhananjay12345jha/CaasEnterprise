export default {
  adyen: {
    description: "",
    handler: "src/functions/adyen-webhook/index.default",
    events: [
      {
        httpApi: {
          method: "POST",
          path: "${self:custom.basePath}/adyen-notifications/v1/payments",
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-adyen",
    },
  },
};
