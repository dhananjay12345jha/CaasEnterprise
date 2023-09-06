import { z } from "@ei-services/common/middleware";
import { buildEventSchema } from "../common";

export const passwordResetPayload = z.object({
  email: z.string().email(),
  newCode: z.string(),
  expiry: z.number(),
  customerId: z.string(),
});

export const passwordResetEventSchema = buildEventSchema(
  "forgotpassword.reset.request",
  passwordResetPayload
);
