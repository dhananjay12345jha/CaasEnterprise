import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { world } from "../../support/utils/custom.world";
import { readFileSync } from "fs";
import { expect } from "chai";
import { AxiosResponse, AxiosStatic } from "axios";
import { Auth } from "../../api/Auth";
import { isEqual } from "lodash";
import { CTHelper } from "../../api/CTHelper";
import { CTOrderResponse } from "../../models/ct/CTOrderResponse";
import { Oms } from "../../api/Oms";
import * as console from "console";
import {
  Amount,
  AmountPlanned,
  CTPaymentRequest,
  Transaction,
} from "../../models/ct/CTPaymentRequest";
import { CTPaymentResponse } from "../../models/ct/CTPaymentResponse";
import {
  CartResponse,
  Custom,
  Fields,
} from "../../models/response/CartResponse";
import { generateRandomUser } from "../../support/utils/authHelpers";
import {
  generateRandomNumber,
  getCTInstance,
} from "../../support/utils/helpers";
import { CTCartResponse } from "src/models/ct/CTCartResponse";

const auth = new Auth();
const ctOrderResponse = new CTOrderResponse();
const oms = new Oms();
let ctPaymentRequest: CTPaymentRequest;
let ctPaymentResponse: CTPaymentResponse;
let activeCartResponse: CartResponse;

Given(
  /(guest|signed-in) user is navigating site for (.*)/,
  { timeout: 60000 },
  async function (userType: string, brandId: string) {
    world.brandId = brandId;
    if (world.env != "local") {
      let signInResponse;

      if (userType == "guest") {
        signInResponse = await auth.signInAnonymousUser(
          world.config.globals.testConfig.authAPIVersion
        );
        world.isGuest = true;
      } else {
        //To-Do create request and sign-in
        signInResponse = await auth.signInRegisteredUser(
          "",
          world.config.globals.testConfig.authAPIVersion
        );
      }

      expect(signInResponse.status).to.be.eq(200);
      world.token = " Bearer " + signInResponse.data?.accessToken;
    }
  }
);

Given(
  /Verify that (cart|get shipping methods|self) response is retrieved from CT project for (.*)/,
  async function (api: string, brandId: string) {
    let ctCart: AxiosResponse;

    //retrieve the CT project key for given brand --hardcode in profile for now
    // this needs to be retrieved from getPrivateConfig brand config response
    const projectKey = world.config[`${brandId}`].projectKey;

    let ctInstance = getCTInstance(world.brandId);
    switch (api) {
      case "cart":
        if (world.env === "local")
          compareResponseWithStaticJsonFile("cart/GetCart.json");
        else {
          // //make the call to CT Get my active-cart with the auth token
          ctCart = await ctInstance.getAUsersLatestCart();
          expect(ctCart.status).to.eql(200);
          expect(
            isEqual(world.activeCartResponse[world.brandId].data, ctCart.data)
          ).to.be.true;
        }
        break;
      case "get shipping methods":
        if (world.env === "local")
          compareResponseWithStaticJsonFile("cart/GetDeliveryModes.json");
        else {
          let shippingMethods = await ctInstance.getShippingMethodsForCart(
            world.token,
            world.activeCartResponse[world.brandId].data.id
          );
          expect(shippingMethods.status).to.eql(200);
          expect(
            isEqual(
              world.getShippingMethodsResponse.data,
              shippingMethods.data.results
            )
          ).to.be.true;
        }
        break;
      case "self":
        if (world.env === "local")
          compareResponseWithStaticJsonFile("self/self.json");
        else {
          let myCustomer = await ctInstance.getMyCustomerDetails();
          expect(myCustomer.status).to.eql(200);
          expect(
            isEqual(
              world.selfResponse.data.firstname,
              myCustomer.data.firstname
            )
          ).to.be.true;
          expect(
            isEqual(world.selfResponse.data.lastname, myCustomer.data.lastname)
          ).to.be.true;
        }
        break;
      default:
    }
  }
);

Then(
  /Check that below (shipping address|billing address) details are successfully persisted in users cart/,
  function (objectType: string, inputTable: DataTable) {
    //skip this step if env is local
    if (world.config.globals.testConfig.isMock || world.env === "local") return;

    let address = inputTable.hashes()[0];

    let errors = new Array();
    if (objectType.includes("shipping"))
      Object.keys(address).forEach((key) => {
        if (
          world.activeCartResponse[world.brandId].data.shippingAddress[key] !=
          address[key]
        )
          errors.push(
            `expected '${key}' to be ${address[key]},actual:${
              world.activeCartResponse[world.brandId].data.shippingAddress[key]
            }\n`
          );
      });
    else if (objectType.includes("billing"))
      Object.keys(address).forEach((key) => {
        if (
          world.activeCartResponse[world.brandId].data.billingAddress[key] !=
          address[key]
        )
          errors.push(
            `expected '${key}' to be ${address[key]},actual:${
              world.activeCartResponse[world.brandId].data.billingAddress[key]
            }\n`
          );
      });

    expect(errors, `${errors}`).to.be.empty;
  }
);

// this step is relevant only when tests are run on local
Then(/^Verify that API response should be (.*)$/, function (fileName: string) {
  if (world.env === "local") compareResponseWithStaticJsonFile(fileName);
  else {
  }
});

function compareResponseWithStaticJsonFile(fileName: string) {
  const expectedResponse = JSON.parse(
    readFileSync(`test-automation/src/fixtures/${fileName}`, "utf-8")
  );
  expect(world.response).to.eql(expectedResponse);
}

Given(/^CT User has access tokens$/, async function () {
  let ctInstance = getCTInstance(world.brandId);
  // const ctTokens= world[`${world.brandId}_ct`].getCTTokensForAUser( world.config[`${world.brandId}_CTUserName`],world.config[`${world.brandId}_CTPassword`])
  world[`${world.brandId}_ctTokens`] = await ctInstance.getCTTokensForAUser();
});
Given(
  /^CT User updates Product SKU (.*) quantity to (.*)$/,
  async function (productKey: string, quantity: string) {
    let ctInstance = getCTInstance(world.brandId);
    const changeQty = quantity.split("+")[1];
    world[`${world.brandId}_ctInventory`] = await ctInstance.changeInventory(
      productKey,
      changeQty
    );
  }
);

Given(/^SKU (.*) was (.*)$/, async function (productKey: string, published) {
  let ctInstance = getCTInstance(world.brandId);

  if (published == "published") {
    world[`${world.brandId}_publish`] = await ctInstance.publishProduct(
      productKey
    );
  } else {
    world[`${world.brandId}_publish`] = await ctInstance.unPublishProduct(
      productKey
    );
  }
});

// When(
//   /^User get (created|updated) Order Details from CT$/,
//   { timeout: 60 * 1000 },
//   async function (type) {
//     let ctInstance = getCTInstance(world.brandId);

//     world[`${world.brandId}_orderDetails`] =
//       await ctInstance.getOrderDetailsForOrderNumber(world.orderNumber);
//     //         console.log(JSON.stringify(world[`${world.brandId}_orderDetails`].data));
//   }
// );

export function sleep(milliseconds: number) {
  const timeInitial: number = Date.now();
  var timeNow: number = Date.now();
  for (let i: number; timeNow - timeInitial < milliseconds; i++) {
    timeNow = Date.now();
  }
  //  console.log('Sleep done!');
}

Given(
  /Order is (successfully|not) (created|updated) in commercetools/,
  async function (result: string, type) {
    sleep(10000); //adding sleep to give enough for the order to be created in CT. this will be applied even for failed tests so that enough time is given

    let ctInstance = getCTInstance(world.brandId);
    world[`${world.brandId}_orderDetails`] =
      await ctInstance.getOrderDetailsForOrderNumber(world.orderNumber);
    console.log(world[`${world.brandId}_orderDetails`]);
    expect(world.response.data.statusCode).to.be.eq(
      result == "not" ? 404 : undefined
    );
  }
);

// Given(/^CT Order Details API should return (\d+)$/, async function (status) {
//   expect(world.response.status).to.be.eq(status);
// });

Given(/^User Get Order details from OMS$/, async function () {
  world.omsResponse = await oms.getOrderInfoFromOMS(
    world.config[`${world.brandId}`].oms_brandId,
    world.orderNumber
  );
});

export async function getInventoryFromCTForSKU(sku, expStock?) {
  let ctInstance = getCTInstance(world.brandId);

  let response = await ctInstance.getInventory(sku, expStock);
  world[`${world.brandId}_ctInventory`] = response;
  return response;
}

Given(
  /^a cart exists (|with 2 items )in CT for (.*)$/,
  async function (itmCnt: string, brand: string) {
    world.brandId = brand;
    let ctInstance = getCTInstance(world.brandId);

    if (itmCnt.trim() == "with 2 items")
      world.activeCartResponse[world.brandId] = await ctInstance.replicateCart(
        world.config[`${world.brandId}`].refCartId_2SKU
      );
    else
      world.activeCartResponse[world.brandId] = await ctInstance.replicateCart(
        world.config[`${world.brandId}`].refCartId
      );

    world.orderNumber = generateRandomNumber(10);
    await ctInstance.addCustomFieldToCart("emcOrderId", world.orderNumber);
  }
);

Given("a payment is added to above cart successfully", async function () {
  let ctInstance = getCTInstance(world.brandId);

  await createAPaymentTransactionInCT(
    world.activeCartResponse[world.brandId].data,
    world.brandId
  );
  await ctInstance.addPaymentToCart();
});

async function createAPaymentTransactionInCT(cart, brandId) {
  let activeCartResponse = cart;
  let ctInstance = getCTInstance(brandId);

  // Construct a CT Payment request
  ctPaymentRequest = new CTPaymentRequest(activeCartResponse);

  // Create the payment in CT
  await ctInstance.createPayment(JSON.stringify(ctPaymentRequest));
}

Given(/^User create payment successfully in CT$/, async function () {
  await createAPaymentTransactionInCT(
    world.activeCartResponse[world.brandId].data,
    world.brandId
  );
});

Given(/^User add payment to cart successfully in CT$/, async function () {
  let ctInstance = getCTInstance(world.brandId);

  await ctInstance.addPaymentToCart();
  // console.log(JSON.stringify(world.activeCartResponse[world.brandId].data));
});

Given(/^User add Transaction successfully to Payment$/, function () {});
