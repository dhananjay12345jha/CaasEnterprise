import { z } from "@ei-services/common/middleware";
import { buildEventSchema } from "../common";

export const passwordChangedPayload = z.object({
  customerId: z.string(),
});

export const passwordChangedEventSchema = buildEventSchema(
  "forgotpassword.reset.completed",
  passwordChangedPayload
);
