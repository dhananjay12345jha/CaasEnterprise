# orders async-events

This stack was generated with [Nx](https://nx.dev).

### Building app

- Run `yarn workspace '@enterprise-integration/services' run build orders-async-events --stage ${stage}`

### Deploying to Sandbox

- Run `yarn workspace '@enterprise-integration/services' run build orders-async-events --stage sandbox`
- Run `SANDBOX_STAGE=sandbox yarn workspace '@enterprise-integration/services' run deploy orders-async-events --stage sandbox`

### Running unit tests

- Run `yarn workspace '@enterprise-integration/services' run test orders-async-events` to execute the unit tests via [Jest](https://jestjs.io).

### Running component tests

From the `services` directory, do the following:

- In your first terminal window, run `yarn nx serve-all orders-async-events --stage local` to run the app and the mocks
- Then in another terminal window, run `yarn nx e2e:feature orders-async-events` to run the component test

### Running app locally

- Install `aws-cli`
- From the repo root, run: `yarn workspace '@enterprise-integration/services' run serve orders-async-events`
- Run `cd services && source apps/orders/async-events/.env` to read in the environment variables
- Then you can run this example request from the app level:

```
aws events put-events --entries file://test/e2e/create-ct-order/example/convert-cart-to-order-event.json --endpoint-url http://localhost:$SLS_OFFLINE_EVENTBRIDGE_PORT
```

---

### TESTING SETUP STEPS ⚡️

**_Pre-requisites:_**

- create cart
- add line items
- add shipping
- generate **checkoutSessionId** (can be randomly generated)

---

##### Steps

**1** | create payment on cart with transaction details as follows:

```
{
    ...
    interactionId: ${checkoutSessionId}
    status: "Initial"
}
```

**2** | generate **sha256** hash of cart line items

- stringify line items
- digest as hex

```
const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(cart.lineItems))
    .digest("hex");
```

**3** | populate notificationItem object with values (using cart hash + checkoutSessionId just created)

```
{
    ...,
    additionalData: {
        ...additionalData,
        'metadata.cartDigest': ${cartHash},
        'metadata.brandId': ${brandId},
        'metadata.cartId': ${cartId}
    },
    checkoutSessionId: ${checkoutSessionId}
}
```

TODO: Update this step once we have e2e set up and can automate above steps (at the moment don't really have a way to even call functions apart from manually on sandbox)

Then either use payments/async-provider/adyen or use following format to query in eventbridge:
