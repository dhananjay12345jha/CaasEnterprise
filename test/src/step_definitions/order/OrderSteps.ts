import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { AxiosResponse } from "axios";
import {
  Courier,
  Delivery,
  ExpectedDeliveryWindow,
  LineItem,
  OrderUpdate,
  Status,
} from "../../models/request/OrderUpdate";
import { Order } from "../../api/Order";
import { CTOrderResponse } from "../../models/ct/CTOrderResponse";
import { CTCartResponse } from "../../models/ct/CTCartResponse";
import { world } from "../../support/utils/custom.world";
import { Payment } from "../../api/Payment";
import { PaymentWebhook } from "../../models/request/PaymentWebhook";

import {
  getCTInstance,
  getPrivateConfig,
  generateCartHMACSig,
} from "../../support/utils/helpers";

import { CartResponse } from "../../models/response/CartResponse";
import {
  validateOpenAPISpec,
  validateResponseJSON,
} from "../../support/utils/helpers";
import * as console from "console";
import { OMSOrderResponse } from "../../models/response/OMSOrderResponse";
import { CTHelper } from "../../api/CTHelper";
import { CTPaymentResponse } from "../../models/ct/CTPaymentResponse";
import { eventNames } from "process";
import { sleep } from "../com/CommonSteps";
import { Oms } from "../../api/Oms";

let orderResponse: AxiosResponse;
const specPath = "./orders.yaml";
let orderUpdate = new OrderUpdate();
let delivery = new Delivery();
let order = new Order();
let ctOrderResponse = new CTOrderResponse();
let ctCartResponse = new CTCartResponse();
const payment = new Payment();
let response: AxiosResponse;

Given(
  /^OMS order update message has following (order|lineItems) details$/,
  function (objType: string, inputTable: DataTable) {
    switch (objType) {
      case "order":
        const orderDetails = inputTable.hashes()[0];
        orderUpdate.orderId = world.orderNumber.toString();
        orderUpdate.brand = world.config[`${world.brandId}`].oms_brandId;
        orderUpdate.time = new Date().toISOString();
        let status = new Status();
        status.current = orderDetails["current"];
        status.previous = orderDetails["previous"];
        orderUpdate.status = status;
        if (orderDetails["companyName"] !== undefined) {
          let courier = new Courier();
          courier.companyName = orderDetails["companyName"];
          let expectedDeliveryWindow = new ExpectedDeliveryWindow();
          expectedDeliveryWindow.value = Number.parseInt(orderDetails["value"]);
          expectedDeliveryWindow.type = orderDetails["type"];
          delivery.trackingUrl = orderDetails["trackingUrl"];
          delivery.courier = courier;
          delivery.expectedDeliveryWindow = expectedDeliveryWindow;
        }
        orderUpdate.delivery = delivery;
        break;
      case "lineItems":
        const lineItems = inputTable.hashes();
        let items = new Array<LineItem>();
        lineItems.forEach((l) => {
          let i = 1;
          let lineItem = new LineItem();
          switch (l["sku"].trim()) {
            case "LineItem_1":
              lineItem.sku = `${world.config[`${world.brandId}`].LineItem_1}`;
              break;
            case "LineItem_2":
              lineItem.sku = `${world.config[`${world.brandId}`].LineItem_2}`;
              break;
            case "LineItem_3":
              lineItem.sku = `${world.config[`${world.brandId}`].LineItem_3}`;
              break;
            default:
              lineItem.sku = l["sku"];
          }
          lineItem.quantity = Number.parseInt(l["quantity"]);
          lineItem.status = l["status"];
          lineItem.dispatchedQuantity = Number.parseInt(
            l["dispatchedQuantity"]
          );
          items.push(lineItem);
          i = i + 1;
        });
        delivery.lineItems = items;
        break;
    }
  }
);

