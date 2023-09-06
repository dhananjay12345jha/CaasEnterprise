import axios, { AxiosResponse } from "axios";
import { world } from "../support/utils/custom.world";
import * as console from "console";

export class Payment {
  payments = "/adyen-notifications/v1/payments";

  private axiosInstance() {
    return axios.create({
      baseURL: `${world.config.globals.shardConfig.webhook_baseURL}`,
      headers: { "Content-Type": "application/json" },
      responseType: "json",
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200; // Resolve any status code >= 200 , assertion to be checked in the test step
      },
    });
  }

  public async paymentAuthorizationFromAdyen(
    body: string,
    header?: string,
    ver?: string
  ) {
    let requestConfig;
    let token = `Bearer ${world.config.globals.shardConfig.webHookApiKey}`;
    if (header == "no") {
    } else if (header == "invalid") {
      requestConfig = {
        headers: { Authorization: "rty45rtyryt" },
      };
    } else {
      requestConfig = {
        headers: { Authorization: token },
      };
    }
    const response: AxiosResponse = await this.axiosInstance().post(
      this.payments,
      body,
      requestConfig
    );
    return response;
  }
}
