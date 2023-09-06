import { z } from "@ei-services/common/middleware";
import { validatePsk } from "@ei-services/services";

export const omsAuthorizationHeaderSchema = z.object({
  authorization: z
    .string({
      required_error: "Authorization header must be present.",
    })
    .transform((input) => input.replace("Bearer ", ""))
    .refine(validatePsk, {
      message: "Invalid PSK provided.",
    }),
});
