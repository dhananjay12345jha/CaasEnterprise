# Schema Packages

The schema packages are carrying event/message schemas and their corresponding typescript interfaces or types.

## Table of Contents

- [Core functionalities](#core-functionalities)
- [Version a schema](#version-a-schema)
- [Install a schema](#install-a-schema)
- [Available packages](#available-packages)
- [Troubleshooting](#troubleshooting)

## Core functionalities

Use npm packages we are able to able to

- **Version the schemas** using semantic versioning
- We are able to **automatically generate typescript interfaces** which can be used to validate or even produce a particular event.

## Version a schema

The version of the schema is the same as the version of the package. So to change the version of the schema you need to

1. Go to the root folder of the schema package.
2. Make your changes in the schema.
3. Build the typescript interfaces with `yarn compile:type`.
4. Decide what kind of change you just made. (patch, minor, major).
5. Version the package: `yarn version patch/minor/major`.
6. Go to the root folder of the repository and reinstall the package by doing `yarn install`.

## Install a schema

Currently, we have to install the packages locally like:

```json
{
  "@everymile-schemas/order-created": "file:../contracts/private/jsonSchema/order/created"
}
```

When though `@everymile-schemas` package repository becomes available for us in CodeArtifact we can pull and install those packages as we would any other 3rd part package. Like:

```json
{
  "@everymile-schemas/order-created": "v0.1.0"
}
```

## Troubleshooting

Until we can migrate the package into AWS CodeArtifact unfortunately we might experience issues with our pipeline executing the `yarn install --immutable --immutable-cache` command.
The solution is quite easy... we have to clean/rebuild the cache.
The steps are:

```shell
// Commit everything
git reset --hard origin/WCAAS-XXXX-feature-branch
git clean -fdx # <- important to get rid of untracked files locally
yarn install --immutable --immutable-cache # <- usually when the error happens
yarn cache clean --all
yarn
yarn install --immutable --immutable-cache # <- should run now without errors
```

## Available packages

- [**Order Created**](./contracts/private/jsonSchema/order/created/README.md)
- [**Order Status Changed**](./contracts/private/jsonSchema/order/status-changed/README.md)
- [**Payment Received**](./contracts/private/jsonSchema/payment/received/README.md)
- [**Stock Quantity Updated**](./contracts/private/jsonSchema/stock/quantity-updated/README.md)
