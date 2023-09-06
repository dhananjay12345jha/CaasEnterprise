# stock update-quantity-ct

This stack was generated with [Nx](https://nx.dev).

### Building app

- Run `yarn workspace '@enterprise-integration/services' run build stock-update-quantity-ct --stage ${stage}`

### Deploying to Sandbox

- Run `yarn workspace '@enterprise-integration/services' run build stock-update-quantity-ct --stage sandbox`
- Run `SANDBOX_STAGE=sandbox yarn workspace '@enterprise-integration/services' run deploy stock-update-quantity-ct --stage sandbox`

### Running unit tests

- Run `yarn workspace '@enterprise-integration/services' run test stock-update-quantity-ct` to execute the unit tests via [Jest](https://jestjs.io).

### Running component tests

From the `services` directory, do the following:

- In your first terminal window, run `yarn nx serve-all stock-update-quantity-ct --stage local` to run the app and the mocks
- Then in another terminal window, run `yarn nx e2e:feature stock-update-quantity-ct` to run the component test

### Running app locally

- Install `aws-cli`
- From the repo root, run: `yarn workspace '@enterprise-integration/services' run serve stock-update-quantity-ct`
- Run `cd services && source apps/stock/update-quantity-ct/.env` to read in the environment variables
- Then you can run this example request from the app level:

```
aws events put-events --entries file://test/e2e/update-quantity-ct/example/convert-cart-to-order-event.json --endpoint-url http://localhost:$SLS_OFFLINE_EVENTBRIDGE_PORT
```
