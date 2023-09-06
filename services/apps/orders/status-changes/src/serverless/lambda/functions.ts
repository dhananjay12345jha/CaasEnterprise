import { AWS } from "@serverless/typescript";

const functions: AWS["functions"] = {
  orderStatusChangedWebhook: {
    description: "Receives order status change updates.",
    handler: "src/functions/order-status-changed/index.default",
    events: [
      {
        httpApi: {
          method: "PUT",
          path: "/ccp/v1/orderstatuschanged",
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-ccp",
    },
  },
};

export default functions;
