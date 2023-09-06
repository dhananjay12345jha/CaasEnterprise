import {
  BrazeClient,
  CanvasTriggerSendRequest,
  CanvasTriggerSendResponse,
} from "@ei-services/braze-service";
import {
  BRAZE_CONFIG_KEYS,
  getBrandStorefrontUrl,
} from "@ei-services/brand-config";
import { CRMBaseClass } from "@ei-services/services";
import { PasswordResetMessage } from "./index";

type UrlData = {
  baseUrl: string;
  code: string;
  email: string;
  expiry: number;
};

export class PasswordReset extends CRMBaseClass {
  private async getBrandDomain(brandId: string) {
    return await getBrandStorefrontUrl(brandId);
  }

  private buildPasswordResetUrl(urlData: UrlData): string {
    const url = new URL(urlData.baseUrl);
    url.pathname = "/reset-password/reset";
    url.searchParams.append("email", urlData.email);
    url.searchParams.append("exp", urlData.expiry.toString());
    url.searchParams.append("code", urlData.code);

    return url.toString();
  }

  private buildPasswordResetMessage(
    brandId: string,
    canvasId: string,
    brandDomain: string,
    requestResetData: PasswordResetMessage
  ): CanvasTriggerSendRequest {
    const resetUrl = this.buildPasswordResetUrl({
      baseUrl: brandDomain,
      code: requestResetData.newCode,
      email: requestResetData.email,
      expiry: requestResetData.expiry,
    });
    console.debug("Password reset URL generated: ", resetUrl);

    const expiryInMs = requestResetData.expiry * 1000;
    return {
      canvas_id: canvasId,
      recipients: [
        {
          external_user_id: this.buildExternalId(
            brandId,
            requestResetData.customerId
          ),
          canvas_entry_properties: {
            url: {
              pwd_reset_url: resetUrl,
              expiry: new Date(expiryInMs).toISOString(),
            },
          },
          send_to_existing_only: true,
        },
      ],
    };
  }

  public async trigger(
    brandId: string,
    requestResetData: PasswordResetMessage
  ): Promise<CanvasTriggerSendResponse> {
    const brazeConfig = await this.getBrazeServiceConfig(brandId, {
      apiKey: BRAZE_CONFIG_KEYS.API_KEY,
      baseURL: BRAZE_CONFIG_KEYS.API_BASE_URL,
      passwordResetCanvasId: BRAZE_CONFIG_KEYS.PASSWORD_RESET_CANVAS_ID,
    });

    const brazeClient = new BrazeClient({
      apiKey: brazeConfig.apiKey,
      baseURL: brazeConfig.baseURL,
      shouldRetry: false,
    });
    const brandDomain = await this.getBrandDomain(brandId);
    console.log("Brand Domain retrieved: ", brandDomain);

    const message = this.buildPasswordResetMessage(
      brandId,
      brazeConfig.passwordResetCanvasId,
      brandDomain,
      requestResetData
    );

    console.debug(
      "Triggering CRM canvas trigger endpoint with password reset request:",
      JSON.stringify(message)
    );
    const response = await brazeClient.canvasTriggerSend(message);
    console.debug(
      "Received response from CRM canvas trigger endpoint:",
      JSON.stringify(response)
    );
    return response;
  }
}
