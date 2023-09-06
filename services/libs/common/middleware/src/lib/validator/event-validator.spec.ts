import { z } from "./index";
import { eventValidator } from "./event-validator";

describe("validator middy middleware", () => {
  const makeSchema = () => {
    return z.object({
      headers: z.object({
        "arbitrary-header": z
          .string()
          .nonempty()
          .transform(() => "hello world"),
      }),
      body: z.string(),
      queryStringParameters: z.object({
        limit: z.number().int().min(10),
        offset: z.number().int().min(0),
      }),
    });
  };

  describe("onError()", () => {
    it("does nothing if no error is attached to request object", () => {
      const response = eventValidator(z.object({ a: z.string() })).onError({
        event: {},
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      } as any);

      expect(response).toBeFalsy();
    });

    it("throw exception when 422 error is thrown by httpJsonBodyParser() plugin", () => {
      const error = new Error(
        "Could not parse JSON when content-type application/json provided"
      );
      Object.assign(error, { statusCode: 422 });

      expect(() =>
        eventValidator(z.object({ a: z.string() })).onError({
          event: {},
          error,
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any)
      ).toThrowError(
        "Content type defined as JSON but an invalid JSON was provided"
      );
    });
  });

  describe("before()", () => {
    beforeEach(() => jest.resetAllMocks());

    it("parses request event object for the Zod schema provided", async () => {
      const event = {
        headers: {
          "arbitrary-header": "some value",
          "Content-type": "application/json",
        },
        body: "123",
        queryStringParameters: {
          limit: 15,
          offset: 0,
        },
      };

      const schema = makeSchema();
      schema.parseAsync = jest.fn().mockResolvedValue(true);

      await eventValidator(schema).before({ event } as any);
      expect(schema.parseAsync).toHaveBeenCalledTimes(1);
      expect(schema.parseAsync).toHaveBeenCalledWith(event);
    });

    it("parses and overrides request event object for the Zod schema provided", async () => {
      const event = {
        headers: {
          "arbitrary-header": "some value", // this should mutate
          "Content-type": "application/json", // and this one gone
        },
        body: "123",
        queryStringParameters: {
          limit: 15,
          offset: 0,
        },
      };

      const request = { event };
      const schema = makeSchema();

      await eventValidator(schema).before(request as any);
      expect(request.event).toEqual({
        headers: {
          "arbitrary-header": "hello world",
        },
        body: "123",
        queryStringParameters: {
          limit: 15,
          offset: 0,
        },
      });
    });

    it("should throw and return with error if event does not comply to schema", async () => {
      const event = {
        headers: {
          "Content-type": "application/json",
        },
        body: { json: "borne" },
        queryStringParameters: {
          limit: false,
          offset: 0,
        },
      };

      const request = { event };
      const schema = makeSchema();

      try {
        await eventValidator(schema).before(request as any);
      } catch (error) {
        expect(error).toMatchObject([
          {
            code: "invalid_type",
            expected: "string",
            received: "undefined",
            path: ["headers", "arbitrary-header"],
            message: "Required",
          },
          {
            code: "invalid_type",
            expected: "string",
            received: "object",
            path: ["body"],
            message: "Expected string, received object",
          },
          {
            code: "invalid_type",
            expected: "number",
            received: "boolean",
            path: ["queryStringParameters", "limit"],
            message: "Expected number, received boolean",
          },
        ]);
      }
    });
  });
});
