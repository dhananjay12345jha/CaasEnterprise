# crm async-events

This stack was generated with [Nx](https://nx.dev).

### Running unit tests

- Run `yarn nx test crm-order-confirmation` to execute the unit tests via [Jest](https://jestjs.io).

### Running component tests locally

Please create `.test.env` file and copy below content

```
APP_NAME=crm-order-confirmation
NEW_RELIC_APP_NAME="crm-order-confirmation"
NEW_RELIC_LICENSE_KEY="fake-license-key"
BRAZE_MOCK_URL=http://localhost:9005
```

- Run `yarn nx run crm-order-confirmation:serve-all --stage=local` to execute the components tests via [Jest](https://jestjs.io).
- If using VSCode, use `jest-runner` extension to Run or Debug individual test or feature.
- To run all tests run `yarn nx run crm-order-confirmation:_e2e --stage=local`

### Running app locally

- Install `aws-cli`
- Run `yarn nx serve crm-order-confirmation --stage ${stage}` to start an EB server on port 4010
- Then you can run this example request (please update file path to your own repo root directory)

```
aws events put-events --endpoint-url http://localhost:4010 --entries file:///home/melihozturk/src/enterprise-integration/services/apps/crm/order-confirmation/test/e2e/order-created-registered-user-success.json
```
