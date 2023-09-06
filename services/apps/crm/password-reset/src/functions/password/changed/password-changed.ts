import {
  BrazeClient,
  CanvasTriggerSendRequest,
  CanvasTriggerSendResponse,
} from "@ei-services/braze-service";
import { BRAZE_CONFIG_KEYS } from "@ei-services/brand-config";
import { CRMBaseClass } from "@ei-services/services";
import { PasswordChangedMessage } from "./index";

export class PasswordChanged extends CRMBaseClass {
  public async trigger(
    brandId: string,
    passwordChangedMessage: PasswordChangedMessage
  ): Promise<CanvasTriggerSendResponse> {
    const brazeConfig = await this.getBrazeServiceConfig(brandId, {
      apiKey: BRAZE_CONFIG_KEYS.API_KEY,
      baseURL: BRAZE_CONFIG_KEYS.API_BASE_URL,
      passwordChangedCanvasId: BRAZE_CONFIG_KEYS.PASSWORD_UPDATED_CANVAS_ID,
    });

    const brazeClient = new BrazeClient({
      apiKey: brazeConfig.apiKey,
      baseURL: brazeConfig.baseURL,
      shouldRetry: false,
    });

    const message = this.buildPasswordResetMessage(
      brandId,
      brazeConfig.passwordChangedCanvasId,
      passwordChangedMessage
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

  private buildPasswordResetMessage(
    brandId: string,
    canvasId: string,
    requestResetData: PasswordChangedMessage
  ): CanvasTriggerSendRequest {
    return {
      canvas_id: canvasId,
      recipients: [
        {
          external_user_id: this.buildExternalId(
            brandId,
            requestResetData.customerId
          ),
          canvas_entry_properties: {
            action: {
              updated_at: new Date().toISOString(),
            },
          },
          send_to_existing_only: true,
        },
      ],
    };
  }
}
