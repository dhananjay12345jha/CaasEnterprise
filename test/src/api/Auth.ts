import { world } from "../support/utils/custom.world";
import axios, { AxiosResponse } from "axios";
import * as qs from "qs";

export class Auth {
  signup = "/v1/signup";
  signin = "/v1/signin";
  refresh = "/v1/refresh";
  signout = "/v1/signout";
  introspect =
    "/v1/token/introspect?resource-server-id=<resourceId>&brand-id=<brandId>";
  anonymousSignin = "/v1/signin/anonymous";

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

  public async signupAUserWithGuestToken(
    request: string,
    _optionalParams: any
  ) {
    let token = _optionalParams.token;

    let requestConfig: any = {};

    if (token.includes("Bearer"))
      requestConfig = {
        headers: {
          Authorization: `${token.trim()}`,
        },
      };

    const response: AxiosResponse = await this.axiosInstance().post(
      this.signup,
      request,
      requestConfig
    );
    world.logMessage = {
      request: JSON.parse(request),
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async signInAUserWithGuestToken(
    request: string,
    _optionalParams: any
  ) {
    let token = _optionalParams.token;

    const requestConfig: any = {
      headers: {
        Authorization: `${token.trim()}`,
      },
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.signin,
      request,
      requestConfig
    );
    world.logMessage = {
      request: JSON.parse(request),
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async signInRegisteredUser(ver: string, request: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestConfig: any = {
      headers: {},
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.signin,
      request,
      requestConfig
    );

    world.logMessage = {
      request: JSON.parse(request),
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async signupAUser(request: string) {
    // below is just an example for passing additional config with the request
    // this will need to be modified when writing the actual tests
    // const headerOptions: string = JSON.stringify({
    //   'Content-Type': 'application/json',
    //   'x-emc-ubid': `${world.config[`${world.brandId}_brandId`]}`
    // });
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const requestConfig: any = {
    //   headers: headerOptions,
    //   responseType: 'json',
    //   responseEncoding: 'utf8',
    // };
    const requestConfig: any = {
      headers: {},
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.signup,
      request,
      requestConfig
    );

    world.logMessage = {
      request: JSON.parse(request),
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async signoutAUser(request: string) {
    const requestConfig = {
      headers: {},
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.signout,
      request,
      requestConfig
    );
    world.logMessage = {
      request: JSON.parse(request),
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async refreshToken(request: string) {
    const requestConfig = {
      headers: {},
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.refresh,
      request,
      requestConfig
    );
    world.logMessage = {
      request: JSON.parse(request),
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async introspectToken(
    brandId: string,
    resourceId: string,
    authUserName: string,
    authPassword: string,
    request: {},
    ..._optionalParams: any
  ) {
    const token = Buffer.from(
      `${authUserName}:${authPassword}`.trim(),
      "utf8"
    ).toString("base64");

    const requestConfig = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${token}`,
      },
    };

    const response: AxiosResponse = await this.axiosInstance().post(
      this.introspect
        .replace("<resourceId>", resourceId)
        .replace("<brandId>", brandId),
      qs.stringify(request),
      requestConfig
    );
    world.logMessage = {
      request: request,
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async signInAnonymousUser(ver: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestConfig: any = {
      headers: {},
    };

    const response: AxiosResponse = await this.axiosInstance().post(
      this.anonymousSignin,
      {},
      requestConfig
    );
    return response;
  }
}
