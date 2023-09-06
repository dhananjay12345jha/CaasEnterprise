import {
  BrazeClient,
  BrazeApiClientConfig,
  RegisteredUser,
  RegisterUserRequest,
} from "@ei-services/braze-service";
import { BrandMeta, CRMBaseClass } from "@ei-services/services";
import { BRAZE_CONFIG_KEYS } from "@ei-services/brand-config";

export class RegisterUser extends CRMBaseClass {
  async trackRegisterUserEvent(
    brandId: string,
    customerId: string,
    payload: RegisteredUser
  ): Promise<void> {
    const brazeServiceConfig = await this.getBrazeServiceConfig(brandId, {
      apiKey: BRAZE_CONFIG_KEYS.API_KEY,
      baseURL: BRAZE_CONFIG_KEYS.API_BASE_URL,
      defaultCountryCode: BRAZE_CONFIG_KEYS.DEFAULT_COUNTRY_CODE,
    });

    const brazeApiClientConfig: BrazeApiClientConfig = {
      apiKey: brazeServiceConfig.apiKey,
      baseURL: brazeServiceConfig.baseURL,
      shouldRetry: true,
    };

    const brazeClient = new BrazeClient(brazeApiClientConfig);
    const brandMeta: BrandMeta = await this.getBrandMeta(
      brandId,
      brazeServiceConfig
    );
    const registerUserRequest = this.buildRegisterUserRequest(
      brandMeta,
      customerId,
      payload
    );

    console.debug(
      "Triggering CRM user track endpoint with user registered request:",
      JSON.stringify(registerUserRequest)
    );
    const registerUserResponse = await brazeClient.registerUser(
      registerUserRequest
    );
    console.debug(
      "Received response from CRM canvas trigger endpoint:",
      JSON.stringify(registerUserResponse)
    );

    if (registerUserResponse.errors) {
      console.error(
        "Errors while registering user",
        JSON.stringify(registerUserResponse.errors)
      );

      throw new Error("Error while registering user");
    }
  }

  /**
   * @internal public for testing
   */
  buildRegisterUserRequest(
    brandMeta: BrandMeta,
    customerId: string,
    payload: RegisteredUser
  ): RegisterUserRequest {
    return {
      attributes: [
        {
          external_id: this.buildExternalId(brandMeta.brandId, customerId),
          email: payload.email,
          language_code: brandMeta.languageCode,
          brand_name: brandMeta.brandName,
          country_code: brandMeta.countryCode,
          time_zone: "", // This field will be set as part of WCAAS-2336
          account_status: "active",
          _update_existing_only: false,
          account_type: "full",
          profile_creation_date: new Date().toISOString(),
          email_subscribe: "subscribed", // need to come from auth
          first_name: payload.first_name,
          last_name: payload.last_name,
        },
      ],
    };
  }
}
