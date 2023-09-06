import { z } from "../../validator";
import { buildEventSchema } from "../common";

export const userRegisteredPayloadPreference = z.object({
  customerId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

export const userRegisteredEventSchema = buildEventSchema(
  "user.registered",
  userRegisteredPayloadPreference
);
