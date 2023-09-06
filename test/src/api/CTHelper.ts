import { world } from "../support/utils/custom.world";
import axios, { AxiosResponse } from "axios";
import { expect } from "chai";
import { CTProductResponse } from "../models/ct/CTProductResponse";
import { sleep } from "../step_definitions/com/CommonSteps";
import { Given } from "@cucumber/cucumber";
import * as console from "console";
import { generateRandomNumber } from "../support/utils/helpers";
import { CTCartResponse } from "src/models/ct/CTCartResponse";

//Optimisation: remove world objects unless needed for logging and not other way

export class CTHelper {
  projectKey: string;
  authAPIURL: string;
  apiURL: string;
  ctInstance;
  ctAuthInstance;
  ctAccessToken;
  ctAdminAccessToken: any;
  clientId: string;
  clientSecret: string;
  inventory: AxiosResponse;
  orderDetails: AxiosResponse;

  constructor(brandId: string, authAPIURL: string, apiURL: string) {
    //ToDo: Move this from config to reading from brandConfig
    this.projectKey = world.config[`${brandId}`].projectKey;
    this.clientId = world.config[`${world.brandId}`].CTclient_id;
    this.clientSecret = world.config[`${world.brandId}`].CTclient_secret;

    this.authAPIURL = authAPIURL;
    this.apiURL = apiURL;

    const ctInstance = axios.create({
      baseURL: `${this.apiURL}`,
      headers: { "Content-Type": "application/json" },
      responseType: "json",
      timeout: 3000,
      validateStatus: function (status) {
        return status >= 200; // Resolve any status code >= 200 , assertion to be checked in the test step
      },
    });

    this.ctInstance = ctInstance;

    const ctAuthInstance = axios.create({
      baseURL: `${this.authAPIURL}`,
      headers: { "Content-Type": "application/json" },
      responseType: "json",
      timeout: 3000,
      validateStatus: function (status) {
        return status >= 200; // Resolve any status code >= 200 , assertion to be checked in the test step
      },
    });

    this.ctAuthInstance = ctAuthInstance;
  }

  async getAUsersLatestCart(token: string) {
    const requestConfig = {
      headers: { Authorization: token },
    };
    const ctCart: AxiosResponse = await this.ctInstance.get(
      `/${this.projectKey}/me/active-cart`,
      requestConfig
    );
    return ctCart;
  }

  async getCartbyId(token: string, cartId) {
    const requestConfig = {
      headers: { Authorization: token },
    };
    const ctCart: AxiosResponse = await this.ctInstance.get(
      `/${this.projectKey}/carts/${cartId}`,
      requestConfig
    );
    return ctCart;
  }

  async getShippingMethodsForCart(token: string, cartId: string) {
    const requestConfig = {
      headers: { Authorization: token },
    };
    const shippingMethods: AxiosResponse = await this.ctInstance.get(
      `/${this.projectKey}/shipping-methods/matching-cart?cartId=${cartId}`,
      requestConfig
    );
    return shippingMethods;
  }

  async deleteMyCart(token: string, cartId: string, cartVersion: string) {
    const requestConfig = {
      headers: { Authorization: token },
    };
    const ctCart: AxiosResponse = await this.ctInstance.get(
      `/${this.projectKey}/me/carts/${cartId}?version=${cartVersion}}`,
      requestConfig
    );
    return ctCart;
  }

  async getMyCustomerDetails(token: string) {
    const requestConfig = {
      headers: { Authorization: token },
    };
    const myCustomer: AxiosResponse = await this.ctInstance.get(
      `/${this.projectKey}/me`,
      requestConfig
    );
    return myCustomer;
  }