Given(
  /^OMS order update message has following invalid (order|lineItems) details$/,
  function (objType: string, inputTable: DataTable) {
    switch (objType) {
      case "order":
        const orderDetails = inputTable.hashes()[0];
        orderUpdate.orderId = "2241654221";
        orderUpdate.brand = world.config[`${world.brandId}_oms_brandId`];
        orderUpdate.time = new Date().toISOString();
        let status = new Status();
        status.current = orderDetails["current"];
        status.previous = orderDetails["previous"];
        orderUpdate.status = status;
        if (orderDetails["companyName"] !== undefined) {
          let courier = new Courier();
          courier.companyName = orderDetails["companyName"];
          let expectedDeliveryWindow = new ExpectedDeliveryWindow();
          expectedDeliveryWindow.value = Number.parseInt(orderDetails["value"]);
          expectedDeliveryWindow.type = orderDetails["type"];
          delivery.trackingUrl = orderDetails["trackingUrl"];
          delivery.courier = courier;
          delivery.expectedDeliveryWindow = expectedDeliveryWindow;
        }
        orderUpdate.delivery = delivery;
        break;
      case "lineItems":
        const lineItems = inputTable.hashes();
        let items = new Array<LineItem>();
        lineItems.forEach((l) => {
          let i = 1;
          let lineItem = new LineItem();
          if (l["sku"].startsWith("LineItem")) {
            lineItem.sku = world.config[`${world.brandId}_${l["sku"]}`];
          } else {
            lineItem.sku = l["sku"];
          }
          lineItem.quantity = Number.parseInt(l["quantity"]);
          lineItem.status = l["status"];
          lineItem.dispatchedQuantity = Number.parseInt(
            l["dispatchedQuantity"]
          );
          items.push(lineItem);
          i = i + 1;
        });
        delivery.lineItems = items;
        break;
    }
  }
);
Then(/^Verify Order details with cart details$/, async function () {
  ctOrderResponse = world[`${world.brandId}_orderDetails`].data;
  ctCartResponse = world.activeCartResponse[world.brandId].data;
  console.log("CT" + Number.parseInt(ctOrderResponse.orderNumber));
  expect(Number.parseInt(ctOrderResponse.orderNumber)).to.be.eq(
    world.orderNumber
  );
});

Given(
  /payment details are correctly persisted in the (order|cart)/,
  async function (resObj: string) {
    let ctInstance = getCTInstance(world.brandId);

    if (resObj === "order") {
      let ctOrderResponse: CTOrderResponse =
        world[`${world.brandId}_orderDetails`].data;
      let paymentWebhook = world.paymentWebhook;

      expect(ctOrderResponse.custom.fields.emcPaymentMethod).to.be.eq(
        paymentWebhook.notificationItems[0].NotificationRequestItem
          .paymentMethod
      );
      expect(ctOrderResponse.custom.fields.emcLast4Digits).to.be.eq(
        paymentWebhook.notificationItems[0].NotificationRequestItem
          .additionalData.cardSummary
      );

      console.log(ctOrderResponse.paymentInfo);

      //ToDo:modify to loop when multiple payments are available
      let response = await ctInstance.getPaymentById(
        ctOrderResponse.paymentInfo.payments[0].id
      );

      expect(response.data.transactions[0].interactionId).eq(
        paymentWebhook.notificationItems[0].NotificationRequestItem.pspReference
      );
      expect(response.data.transactions[0].state).eq("Success");
      console.log(response.data.transactions);
    } else {
      let cart = world.activeCartResponse[world.brandId].data;
      let response = await ctInstance.getPaymentById(
        cart.paymentInfo.payments[0].id
      );
      // console.log(response.data.transactions);
      expect(response.data.transactions[0].state).eq("Initial"); //confirm with Joe.G. if this is correct,looks like potential bug

      // console.log(cart);
    }
  }
);

When(
  /^Adyen sent successful payment authorisation to payment webhook$/,
  async function () {
    let paymentWebhook = await generatePaymentWebHookReq();
    world.paymentWebhook = paymentWebhook;

    const response = await payment.paymentAuthorizationFromAdyen(
      JSON.stringify(paymentWebhook)
    );

    // console.log("Notification items");
    // console.log(JSON.stringify(paymentWebhook));

    world.response = response;
    expect(response.status).to.be.eq(200);
  }
);

