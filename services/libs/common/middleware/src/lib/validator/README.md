# Zod error middy validator middleware

This library service combines Zod and @middy/core middleware so that it would be easy to define request body / queryStringParameters / headers validation schema, attach such validator middleware to the existing handler using @middy hook/layering capabilities and benefit from automatic error response formation should the validation against the defined schema fail.

## Sample handler.ts

```typescript
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { validator, z } from "@wppcaas/serverless/middleware/middy/validator";

// lets define handler validation schema
const requestSchema = z.object({
  headers: z.object({
    "x-emc-ubid": z
      .string()
      .nonempty('A valid "x-emc-ubid" header value must be present.')
      .uuid(),
  }),
  body: z.object({
    username: z.string().nonempty(),
    password: z.string(),
  }),
});

// get infered `event` type for free
export type HandlerEvent = z.infer<typeof requestSchema>;

// assign the infered type as the `event` param type
const handler = async (event: HandlerEvent) => {
  try {
    // these will already guaranteed to exist at runtime
    const { "x-emc-ubid": brandId } = event.headers;
    const { username, password } = event.body;

    // do cool stuff here

    return APIResponses._200(someResponseObject);
  } catch (error) {
    return APIResponses._500(error as Error);
  }
};

export default middy(handler)
  // inject `httpJsonBodyParser` so it parses `event.body` from string to an object if we expect that to be a JSON request
  .use(httpJsonBodyParser())
  .use(validator(requestSchema));
```

# Middy validator hook

The `validator` hook file exports a few things:

1. `validator` - this is the middy plugin itself;
2. We also export everything from `zod` npm module, so it's easier to import anything you need from Zod without needing to add it to `package.json` as a direct dependency, including things such as `z` object, `ZodError` and other.

# How does it work

The Zod validator middleware will get called **before** the actual `handler` is executed. The middleware plugin will take in `event` object and will run Zod validator with the schema provided against it.

If the validation is successful, the `event` will be overwritten with what Zod schema itself allows to be exposed. Other stuff will be nuked.

If the validation fails, then the validator will call `APIResponses._400()` with the list of `ZodIssue` type objects that then will be processed and right away returned to the consumer. The rest of handler's logic and other middy plugins will not run.

## Caveats

Q: Validator middleware is added with schema defined, but I am failing to access event.{arbitraryItem} inside the hander

A: Make sure to either add the missing arbitrary item to the `event` validation schema ruleset OR provide a schema with `schema.passthrough()` so that unknown schema keys are passed through.

---

Q: I am failing to see another middy plugin `before` hook to kick in when validation failed.

A: If you have to have your hook running always (even when validation would fail), then you need to register that middy plugin to kick off in the middy execution order EARLIER.

# Middy execution order

Read more on how `@middy/core` plugin layering and execution order works [here](https://github.com/middyjs/middy#execution-order).
