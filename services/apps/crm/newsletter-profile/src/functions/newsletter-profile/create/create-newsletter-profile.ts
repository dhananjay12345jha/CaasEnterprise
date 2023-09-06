import {
  BrazeClient,
  TrackUserRequest,
  UserAttributes,
} from "@ei-services/braze-service";
import { BrandMeta, CRMBaseClass } from "@ei-services/services";
import { NewsletterSignupMessage } from "./index";
import { BRAZE_CONFIG_KEYS } from "@ei-services/brand-config";

export class NewsletterProfile extends CRMBaseClass {
  async setMarketingPreference(
    brandId: string,
    newsletterSignupMessage: NewsletterSignupMessage,
    messageDate: string
  ): Promise<void> {
    const brazeServiceConfig = await this.getBrazeServiceConfig(brandId, {
      apiKey: BRAZE_CONFIG_KEYS.API_KEY,
      baseURL: BRAZE_CONFIG_KEYS.API_BASE_URL,
      defaultCountryCode: BRAZE_CONFIG_KEYS.DEFAULT_COUNTRY_CODE,
    });

    const brazeClient = new BrazeClient({
      apiKey: brazeServiceConfig.apiKey,
      baseURL: brazeServiceConfig.baseURL,
      shouldRetry: true,
    });
    const brandMeta: BrandMeta = await this.getBrandMeta(
      brandId,
      brazeServiceConfig
    );

    console.log(
      "Finding brandName and languageCode",
      JSON.stringify({
        brandName: brandMeta.brandName,
        languageCode: brandMeta.languageCode,
      })
    );

    console.info(
      "Generating set newsletter profile marketing preference request message"
    );

    const setNewsletterProfileMarketingPreferenceRequest =
      this.buildCreateNewsletterProfileRequest(
        brandMeta,
        newsletterSignupMessage,
        messageDate
      );

    console.debug(
      "Triggering CRM user track endpoint with newsletter request:",
      JSON.stringify(setNewsletterProfileMarketingPreferenceRequest)
    );
    const trackUserResponse = await brazeClient.trackUser(
      setNewsletterProfileMarketingPreferenceRequest
    );
    console.debug(
      "Received response from CRM:",
      JSON.stringify(trackUserResponse)
    );

    if (trackUserResponse.errors) {
      throw new Error(
        `Error while tracking user. ErrorDetails=${JSON.stringify(
          trackUserResponse.errors
        )}`
      );
    }
  }

  /**
   * @internal public for testing
   */
  buildCreateNewsletterProfileRequest(
    brandMeta: BrandMeta,
    newsletterSignupMessage: NewsletterSignupMessage,
    messageDate: string
  ): TrackUserRequest {
    const attributes = this.buildUserAttributesObject(
      brandMeta,
      newsletterSignupMessage,
      messageDate
    );

    return {
      attributes: [attributes],
      purchases: [],
      events: [],
    };
  }

  private buildUserAttributesObject(
    brandMeta: BrandMeta,
    newsletterSignupMessage: NewsletterSignupMessage,
    messageDate: string
  ): UserAttributes {
    const userAlias = this.buildUserAlias(
      brandMeta.brandId,
      newsletterSignupMessage.email
    );

    const brazeMarketingPreferenceStatus = this.getBrazeSubscriptionStatus(
      newsletterSignupMessage.marketingPreference
    );

    return {
      user_alias: userAlias,
      email: newsletterSignupMessage.email,
      language_code: brandMeta.languageCode,
      brand_name: brandMeta.brandName,
      country_code: brandMeta.countryCode,
      time_zone: newsletterSignupMessage.timezone,
      email_subscribe: brazeMarketingPreferenceStatus,
      account_type: "newsletter",
      profile_creation_date: messageDate,
      _update_existing_only: false,
    };
  }
}