async function generatePaymentWebHookReq() {
  let ctInstance = getCTInstance(world.brandId);
  await ctInstance.getPaymentById(world.paymentId);

  let activeCartResponse = new CartResponse();
  activeCartResponse = world.activeCartResponse[world.brandId].data;
  // sandbox keys --please leave
  // const hmacKey = "3AC6113F191327175B6E79ED35227BC275AF11EA342595603D9DB5ADE39485A8";
  // let merchantAccountCode ="EverymileCommerce_Platform_TEST"

  //read from brand config
  let getPrivateConfigResponse: AxiosResponse = await getPrivateConfig(
    world.config[`${world.brandId}`].brandId
  );
  const hmacKey =
    getPrivateConfigResponse.data.getPrivateConfig.externalProviders
      .filter((e) => e.type == "PAYMENT")[0]
      .providerConfigs.filter(
        (e) => e.key == "payment-adyen-hmac-key"
      )[0].value;

  //Construct Payment webhook payload
  let paymentWebhook = new PaymentWebhook(
    activeCartResponse,
    world.config[world.brandId].brandId,
    world.interactionId
  );

  let merchantAccountCode =
    getPrivateConfigResponse.data.getPrivateConfig.externalProviders
      .filter((e) => e.type == "PAYMENT")[0]
      .providerConfigs.filter(
        (e) => e.key == "adyen-merchant-account-id"
      )[0].value;

  paymentWebhook.notificationItems[0].NotificationRequestItem.merchantAccountCode =
    merchantAccountCode;
  const pspRef =
    paymentWebhook.notificationItems[0].NotificationRequestItem.pspReference;
  paymentWebhook.notificationItems[0].NotificationRequestItem.additionalData[
    "hmacSignature"
  ] = generateCartHMACSig(
    activeCartResponse,
    pspRef,
    paymentWebhook.notificationItems[0].NotificationRequestItem
      .merchantReference,
    hmacKey,
    merchantAccountCode
  );

  return paymentWebhook;
}

When(
  /^Adyen sent unsuccessful payment authorisation to payment webhook$/,
  async function (dataTable: DataTable) {
    let data = dataTable.hashes()[0];
    console.log(data);
    let paymentWebhook = await generatePaymentWebHookReq();

    // if (
    //   data["eventCode"] !== "" ||
    //   data["eventCode"] !== null ||
    //   data["eventCode"] !== "AUTHORISATION"
    // ) {
    //   paymentWebhook.notificationItems[0].NotificationRequestItem.eventCode =
    //     data["eventCode"];
    //   paymentWebhook.notificationItems[0].NotificationRequestItem.eventCode =
    // }

    // if (
    //   data["success"] !== "" ||
    //   data["success"] !== null ||
    //   data["success"] !== "true"
    // ) {
    //   paymentWebhook.notificationItems[0].NotificationRequestItem.eventCode =
    //     data["success"];
    // }

    switch (data.field) {
      case "eventCode":
        paymentWebhook.notificationItems[0].NotificationRequestItem.eventCode =
          data.value;
        paymentWebhook.notificationItems[0].NotificationRequestItem.success =
          "false";
        break;
      case "brandId":
        paymentWebhook.notificationItems[0].NotificationRequestItem.additionalData[
          "metadata.brandId"
        ] = data.value;
        break;
      case "cartId":
        paymentWebhook.notificationItems[0].NotificationRequestItem.additionalData[
          "metadata.cartId"
        ] = data.value;
      case "hmacSignature":
        paymentWebhook.notificationItems[0].NotificationRequestItem.additionalData[
          "hmacSignature"
        ] = data.value;
        break;
      case "cartDigest":
        paymentWebhook.notificationItems[0].NotificationRequestItem.additionalData[
          "metadata.cartDigest"
        ] = data.value;
        break;
      case "merchantReference":
        paymentWebhook.notificationItems[0].NotificationRequestItem.merchantReference =
          data.value;
        break;
      case "merchantAccountCode":
        paymentWebhook.notificationItems[0].NotificationRequestItem.merchantAccountCode =
          data.value;
        break;
      case "paymentMethod":
        paymentWebhook.notificationItems[0].NotificationRequestItem.paymentMethod =
          data.value;
        break;
      case "cartTotal":
        paymentWebhook.notificationItems[0].NotificationRequestItem.amount.value =
          Number(data.value);
        break;
      case "currency":
        paymentWebhook.notificationItems[0].NotificationRequestItem.amount.currency =
          data.value;
        break;
      // case default:
      //   console.log("No Match sorry");
      //   break;
    }

    const response = await payment.paymentAuthorizationFromAdyen(
      JSON.stringify(paymentWebhook)
    );
    world.response = response;
    expect(response.status).to.be.eq(200);
  }
);
Then(/^Payment webhook response should be (.*)$/, function (res: string) {
  expect(world.response.data).to.be.eq(res);
});

