import { DataTable, Then, When, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "chai";
import { AxiosResponse } from "axios";
import { Cart } from "../../api/Cart";
import {
  getCTInstance,
  validateOpenAPISpec,
  validateResponseJSON,
  validateResponseJSONRegEx,
} from "../../support/utils/helpers";
import { CreateCart, LineItem } from "../../models/request/CreateCart";
import { Address } from "../../models/request/Address";
import { world } from "../../support/utils/custom.world";
import { isEqual } from "lodash";
import * as console from "console";

const cart = new Cart();
let activeCartResponse: AxiosResponse;
let getShippingMethodsResponse: AxiosResponse;
let paymentSessionResponse: AxiosResponse;
let guestUserCart: any;
let ctTokens: AxiosResponse;
const specPath = "commerce-api.yaml";
let lineItems = new Array<LineItem>();
let createCart = new CreateCart();
let address = new Address();
world.activeCartResponse = {};
export function setCucumberTimeout() {
  setDefaultTimeout(60 * 1000);
}
When(
  /^User request Create cart with following line items and currency (.*)$/,
  async function (currency: string, inputTable: DataTable) {
    setCucumberTimeout();
    if (world.config.globals.testConfig.isMock || world.env === "local") {
      world.token = "Bearer faketoken2";
    }

    lineItems = inputTable.hashes();
    if (currency == "<fromConfig>") {
      world.config[`${world.brandId}`].currency;
    } else {
      createCart.setCurrency = currency;
    }
    let i = 1;
    let items = new Array<LineItem>();
    lineItems.forEach((l) => {
      let item = new LineItem();

      if (l["sku"].startsWith("LineItem")) {
        item.setSku = world.config[`${world.brandId}`][`LineItem_${i}`];
      } else {
        item.setSku = l["sku"];
      }

      item.setQuantity = Number.parseInt(String(l["quantity"]));
      items.push(item);
      i++;
    });
    createCart.setLineItems = items;
    activeCartResponse = await cart.createCart(
      world.config.globals.commercetools.ctAPIVersion,
      JSON.stringify(createCart)
    );
    world.response = activeCartResponse.data;
    world.activeCartResponse[world.brandId] = activeCartResponse;
  }
);
Then(
  /(Cart|set Shipping Method) response should be returned with status code (\d+)/,
  function (step: string, statusCode) {
    expect(activeCartResponse.status).to.eql(statusCode);
  }
);

When(/^User request Create Cart for the brand$/, async function () {
  if (world.env === "local") world.token = "Bearer faketoken1";

  activeCartResponse = await cart.createCart(
    world.config.globals.commercetools.ctAPIVersion
  );
  world.response = activeCartResponse.data;
  world.activeCartResponse[world.brandId] = activeCartResponse;
  if (world.isGuest) guestUserCart = activeCartResponse.data;
});

Then(/Cart Response message should match/, function (inputTable) {
  validateResponseJSONRegEx(activeCartResponse.data, inputTable);
});

When(
  /^User set following Shipping address to active cart$/,
  async function (inputTable: DataTable) {
    let temp = inputTable.hashes()[0];
    if (temp.email === "NULL") delete temp["email"];
    address = temp;
    if (temp.country === "<fromConfig>") {
      address.country = world.config[`${world.brandId}`].country;
    }

    activeCartResponse = await cart.setShippingAddress(
      world.config.globals.commercetools.ctAPIVersion,
      JSON.stringify(address)
    );
    world.response = activeCartResponse.data;
    world.activeCartResponse[world.brandId] = activeCartResponse;
  }
);
Then(
  /^Shipping address response should be returned with status code (\d+)$/,
  function (statusCode) {
    expect(activeCartResponse.status).to.eql(statusCode);
  }
);

When(
  /^User set following Billing address to active cart$/,
  async function (inputTable: DataTable) {
    let temp = inputTable.hashes()[0];
    if (temp.email === "NULL") delete temp["email"];

    address = temp;
    if (temp.country === "<fromConfig>") {
      address.country = world.config[`${world.brandId}`].country;
    }
    activeCartResponse = await cart.setBillingAddress(
      world.config.globals.commercetools.ctAPIVersion,
      JSON.stringify(address)
    );

    world.response = activeCartResponse.data;
    world.activeCartResponse[world.brandId] = activeCartResponse;
  }
);
Then(
  /^Billing address response should be returned with status code (\d+)$/,
  function (statusCode) {
    expect(activeCartResponse.status).to.eql(statusCode);
  }
);
Then(/^User request get cart for active cart$/, async function () {
  if (world.config.globals.testConfig.isMock || world.env === "local")
    world.token = "Bearer faketoken3";

  activeCartResponse = await cart.getActiveCart(
    world.config.globals.commercetools.ctAPIVersion
  );
  world.response = activeCartResponse.data;
  world.activeCartResponse[world.brandId] = activeCartResponse;
  world.orderNumber = Number.parseInt(
    activeCartResponse.data.custom.fields.emcOrderId
  );
  world.paymentId = activeCartResponse.data.paymentInfo.payments[0].id;
  // console.log("order==>>" + world.orderNumber);
});

When(
  /^User request Create payment session for active Cart for the brand$/,
  async function () {
    if (world.config.globals.testConfig.isMock || world.env === "local")
      world.token = "Bearer faketoken3";

    // const returnUrl = { returnURL: world.config.paymentSessionReturnUrl };
    //changing this to a hard coded URL as no re-direct happens when trying from API's:PG 24/09/2022
    const returnUrl = { returnURL: "/test" };
    paymentSessionResponse = await cart.createPaymentSession(
      world.config.globals.commercetools.ctAPIVersion,
      JSON.stringify(returnUrl)
    );
    world.response = paymentSessionResponse.data;
  }
);
Then(
  /Payment session response should be returned with status code (\d+)/,
  function (statusCode) {
    expect(paymentSessionResponse.status).to.eql(statusCode);
  }
);
When(
  "User selects {string} shipping method",
  async function (shippingMethod: string) {
    if (world.env === "local") world.token = "Bearer faketoken4";
    getShippingMethodsResponse = await cart.getDeliveryModes(
      world.config.globals.commercetools.ctAPIVersion
    );
    //iterate get shipping methods and retrieve id for STANDARD ship mode
    let body: any;
    getShippingMethodsResponse.data.forEach((shpMd: any) => {
      if (shpMd.name === shippingMethod) body = { id: `${shpMd.id}` };
    });
    // construct the payload and send it to API
    activeCartResponse = await cart.setDeliveryModes(
      world.config.globals.commercetools.ctAPIVersion,
      JSON.stringify(body)
    );
    world.response = activeCartResponse.data;
    world.activeCartResponse[world.brandId] = activeCartResponse;
  }
);

When("user deletes {string} from cart", async function (string) {
  const activeCart = world.activeCartResponse[world.brandId].data;
  let ctInstance = getCTInstance(world.brandId);
  let res = await ctInstance.removeLineItemFromCart(
    activeCart,
    activeCart.lineItems[0].id,
    activeCart.lineItems[0].quantity
  );

  console.log(res);
});
