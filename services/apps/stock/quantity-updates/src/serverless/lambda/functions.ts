import { AWS } from "@serverless/typescript";

const functions: AWS["functions"] = {
  stockQuantityUpdateWebhook: {
    description: "Receives realtime stock updates.",
    handler: "src/functions/stock-quantity-update/index.default",
    events: [
      {
        httpApi: {
          method: "PUT",
          path: "/ccp/v1/stockquantityupdate",
        },
      },
    ],
    tags: {
      Name: "${self:service}-${self:custom.emc.delivery.prefix, self:custom.stage}-ccp",
    },
  },
};

export default functions;
