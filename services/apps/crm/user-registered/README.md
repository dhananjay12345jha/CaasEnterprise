# crm user-registered

This stack was generated with [Nx](https://nx.dev).

### Building app

- Run `yarn workspace '@enterprise-integration/services' run build crm-user-registered --stage ${stage}`

### Deploying to Sandbox

- Run `yarn workspace '@enterprise-integration/services' run build crm-user-registered --stage sandbox`
- Run `SANDBOX_STAGE=sandbox yarn workspace '@enterprise-integration/services' run deploy crm-user-registered --stage sandbox`

### Running unit tests

- Run `yarn workspace '@enterprise-integration/services' run test crm-user-registered` to execute the unit tests via [Jest](https://jestjs.io).

### Running component tests

From the `services` directory, do the following:

- In your first terminal window, run `yarn nx serve-all crm-user-registered --stage local` to run the app and the mocks
- Then in another terminal window, run `yarn nx e2e:feature crm-user-registered` to run the component test

### Running app locally

- Install `aws-cli`
- From the repo root, run: `yarn workspace '@enterprise-integration/services' run serve crm-user-registered`
- Run `cd services && source apps/orders/async-events/.env` to read in the environment variables
- Then you can run this example request from the app level:

```
aws events put-events --entries file://test/e2e/create-ct-order/example/convert-cart-to-order-event.json --endpoint-url http://localhost:$SLS_OFFLINE_EVENTBRIDGE_PORT
```
