import axios, { AxiosResponse } from "axios";
import { world } from "../support/utils/custom.world";

export class Cart {
  cart = "/v1/cart";
  shippingAddress = "/v1/cart/shipping-address";
  billingAddress = "/v1/cart/billing-address";
  updateCart = "/v1/cart/products";
  deliveryMode = "/v1/cart/delivery-modes";
  paymentSession = "/v1/cart/payment/session";

  private axiosInstance() {
    return axios.create({
      baseURL: `${world.config.globals.shardConfig.baseURL}`,
      headers: { "Content-Type": "application/json" },
      responseType: "json",
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200; // Resolve any status code >= 200 , assertion to be checked in the test step
      },
    });
  }

  public async getActiveCart(ver: string, recalculate?: boolean) {
    let requestConfig;
    if (recalculate) {
      requestConfig = {
        headers: {
          Authorization: world.token,
          Prefer: "recalculate-cart=true",
        },
      };
    } else {
      requestConfig = {
        headers: {
          Authorization: world.token,
        },
      };
    }

    const response: AxiosResponse = await this.axiosInstance().get(
      this.cart,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async getCartWithOutHeader(ver: string, header: string) {
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
      this.cart,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async createCart(ver: string, body?: string) {
    const requestConfig = {
      headers: {
        Authorization: world.token,
      },
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.cart,
      body,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async createCartWithoutHeader(ver: string, header: string) {
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
    const response: AxiosResponse = await this.axiosInstance().post(
      this.cart,
      {},
      requestConfig
    );

    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async addUpdateCart(ver: string, request: string) {
    const requestConfig = {
      headers: {
        Authorization: world.token,
      },
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.updateCart,
      request,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async addUpdateCartWithoutHeader(
    ver: string,
    header: string,
    request: string
  ) {
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
    const response: AxiosResponse = await this.axiosInstance().post(
      this.updateCart,
      request,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async setShippingAddress(ver: string, body?: string) {
    const requestConfig = {
      headers: {
        Authorization: world.token,
      },
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.shippingAddress,
      body,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async setShippingAddressWithoutHeader(
    ver: string,
    header: string,
    body?: string
  ) {
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
    const response: AxiosResponse = await this.axiosInstance().post(
      this.shippingAddress,
      body,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async setBillingAddress(ver: string, body?: string) {
    const requestConfig = {
      headers: {
        Authorization: world.token,
      },
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.billingAddress,
      body,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async setBillingAddressWithoutHeader(
    ver: string,
    header: string,
    body?: string
  ) {
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
    const response: AxiosResponse = await this.axiosInstance().post(
      this.billingAddress,
      body,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async setDeliveryModes(ver: string, body?: string) {
    const requestConfig = {
      headers: {
        Authorization: world.token,
      },
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.deliveryMode,
      body,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async setDeliveryModesWithoutHeader(
    ver: string,
    header: string,
    body?: string
  ) {
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
    const response: AxiosResponse = await this.axiosInstance().post(
      this.deliveryMode,
      body,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };

    return response;
  }

  public async getDeliveryModes(ver: string) {
    const requestConfig = {
      headers: {
        Authorization: world.token,
      },
    };
    const response: AxiosResponse = await this.axiosInstance().get(
      this.deliveryMode,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async getDeliveryModesWithOutHeader(ver: string, header: string) {
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
      this.deliveryMode,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async createPaymentSession(ver: string, body?: string) {
    const requestConfig = {
      headers: {
        Authorization: world.token,
      },
    };
    const response: AxiosResponse = await this.axiosInstance().post(
      this.paymentSession,
      body,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async createPaymentSessionWithoutHeader(
    ver: string,
    header: string,
    body?: string
  ) {
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
    const response: AxiosResponse = await this.axiosInstance().post(
      this.paymentSession,
      body,
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };

    return response;
  }
}
