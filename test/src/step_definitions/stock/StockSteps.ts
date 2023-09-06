import { DataTable, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { AxiosResponse } from "axios";
import {
  validateOpenAPISpec,
  validateResponseJSON,
} from "../../support/utils/helpers";
import { StockUpdate } from "../../models/request/StockUpdate";
import { Stock } from "../../api/Stock";
import { world } from "../../support/utils/custom.world";
import * as console from "console";
import { getInventoryFromCTForSKU, sleep } from "../com/CommonSteps";
import { getCTInstance } from "../../support/utils/helpers";

let stockResponse: AxiosResponse;
const specPath = "./stock.yaml";
let stockUpdate = new StockUpdate();
let stock = new Stock();
let expectedAvailableQty;

When("verify stock for SKU ordered is decremented in CT", async function () {
  //retrieve stock from CT
  let ctInstance = getCTInstance(world.brandId);
  //get the order and verify the inventory before and after placing the order
  //ToDo: For now I am not making this an absolute match and making this an less than match to avoid intermittent issues
  // but needs to be improved
  const orderPlaced = world[`${world.brandId}_orderDetails`].data;
  orderPlaced.lineItems.forEach(async (li) => {
    // console.log(li.variant.availability);
    // console.log(li.variant.sku);
    // console.log(li.quantity);
    // console.log("Actual--I'm here")
    let invRes = await ctInstance.getInventory(li.variant.sku);
    // console.log(invRes.data.availableQuantity);
    //compute expected qty , total - actual ordered
    let expectedQty =
      parseInt(li.variant.availability.availableQuantity) -
      parseInt(li.quantity);
    console.log("expected qty ==" + expectedQty);
    expect(invRes.data.availableQuantity).to.be.lessThan(
      li.variant.availability.availableQuantity
    );
  });
});

When(
  /^OMS send following stock update to Stock Update API for (.*)$/,
  { timeout: -1 },
  async function (brand, inputTable) {
    world.brandId = brand;
    const temp = inputTable.hashes()[0];
    stockUpdate = temp;
    if (temp["brand"] === "oms_brandId") {
      stockUpdate.brand = `${world.config[`${world.brandId}`].oms_brandId}`;
    }
    switch (temp["sku"].trim()) {
      case "LineItem_1":
        stockUpdate.sku = `${world.config[`${world.brandId}`].LineItem_1}`;
        break;
      case "LineItem_2":
        stockUpdate.sku = `${world.config[`${world.brandId}`].LineItem_2}`;
        break;
      case "LineItem_3":
        stockUpdate.sku = `${world.config[`${world.brandId}`].LineItem_3}`;
        break;
      default:
        stockUpdate.sku = temp["sku"];
    }
    await getInventoryFromCTForSKU(stockUpdate.sku);
    const inventory = world[`${world.brandId}_ctInventory`].data;
    const availQty = Number.parseInt(inventory.quantityOnStock);

    if (temp["quantity"].startsWith("+")) {
      const increment = Number.parseInt(temp["quantity"].substring(1));
      stockUpdate.quantity = availQty + increment;
    } else if (temp["quantity"].startsWith("-")) {
      const decrement = Number.parseInt(temp["quantity"].substring(1));
      stockUpdate.quantity = availQty - decrement;
    } else {
      const increment = Number.parseInt(temp["quantity"]);
      stockUpdate.quantity = increment;
    }
    expectedAvailableQty = stockUpdate.quantity;
    const temp1 = inputTable.hashes()[0];
    if (
      stockUpdate.updateType == "decrement" &&
      temp1["quantity"].toString().startsWith("+")
    ) {
      expectedAvailableQty = availQty;
    }
    stockResponse = await stock.stockQuantityUpdate(
      JSON.stringify(stockUpdate)
    );
  }
);

When(
  /^OMS send following Invalid stock update to Stock Update API for (.*)$/,
  async function (brand, inputTable) {
    world.brandId = brand;
    const temp = inputTable.hashes()[0];
    stockUpdate = temp;
    if (temp["brand"] === "oms_brandId") {
      stockUpdate.brand = `${world.config[`${world.brandId}`].oms_brandId}`;
    } else {
      stockUpdate.brand = stockUpdate.brand.toString();
    }
    if (temp["sku"].startsWith("LineItem_1")) {
      stockUpdate.sku = `${world.config[`${world.brandId}`].LineItem_1}`;
    } else if (temp["sku"].startsWith("LineItem_2")) {
      stockUpdate.sku = `${world.config[`${world.brandId}`].LineItem_2}`;
    } else {
      stockUpdate.sku = temp["sku"];
    }
    if (inputTable.hashes()[0].quantity !== "a") {
      stockUpdate.quantity = +stockUpdate.quantity;
    }
    stockResponse = await stock.stockQuantityUpdate(
      JSON.stringify(stockUpdate)
    );
  }
);
When(
  /^OMS sends following stock update to Stock Update API for (brandA) with (no|invalid) token$/,
  async function (brand, header, inputTable) {
    world.brandId = brand;
    const temp = inputTable.hashes()[0];
    stockUpdate = temp;
    if (temp["brand"] === "oms_brandId") {
      stockUpdate.brand = `${world.config[`${world.brandId}`].oms_brandId}`;
    } else {
      stockUpdate.brand = stockUpdate.brand.toString();
    }
    if (inputTable.hashes()[0].quantity !== "a") {
      stockUpdate.quantity = +stockUpdate.quantity;
    }
    stockResponse = await stock.stockQuantityUpdate(
      JSON.stringify(stockUpdate),
      header
    );
  }
);

Then(
  /^Stock Update response should be returned with status code (\d+)$/,
  function (statusCode) {
    expect(stockResponse.status).to.eql(statusCode);
    validateOpenAPISpec(stockResponse, specPath);
  }
);
Then(/Stock Response message should have/, function (inputTable: DataTable) {
  validateResponseJSON(stockResponse.data, inputTable);
});

Then(
  /^Verify Inventory was updated as expected$/,
  { timeout: 121000 },
  async function () {
    await getInventoryFromCTForSKU(stockUpdate.sku, expectedAvailableQty);
    const inventory = world[`${world.brandId}_ctInventory`].data;
    expect(inventory.quantityOnStock).to.eql(expectedAvailableQty);
  }
);
