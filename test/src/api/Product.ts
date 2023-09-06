import { world } from "../support/utils/custom.world";
import axios, { AxiosResponse } from "axios";

export class Product {
  productKey = "/v1/product/{productKey}";
  productBySku = "/v1/product/sku/{sku}";
  productFamilyKey = "/v1/product/{productFamilyKey}/variants";
  skuVariants = "/v1/product/sku/{sku}/variants";

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

  public async getProductDetailsByProductKey(ver: string, productKey: string) {
    const requestConfig = {
      headers: {},
    };

    const response: AxiosResponse = await this.axiosInstance()(
      this.productKey.replace("{productKey}", productKey),
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async getProductDetailsByProductKeyWithoutBrand(
    ver: string,
    productKey: string
  ) {
    const response: AxiosResponse = await this.axiosInstance()(
      this.productKey.replace("{productKey}", productKey)
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async getProductDetailsBySKU(ver: string, sku: string) {
    const requestConfig = {
      headers: {},
    };

    const response: AxiosResponse = await this.axiosInstance()(
      this.productBySku.replace("{sku}", sku),
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async getProductDetailsBySKUWithoutBrand(ver: string, sku: string) {
    const response: AxiosResponse = await this.axiosInstance()(
      this.productBySku.replace("{sku}", sku)
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async getProductDetailsByProductFamilyKey(
    ver: string,
    productFamilyKey: string
  ) {
    const requestConfig = {
      headers: {},
    };

    const response: AxiosResponse = await this.axiosInstance()(
      this.productFamilyKey.replace("{productFamilyKey}", productFamilyKey),
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    console.log(response);
    return response;
  }

  public async getProductDetailsByProductFamilyKeyWithoutBrand(
    ver: string,
    productFamilyKey: string
  ) {
    const response: AxiosResponse = await this.axiosInstance()(
      this.productFamilyKey.replace("{productFamilyKey}", productFamilyKey)
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async getProductDetailsBySKUVariants(
    ver: string,
    skuVariants: string
  ) {
    const requestConfig = {
      headers: {},
    };

    const response: AxiosResponse = await this.axiosInstance()(
      this.skuVariants.replace("{sku}", skuVariants),
      requestConfig
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }

  public async getProductDetailsBySKUVariantsWithoutBrand(
    ver: string,
    skuVariants: string
  ) {
    const response: AxiosResponse = await this.axiosInstance()(
      this.skuVariants.replace("{sku}", skuVariants)
    );
    world.logMessage = {
      responseStatusCode: response.status,
      response: response.data,
    };
    return response;
  }
}
