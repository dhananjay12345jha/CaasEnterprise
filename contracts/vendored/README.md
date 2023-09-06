# Vendored Contracts

This defines contracts provided by external (to the programme or this repo) that cannot be obtained in other ways (e.g. an http request to a well-known endpoint), or are early access.

Contracts should be named by service they are for (e.g. commercetools or brand-config-service. If different cersions are required, e.g. a dev version or v1.1.3, this should be represented in a folder structure, e.g.

```bash
./vendored/brand-config-service/dev/schema.graphql
./vendored/commercetools/v1/openapi.spec.yml
```
