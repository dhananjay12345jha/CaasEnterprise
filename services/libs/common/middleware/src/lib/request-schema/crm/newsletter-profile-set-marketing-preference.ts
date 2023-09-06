import { z } from "../../validator";
import { buildEventSchema } from "../common";
import isValidTimezone from "./helpers/isValidTimezone";

export const newsletterProfileSetMarketingPayloadPreference = z.object({
  timezone: z.string().refine(isValidTimezone).optional(),
  email: z.string(),
  marketingPreference: z.enum(["opt_in", "opt_out"]),
});

export const newsletterProfileSetMarketingPreferenceEventSchema =
  buildEventSchema(
    "newsletter.signup.request",
    newsletterProfileSetMarketingPayloadPreference
  );
