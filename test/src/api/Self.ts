import axios, { AxiosResponse } from "axios";
import { world } from "../support/utils/custom.world";

export class Self {
  self = "self";

  private axiosInstance() {
    return axios.create({
      baseURL: `${world.config.globals.shardConfig.auth_baseURL}`,
      headers: { "Content-Type": "application/json" },
      responseType: "json",
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200; // Resolve any status code >= 200 , assertion to be checked in the test step
      },
    });
  }

  public async getSelfDetails(ver: string) {
    const requestConfig = {
      headers: {
        Authorization: world.token,
      },
    };
    const response: AxiosResponse = await this.axiosInstance().get(
      this.self,
      requestConfig
    );
    return response;
  }

  public async getSelfDetailsWithOutHeader(ver: string, header: string) {
    let requestConfig = {};
    if (header == "brandId") {
      requestConfig = {
        headers: { Authorization: world.token },
      };
    } else if (header == "Authorization") {
      requestConfig = {
        headers: {},
      };
    }
    const response: AxiosResponse = await this.axiosInstance().get(
      this.self,
      requestConfig
    );

    return response;
  }
}