  public async getCTTokensForAUser() {
    if (this.ctAdminAccessToken != undefined) {
      // console.log(
      //   "I'm already called once for this brand, not needed to call anymore"
      // );
      return;
    }

    const token = Buffer.from(
      `${this.clientId}:${this.clientSecret}`.trim(),
      "utf8"
    ).toString("base64");

    const requestConfig = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${token}`,
      },
    };

    const tokenResponse: AxiosResponse = await this.ctAuthInstance.post(
      `/oauth/token?grant_type=client_credentials`,
      "",
      //  `/oauth/${this.projectKey}/customers/token?grant_type=password&username=${email}&password=${pass}`,
      requestConfig
    );
    expect(tokenResponse.status).to.be.eq(200);
    world.ctAccessToken = tokenResponse.data.access_token;
    this.ctAdminAccessToken = tokenResponse.data.access_token;
  }

  public async changeInventory(productKey: string, changeQty: number) {
    await this.getCTTokensForAUser();

    const response: AxiosResponse = await this.getProductDetailsByKey(
      productKey
    );
    expect(response.status).to.be.eq(200);
    const ctProductResponse: CTProductResponse = response.data;

    const inventoryId =
      ctProductResponse.masterData.current.masterVariant.availability.id;
    const avaQty = Number.parseInt(
      String(
        ctProductResponse.masterData.current.masterVariant.availability
          .availableQuantity
      )
    );
    const version =
      ctProductResponse.masterData.current.masterVariant.availability.version;
    const qtyToUpdate = avaQty + Number.parseInt(String(changeQty));

    const rc = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };
    this.inventory = await this.ctInstance.post(
      `/${this.projectKey}/inventory/${inventoryId}`,
      `{"version": ${version},
    "actions": [
        {
            "action" : "changeQuantity",
            "quantity" : ${qtyToUpdate}
          }
    ]}`,
      rc
    );
    world.response = this.inventory.data;
    return this.inventory;
  }

  public async getInventory(productKey: string, expStock?: number) {
    await this.getCTTokensForAUser();
    const response: AxiosResponse = await this.getProductDetailsByKey(
      productKey
    );
    expect(response.status).to.be.eq(200);
    const ctProductResponse: CTProductResponse = response.data;

    const inventoryId =
      ctProductResponse.masterData.current.masterVariant.availability.id;
    const avaQty = Number.parseInt(
      String(
        ctProductResponse.masterData.current.masterVariant.availability
          .availableQuantity
      )
    );

    const rc = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };

    if (expStock !== undefined) {
      let actualStock, timeNow;
      const timeInitial: number = Date.now();
      do {
        sleep(10000);
        this.inventory = await this.ctInstance.get(
          `/${this.projectKey}/inventory/${inventoryId}`,
          rc
        );
        actualStock = Number.parseInt(this.inventory.data.quantityOnStock);
        timeNow = Date.now();
      } while (expStock != actualStock && timeNow - timeInitial < 120000);
    } else {
      this.inventory = await this.ctInstance.get(
        `/${this.projectKey}/inventory/${inventoryId}`,
        rc
      );
    }

    world[`${world.brandId}_ctInventory`] = this.inventory.data;
    return this.inventory;
  }

  async getProductDetailsByKey(productKey) {
    await this.getCTTokensForAUser();
    const requestConfig = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };
    const productResponse: AxiosResponse = await this.ctInstance.get(
      `/${this.projectKey}/products/key=${productKey}`,
      requestConfig
    );
    return productResponse;
  }

  async publishProduct(productKey) {
    await this.getCTTokensForAUser();
    let productResponse: AxiosResponse = await this.getProductDetailsByKey(
      productKey
    );
    const productId = productResponse.data.id;
    const version = productResponse.data.version;
    await this.getCTTokensForAUser();
    const requestConfig = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };
    productResponse = await this.ctInstance.post(
      `/${this.projectKey}/products/${productId}`,
      `{
    "version": ${version},
    "actions": [
        {
            "action" : "publish"
          }
    ]
}`,
      requestConfig
    );
    expect(productResponse.status).to.be.eq(200);
    return productResponse;
  }

  async unPublishProduct(productKey) {
    await this.getCTTokensForAUser();
    let productResponse: AxiosResponse = await this.getProductDetailsByKey(
      productKey
    );
    const productId = productResponse.data.id;
    const version = productResponse.data.version;
    const requestConfig = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };
    productResponse = await this.ctInstance.post(
      `/${this.projectKey}/products/${productId}`,
      `{
    "version": ${version},
    "actions": [
        {
            "action" : "unpublish"
          }
    ]
}`,
      requestConfig
    );

    expect(productResponse.status).to.be.eq(200);
    return productResponse;
  }

  public async getOrderDetailsForOrderNumber(orderNumber) {
    await this.getCTTokensForAUser();
    const rc = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };
    // sleep(15000); Need to check with Madhava why this was added, as it is causing the step to timeout
    const response = await this.ctInstance.get(
      `/${this.projectKey}/orders/order-number=${orderNumber}`,
      rc
    );

    this.orderDetails = response;
    world.response = this.orderDetails;
    return this.orderDetails; //modify to return response always
  }

  public async getPaymentById(id) {
    await this.getCTTokensForAUser();
    const rc = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };

    const response = await this.ctInstance.get(
      `/${this.projectKey}/payments/${id}`,
      rc
    );
    world.payment = response.data;
    world.interactionId = response.data.transactions[0].interactionId;
    return response;
  }

  async replicateCart(cartId) {
    await this.getCTTokensForAUser();
    const requestConfig1 = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };
    const res = await this.ctInstance.post(
      `/${this.projectKey}/carts/replicate`,
      `{ "reference":{"typeId":"cart","id":"${cartId}"}}`,
      requestConfig1
    );

    // to be removed
    // world.activeCartResponse[world.brandId] = res;

    expect(res.status).to.be.eq(201);
    return res;
  }

  async removeLineItemFromCart(
    activeCart: CTCartResponse,
    lineItemId: string,
    qty: number
  ) {
    await this.getCTTokensForAUser();
    const requestConfig1 = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };

    const reqPayload = `{
          "version": ${activeCart.version},
          "actions": [
              {
                  "action" : "removeLineItem",
                  "lineItemId" : "${lineItemId}",
                  "quantity" : ${qty}
                }
          ]
      }`;

    const res = await this.ctInstance.post(
      `/${this.projectKey}/carts/${activeCart.id}`,
      reqPayload,
      requestConfig1
    );

    expect(res.status).eq(200);
    return res;
  }

  async createPayment(body) {
    await this.getCTTokensForAUser();

    const requestConfig1 = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };
    world.ctPaymentResponse = await this.ctInstance.post(
      `/${this.projectKey}/payments`,
      body,
      requestConfig1
    );
    expect(world.ctPaymentResponse.status).to.be.eq(201);
    world.paymentId = world.ctPaymentResponse.data.id;
  }

  async addCustomFieldToCart(fieldName, value) {
    await this.getCTTokensForAUser();
    const cartResponse = world.activeCartResponse[world.brandId].data;
    const requestConfig1 = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };
    world.activeCartResponse[world.brandId] = await this.ctInstance.post(
      `/${this.projectKey}/carts/${cartResponse.id}`,
      `{
    "version": ${cartResponse.version},
    "actions": [
   {
            "action" : "setCustomField",
             "name" : "${fieldName}",
            "value" : "${value}"
          }
    ]
}`,
      requestConfig1
    );

    expect(world.activeCartResponse[world.brandId].status).to.be.eq(200);
  }

  async addPaymentToCart() {
    await this.getCTTokensForAUser();
    const cartResponse = world.activeCartResponse[world.brandId].data;
    const requestConfig1 = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };
    world.activeCartResponse[world.brandId] = await this.ctInstance.post(
      `/${this.projectKey}/carts/${cartResponse.id}`,
      `{
    "version": ${cartResponse.version},
    "actions": [
        {
            "action" : "addPayment",
            "payment" : {
              "id" : "${world.ctPaymentResponse.data.id}",
              "typeId" : "payment"
            }
          }
    ]
}`,
      requestConfig1
    );

    expect(world.activeCartResponse[world.brandId].status).to.be.eq(200);
  }

  async addTransactionToPayment() {
    await this.getCTTokensForAUser();
    const cartResponse = world.activeCartResponse[world.brandId].data;
    world.orderNumber = generateRandomNumber(10);
    const requestConfig1 = {
      headers: { Authorization: `Bearer ` + this.ctAdminAccessToken },
    };
    world.activeCartResponse[world.brandId] = await this.ctInstance.post(
      `/${this.projectKey}/carts/${cartResponse.id}`,
      `{
    "version": ${cartResponse.version},
    "actions": [
        {
            "action" : "addPayment",
            "payment" : {
              "id" : "${world.ctPaymentResponse.data.id}",
              "typeId" : "payment"
            }
          }
    ]
}`,
      requestConfig1
    );

    expect(world.activeCartResponse[world.brandId].status).to.be.eq(200);
  }
}
