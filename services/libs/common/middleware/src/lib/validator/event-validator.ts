import { MiddlewareObj } from "@middy/core";
import { ZodError, ZodSchema } from "zod";

export const eventValidator = <T>(
  schema: ZodSchema<T>
): Required<Pick<MiddlewareObj<any, any>, "before" | "onError">> => ({
  before: async (request) => {
    try {
      request.event = await schema.parseAsync(request.event);
    } catch (error) {
      console.error("Validation error:", error);
      throw (error as ZodError).errors;
    }
  },

  onError: (request) => {
    if (!request.error) return;

    if (request.error["statusCode"] === 422) {
      throw new Error(
        "Content type defined as JSON but an invalid JSON was provided"
      );
    }
  },
});
