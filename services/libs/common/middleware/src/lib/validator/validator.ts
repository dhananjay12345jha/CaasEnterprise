import { MiddlewareObj } from "@middy/core";
import { ZodError, ZodSchema } from "zod";
import { APIResponses } from "@ei-services/common/http";

type HttpError = Error & {
  status: number;
  statusCode: number;
};

export const validator = <T>(
  schema: ZodSchema<T>
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
): Required<Pick<MiddlewareObj<any, any>, "before" | "onError">> => ({
  before: async (request) => {
    try {
      request.event = await schema.parseAsync(request.event);
    } catch (error) {
      console.error(error);
      return APIResponses.BadRequest((error as ZodError).errors);
    }
  },

  onError: (request) => {
    if (!request.error) return;

    if ((request.error as HttpError).statusCode === 422) {
      return APIResponses.BadRequest(
        new Error(
          "Content type defined as JSON but an invalid JSON was provided"
        )
      );
    }
  },
});
