import {
  getBrandConfigCachedClient,
  EXTERNAL_PROVIDER_TYPES,
  OMS_CONFIG_KEYS,
  SPECIAL_BRAND_IDS,
  OmsProviderConfig,
} from "@ei-services/brand-config";
import { Logger } from "@ei-services/services";

import {
  OMSTransientError,
  OMSPermanentError,
  OMSNotFoundError,
} from "./errors";
import { OMSStoredOrder, OrderPayload } from "./interfaces";
import fetch, { BodyInit, HeadersInit, Response, FetchError } from "node-fetch";

const EXPIRY_PADDING = 30_000; // 30 seconds

export default class OMSClient {
  public accessCreds: {
    apiBase: string;
    clientID: string;
    clientSecret: string;
  };
  private readonly logger: Logger;
  private accessToken: { value: string; expiresAt: number };

  constructor({ logger }: { logger: Logger }) {
    this.logger = logger;
    this.accessToken = null;
    this.accessCreds = null;
  }

  static checkStatus(response: Response) {
    if (response.ok) {
      return response;
    } else {
      const { statusText, status } = response;
      if (status === 404) {
        throw new OMSNotFoundError(statusText);
      } else if (status >= 400 && status < 500) {
        throw new OMSPermanentError(statusText);
      } else {
        throw new OMSTransientError(statusText);
      }
    }
  }

  private async configureAuth(): Promise<void> {
    const config =
      await getBrandConfigCachedClient().getProviderConfig<OmsProviderConfig>(
        SPECIAL_BRAND_IDS.GLOBAL,
        [
          OMS_CONFIG_KEYS.EMC_API_BASE,
          OMS_CONFIG_KEYS.EMC_CLIENT_ID,
          OMS_CONFIG_KEYS.EMC_CLIENT_SECRET,
        ],
        EXTERNAL_PROVIDER_TYPES.OMS
      );

    this.accessCreds = {
      apiBase: config[OMS_CONFIG_KEYS.EMC_API_BASE],
      clientID: config[OMS_CONFIG_KEYS.EMC_CLIENT_ID],
      clientSecret: config[OMS_CONFIG_KEYS.EMC_CLIENT_SECRET],
    };
  }

  private isTokenValid(): boolean {
    if (!this.accessToken) {
      return false;
    }

    const now = Date.now();
    const { expiresAt } = this.accessToken;

    return now < expiresAt - EXPIRY_PADDING;
  }

  private isAuthConfigured(): boolean {
    return Boolean(this.accessCreds);
  }

  private async authorize(): Promise<void> {
    if (!this.isAuthConfigured()) {
      await this.configureAuth();
    }

    const body = JSON.stringify({
      grantType: "client_credentials",
      clientID: this.accessCreds.clientID,
      clientSecret: this.accessCreds.clientSecret,
    });

    const options = {
      method: "post",
      body,
      headers: {
        Accept: "text/plain",
        "Content-Type": "application/json",
      },
    };

    let result;
    try {
      const response = await fetch(
        `${this.accessCreds.apiBase}/v1/AccessToken`,
        options
      );
      const checkedResponse = OMSClient.checkStatus(response);
      result = await checkedResponse.json();
    } catch ({ message }) {
      throw new OMSPermanentError(`An error occurred authorizing: ${message}`);
    }
    const { accessToken, expiresIn } = result as {
      accessToken: string;
      expiresIn: number; // in seconds
    };

    this.accessToken = {
      value: accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };
  }

  private async apiFetch(
    path: string,
    options: { method?: string; headers?: HeadersInit; body?: BodyInit }
  ): Promise<unknown> {
    if (!this.isTokenValid()) {
      await this.authorize();
    }
    const { headers } = options;

    options.headers = headers
      ? { ...headers, Authorization: `Bearer ${this.accessToken.value}` }
      : { Authorization: `Bearer ${this.accessToken.value}` };

    let response: Response;
    try {
      response = await fetch(`${this.accessCreds.apiBase}${path}`, options);
    } catch (err: unknown) {
      const { name, message } = err as { name: string; message: string };

      if (name === "AbortError" || err instanceof FetchError) {
        throw new OMSTransientError(message);
      }

      throw err;
    }

    const checkedResponse = OMSClient.checkStatus(response);
    return checkedResponse.json();
  }

  public async getOrder({
    brandID,
    saleReference,
  }: {
    brandID: number;
    saleReference: string;
  }): Promise<OMSStoredOrder | null> {
    let result;
    try {
      result = await this.apiFetch(`/v1/Orders/${brandID}-${saleReference}`, {
        method: "get",
      });
    } catch (err) {
      if (err instanceof OMSNotFoundError) {
        return null;
      }
      throw err;
    }
    return result;
  }

  public createOrder(order: OrderPayload) {
    return this.apiFetch("/v1/Orders", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
  }
}
