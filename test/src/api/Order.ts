import axios, { AxiosResponse } from "axios";
import { world } from "../support/utils/custom.world";
import * as console from "console";

export class Order {
  orderUpdate = "/ccp/v1/orderstatuschanged";
  token =
    "Bearer ad8Hmu5zFd1VFZ6r1KNkmDO8Z/upJsPxSVJorbJ351JrBGjgJrh5DY+O/g2yBa6f";

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

  public async orderStatusUpdateFromOMS(
    body: string,
    header?: string,
    ver?: string
  ) {
    let requestConfig;
    if (header == "no") {
    } else if (header == "invalid") {
      requestConfig = {
        headers: { Authorization: "rty45rtyryt" },
      };
    } else {
      requestConfig = {
        headers: { Authorization: this.token },
      };
    }
    const response: AxiosResponse = await this.axiosInstance().put(
      this.orderUpdate,
      body,
      requestConfig
    );
    console.log(JSON.stringify(response.data));
    return response;
  }
}
