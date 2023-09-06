import { world } from "../support/utils/custom.world";
import axios, { AxiosResponse } from "axios";
import { getPrivateConfig } from "../support/utils/helpers";

export class BrazeHelper {
  userTrack = "/users/export/ids";

  brandId: string;
  crmEndpoint: string;
  crmAPIKey: string;

  constructor(brandId, crmEndpoint, crmAPIKey) {
    this.brandId = brandId;
    this.crmEndpoint = crmEndpoint;
    this.crmAPIKey = crmAPIKey;
  }

  private axiosInstance() {
    return axios.create({
      baseURL: `${this.crmEndpoint}`,
      headers: { "Content-Type": "application/json" },
      responseType: "json",
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200; // Resolve any status code >= 200 , assertion to be checked in the test step
      },
    });
  }

  public async getUserProfile(request: string) {
    let requestConfig = {
      headers: {
        Authorization: `Bearer ${this.crmAPIKey}`,
      },
    };
    // console.log(request);
    const response: AxiosResponse = await this.axiosInstance().post(
      this.userTrack,
      request,
      requestConfig
    );
    world.brazeResponse = response;
    return response;
  }
}
