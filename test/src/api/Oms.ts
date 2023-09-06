import axios, { AxiosResponse } from "axios";
import { world } from "../support/utils/custom.world";
import * as console from "console";
import { expect } from "chai";

export class Oms {
  order = "/v1/Orders/{BrandId}-{SaleReference}";
  token = "v1/AccessToken";
  accessToken;

  private axiosInstance() {
    return axios.create({
      baseURL: `${world.config.globals.oms.baseURL}`,
      headers: { "Content-Type": "application/json" },
      responseType: "json",
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200; // Resolve any status code >= 200 , assertion to be checked in the test step
      },
    });
  }

  public async getOrderInfoFromOMS(
    omsBrandId: string,
    orderId: string,
    ver?: string
  ) {
    const token = await this.getAccessToken();

    let requestConfig = {
      headers: { Authorization: " Bearer " + token },
    };
    // const config = `${world.brandId}_oms_brandId`;
    // const omsBrandId = `${world.config[`${world.brandId}`].oms_brandId}`;
    // console.log(omsBrandId);
    const response: AxiosResponse = await this.axiosInstance().get(
      this.order
        .replace("{BrandId}", omsBrandId)
        .replace("{SaleReference}", orderId),
      requestConfig
    );
    // console.log(response);
    // expect(response.status).eq(200);
    return response;
  }

  public async getAccessToken() {
    let requestConfig;
    const body = {
      clientID: `${world.config.globals.oms.clientId}`,
      clientSecret: `${world.config.globals.oms.clientSecret}`,
      grantType: `${world.config.globals.oms.grantType}`,
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.token,
      body,
      requestConfig
    );
    return response.data.accessToken;
  }
}
