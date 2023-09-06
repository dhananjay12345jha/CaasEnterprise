module.exports = {
  brandAliasMap: {
    "oms#3402": "7a733796-ae2c-4032-89f7-24d4c4179612",
  },
  brandMetaData: [
    {
      brandId: "746120b5-702d-44a1-9c7e-e8c46b3a6e17",
      etld: "some.domain.com",
      tenantId: "some-tenant-id",
    },
  ],
  externalProviders: {
    GLOBAL: {
      brandId: "GLOBAL",
      externalProviders: [
        {
          type: "OMS",
          brandId: "GLOBAL",
          providerConfigs: [
            {
              key: "oms-emc-webhook-api-key",
              value: "super$ecret",
            },
          ],
        },
      ],
    },
    brandA: {
      brandId: "746120b5-702d-44a1-9c7e-e8c46b3a6e17",
      externalProviders: [
        {
          brandId: "746120b5-702d-44a1-9c7e-e8c46b3a6e17",
          type: "COMMERCEAPI",
          providerConfigs: [
            {
              key: "ct-project-key",
              value: "some-project-key",
            },
            {
              key: "ct-region",
              value: "some-region",
            },
            {
              key: "ct-client-id",
              value: "abc",
            },
            {
              key: "ct-client-secret",
              value: "xyz",
            },
            {
              key: "ct-auth-url",
              value: "http://localhost:9000/commercetools",
            },
            {
              key: "ct-api-url",
              value: "http://localhost:9000/commercetools",
            },
          ],
        },
        {
          brandId: "746120b5-702d-44a1-9c7e-e8c46b3a6e17",
          type: "BRAZE",
          providerConfigs: [
            {
              key: "api-key",
              value: "success",
            },
            {
              key: "instance-url",
              value: "http://localhost:9005",
            },
            {
              key: "campaign-id",
              value: "12345",
            },
            {
              key: "app-group-web",
              value: "f3764d75-4219-404b-96c9-3cb507fcb10d",
            },
            {
              key: "default-country-code",
              value: "GB",
            },
            {
              key: "password-reset-canvas-id",
              value: "some-canvas-id",
            },
          ],
        },
      ],
    },
    brandB: {
      brandId: "746120b5-702d-44a1-9c7e-e8c46b3a6e18",
      externalProviders: [
        {
          brandId: "746120b5-702d-44a1-9c7e-e8c46b3a6e18",
          type: "BRAZE",
          providerConfigs: [
            {
              key: "api-key",
              value: "failed",
            },
            {
              key: "instance-url",
              value: "http://localhost:9005",
            },
            {
              key: "campaign-id",
              value: "12345",
            },
            {
              key: "app-group-web",
              value: "f3764d75-4219-404b-96c9-3cb507fcb10d",
            },
            {
              key: "default-country-code",
              value: "GB",
            },
          ],
        },
      ],
    },
  },
};
