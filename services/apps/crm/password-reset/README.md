# orders async-events

This stack was generated with [Nx](https://nx.dev).

### Building app

- Run `yarn workspace '@enterprise-integration/services' run build crm-password-reset --stage ${stage}`

### Deploying to Sandbox

- Run `yarn workspace '@enterprise-integration/services' run build crm-password-reset --stage sandbox`
- Run `SANDBOX_STAGE=sandbox yarn workspace '@enterprise-integration/services' run deploy crm-password-reset --stage sandbox`

### Running unit tests

- Run `yarn workspace '@enterprise-integration/services' run test crm-password-reset` to execute the unit tests via [Jest](https://jestjs.io).

### Running app locally

- Install `aws-cli`
- From the repo root, run: `yarn workspace '@enterprise-integration/services' run serve crm-password-reset`
- Run `cd services && source apps/orders/async-events/.env` to read in the environment variables
- Then you can run this example request from the app level:

```
aws events put-events --entries file://test/e2e/example/password-reset-event.json --endpoint-url http://localhost:$SLS_OFFLINE_EVENTBRIDGE_PORT
```
