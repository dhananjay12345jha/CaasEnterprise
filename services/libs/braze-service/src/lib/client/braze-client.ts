import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import axiosRetry, { IAxiosRetryConfig } from "axios-retry";
import {
  TrackUserRequest,
  TrackUserResponse,
  BrazeApiClientConfig,
  CanvasTriggerSendResponse,
  CanvasTriggerSendRequest,
  RegisterUserRequest,
} from "../interfaces";

enum HTTP_RETRY_METHODS {
  get = "get",
  put = "put",
  post = "post",
  delete = "delete",
}

const DEFAULT_RETRY_COUNT = 3;

// axios-retry will not retry POST requests out of the box
function emcRetryCondition(error: AxiosError): boolean | Promise<boolean> {
  return (
    error.config.method &&
    error.config.method in HTTP_RETRY_METHODS &&
    axiosRetry.isRetryableError(error)
  );
}

// Based off of axios-retry exponentialDelay function but allows us to control
// the value of the base delay to exponentially increase from
function exponentialDelay(retryCount: number, retryDelay = 100): number {
  const delay = Math.pow(2, retryCount) * retryDelay;
  const randomSum = delay * 0.2 * Math.random();
  return delay + randomSum;
}

export class BrazeClient {
  axiosInstance: AxiosInstance;

  constructor(brazeApiClientConfig: BrazeApiClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: brazeApiClientConfig.baseURL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${brazeApiClientConfig.apiKey}`,
      },
    });

    // This enables automatic retries of failed requests to Braze
    // See here for more info:
    // https://www.npmjs.com/package/axios-retry
    if (brazeApiClientConfig.shouldRetry) {
      const axiosRetryConfig: IAxiosRetryConfig = {
        retries: brazeApiClientConfig.retryCount || DEFAULT_RETRY_COUNT,
        retryCondition: emcRetryCondition,
        retryDelay: (retryCount: number) => {
          return exponentialDelay(retryCount, brazeApiClientConfig.retryDelay);
        },
      };

      if (brazeApiClientConfig.logRetryRequests) {
        axiosRetryConfig.onRetry = (
          retryCount: number,
          error: AxiosError,
          requestConfig: AxiosRequestConfig
        ) => {
          console.info(
            `Braze API Client - URL: ${requestConfig.baseURL}${requestConfig.url}`
          );
          console.info(
            `Braze API Client - ${retryCount} of max ${axiosRetryConfig.retries} requests retried`
          );
          console.info(`Braze API Client - Error: ${error.toJSON()}`);
        };
      }

      axiosRetry(this.axiosInstance, axiosRetryConfig);
    }
  }

  async trackUser(
    trackUserRequestMessage: TrackUserRequest
  ): Promise<TrackUserResponse> {
    const response = await this.axiosInstance.post(
      "/users/track",
      trackUserRequestMessage
    );
    return response.data;
  }

  async canvasTriggerSend(
    canvasRequestMessage: CanvasTriggerSendRequest
  ): Promise<CanvasTriggerSendResponse> {
    const response = await this.axiosInstance.post(
      "/canvas/trigger/send",
      canvasRequestMessage
    );
    return response.data;
  }

  async registerUser(
    registerUserRequest: RegisterUserRequest
  ): Promise<TrackUserResponse> {
    const response = await this.axiosInstance.post(
      "/users/track",
      registerUserRequest
    );
    return response.data;
  }
}
