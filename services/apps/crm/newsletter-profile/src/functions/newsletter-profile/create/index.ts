import middy from "@middy/core";
import {
  z,
  newsletterProfileSetMarketingPayloadPreference,
  newsletterProfileSetMarketingPreferenceEventSchema,
  eventValidator,
  newRelic,
} from "@ei-services/common/middleware";
import { NewsletterProfile } from "./create-newsletter-profile";
import { Handler } from "aws-lambda";

export type HandlerEvent = z.infer<
  typeof newsletterProfileSetMarketingPreferenceEventSchema
>;

export type NewsletterSignupMessage = z.infer<
  typeof newsletterProfileSetMarketingPayloadPreference
>;

const handler: Handler = async (event: HandlerEvent) => {
  //event not fully logged until a log framework that redacts PII is in place (not tracked in a ticket yet. )
  console.log("Event received: ", event.id);
  console.log(JSON.stringify(event));

  try {
    const messageDate = event.time;
    const { payload, metadata } = event.detail;

    const newsletterSignupMessage: NewsletterSignupMessage = payload;
    const brandId = metadata["x-emc-ubid"];

    const newsletterProfile = new NewsletterProfile();
    await newsletterProfile.setMarketingPreference(
      brandId,
      newsletterSignupMessage,
      messageDate
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default middy(handler)
  .use(newRelic())
  .use(eventValidator(newsletterProfileSetMarketingPreferenceEventSchema));