When(
  /^OMS send order status update to Order status Update webhook API$/,
  async function () {
    response = await order.orderStatusUpdateFromOMS(
      JSON.stringify(orderUpdate)
    );
  }
);
Then(
  /^Order status Update response should be returned with status code (\d+)$/,
  function (res) {
    expect(response.status).to.be.eq(res);
    validateOpenAPISpec(response, specPath);
  }
);
Then(/^Verify CT order details with OMS order details$/, function () {
  validateOMSOrderResponse(
    world.omsResponse,
    world[`${world.brandId}_orderDetails`].data
  );
});

Given(/Order is (correctly|not) created in OMS/, async function (flag: string) {
  //introducing a sleep to give enough time for order to be created in OMS
  sleep(10000);
  const oms = new Oms();
  world.omsResponse = await oms.getOrderInfoFromOMS(
    world.config[`${world.brandId}`].oms_brandId,
    world.orderNumber
  );
  if (flag === "not") expect(world.omsResponse.status).eq(404);
  else {
    expect(world.omsResponse.status).eq(200);
    validateOMSOrderResponse(
      world.omsResponse.data,
      world[`${world.brandId}_orderDetails`].data
    );
  }
});

function validateOMSOrderResponse(
  omsOrderResponse: OMSOrderResponse,
  ctOrderResponse: CTOrderResponse
) {
  console.log("OMS Order response === " + JSON.stringify(omsOrderResponse));
  console.log("CT Order response === " + JSON.stringify(ctOrderResponse));

  expect(ctOrderResponse.orderNumber).to.be.eq(omsOrderResponse.saleReference);
  expect(ctOrderResponse.totalPrice.currencyCode).to.be.eq(
    omsOrderResponse.currencyCode
  );

  //ToDo:retrieve this dynamically
  let shippingCode;
  if (ctOrderResponse.shippingInfo.shippingMethodName == "Standard") {
    shippingCode = "STD1";
  }
  expect(shippingCode).to.be.eq(omsOrderResponse.shippingService);
  // ToDo:Validate to the min
  // expect(ctOrderResponse.createdAt).to.be.eq(omsOrderResponse.datePurchased);

  expect(ctOrderResponse.totalPrice.centAmount / 100).to.be.eq(
    omsOrderResponse.amountPaid
  );
  expect(ctOrderResponse.shippingInfo.price.centAmount / 100).to.be.eq(
    omsOrderResponse.shippingCost
  );
  expect(ctOrderResponse.billingAddress.firstName).to.be.eq(
    omsOrderResponse.customerFirstName
  );
  expect(ctOrderResponse.billingAddress.lastName).to.be.eq(
    omsOrderResponse.customerLastName
  );
  expect(
    ctOrderResponse.billingAddress.streetNumber.concat(
      ` ${ctOrderResponse.billingAddress.streetName}`
    )
  ).to.be.eq(omsOrderResponse.customerAddressLine1);
  expect(ctOrderResponse.billingAddress.city).to.be.eq(
    omsOrderResponse.customerTownCity
  );
  expect(ctOrderResponse.billingAddress.postalCode).to.be.eq(
    omsOrderResponse.customerPostalCode
  );
  expect(ctOrderResponse.billingAddress.country).to.be.eq(
    omsOrderResponse.customerCountryCode
  );
  expect(ctOrderResponse.billingAddress.region).to.be.eq(
    omsOrderResponse.customerCountyRegion
  );
  expect(ctOrderResponse.billingAddress.mobile).to.be.eq(
    omsOrderResponse.customerPhone
  );
  expect(ctOrderResponse.customerEmail).to.be.eq(
    omsOrderResponse.customerEmail
  );
  expect(ctOrderResponse.shippingAddress.firstName).to.be.eq(
    omsOrderResponse.shippingFirstName
  );
  expect(ctOrderResponse.shippingAddress.lastName).to.be.eq(
    omsOrderResponse.shippingLastName
  );
  expect(
    ctOrderResponse.shippingAddress.streetNumber +
      " " +
      ctOrderResponse.shippingAddress.streetName
  ).to.be.eq(omsOrderResponse.shippingAddressLine1);
  expect(ctOrderResponse.shippingAddress.city).to.be.eq(
    omsOrderResponse.shippingTownCity
  );
  expect(ctOrderResponse.shippingAddress.postalCode).to.be.eq(
    omsOrderResponse.shippingPostalCode
  );
  expect(ctOrderResponse.shippingAddress.country).to.be.eq(
    omsOrderResponse.shippingCountryCode
  );
  expect(ctOrderResponse.shippingAddress.email).to.be.eq(
    omsOrderResponse.shippingEmail
  );
  expect(ctOrderResponse.shippingAddress.region).to.be.eq(
    omsOrderResponse.shippingCountyRegion
  );
  expect(ctOrderResponse.shippingAddress.mobile).to.be.eq(
    omsOrderResponse.shippingPhone
  );
  let i = 0;
  ctOrderResponse.lineItems.forEach((lineItem) => {
    //as items can be saved in any order in OMS , get the one matching CT lineitem sku
    let omsOrderItem = omsOrderResponse.orderItems.filter(
      (e) => e.itemSKU == lineItem.variant.sku
    )[0];

    expect(lineItem.quantity).to.be.eq(omsOrderItem.quantity);
    expect(lineItem.variant.sku).to.be.eq(omsOrderItem.itemSKU);
    expect(lineItem.id).to.be.eq(omsOrderItem.saleItemReference);
    expect(lineItem.name["en-GB"]).to.be.eq(omsOrderItem.itemName);
    expect(lineItem.totalPrice.centAmount / 100).to.be.eq(
      omsOrderItem.itemCost * omsOrderItem.quantity
    );
    expect(lineItem.taxRate.amount).to.be.eq(omsOrderItem.vatRate);
  });
}
Then(/^User Verify saved Order details in CT$/, function () {});

Then(
  /Order status Update Response message should have/,
  function (inputTable: DataTable) {
    validateResponseJSON(response.data, inputTable);
  }
);

Then(
  /^Verify (Success|Failure|Initial) payment reference$/,
  async function (type) {
    let ctInstance = getCTInstance(world.brandId);

    await ctInstance.getPaymentById(world.paymentId);
    const ctPaymentResponse: CTPaymentResponse = world.payment;
    console.log("Payment state: " + ctPaymentResponse.transactions[0].state);
    expect(ctPaymentResponse.transactions[0].state).to.be.eq(type);
    expect(ctPaymentResponse.transactions[0].interactionId).to.be.eq(
      world.pspReference
    );
  }
);
Given(/^Order exists for (brandA)$/, function (brandId) {
  world.brandId = brandId;
  orderUpdate.orderId = "2241654221";
});
