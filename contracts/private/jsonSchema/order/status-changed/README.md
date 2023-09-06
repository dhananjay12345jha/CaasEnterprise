# Schema packages

## Exports:

- The json schema to validate the event
- One or more typescript interfaces which can be used to work with the event (produce or process it)

## Example usage

### In package.json

```json
{
  "dependencies": {
    "@everymile-schemas/order-status-changed": "file:../contracts/private/jsonSchema/order/status-changed"
  }
}
```

### Import

```typescript
import schema, {
  Index as IEventInterface,
} from "@everymile-schemas/order-status-changed";
```

## Compile source code

```shell
cd <root of the package>
yarn run compile:src
```

## Compile types and interfaces for the schema

```shell
cd <root of the package>
yarn run compile:type
```

## Bump versions

### Patch

```shell
cd <root of the package>
yarn verson patch
```

### Minor

```shell
cd <root of the package>
yarn verson minor
```

### Major

```shell
cd <root of the package>
yarn verson major
```

## After bumping version

The package needs to be reinstalled in the app or lib where it's been used.

```shell
cd <root of the app or lib>
yarn install
```
