import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { sendCustomEvent } from "../../support/utils/crmHelper";
import { world } from "../../support/utils/custom.world";
import { OrderCreated } from "../../models/events/OrderCreated";
import { sleep } from "../com/CommonSteps";
import {
  generateRandomNumber,
  getCRMInstance,
  getCTInstance,
  getPrivateConfig,
  getPublicConfig,
} from "../../support/utils/helpers";
import { v4 as uuidv4 } from "uuid";
import console, { assert } from "console";
import { expect } from "chai";
import { NewsLetter } from "../../models/events/NewsLetter";
import { BrazeResponse } from "../../models/response/BrazeResponse";
import { AxiosResponse } from "axios";
import { Registration } from "../../models/events/Registration";
import { BrazeHelper } from "../../api/BrazeHelper";

Given(
  "a user signs up for a newsletter on {string} with below details",
  async function (brandId: string, inputTable: DataTable) {
    world.brandId = brandId;
    let newsletterData = inputTable.hashes()[0];
    if (newsletterData.email === "<randomUser>") {
      newsletterData.email = `autotesteverymile+${Date.now()}@gmail.com`;
      world.ramdomUser = newsletterData.email;
    } else if (newsletterData.email === "<sameUser>") {
      newsletterData.email = world.ramdomUser;
    }

    world.events["newsletter.signup.request"] = JSON.stringify(
      new NewsLetter(brandId, newsletterData)
    );
    world.logMessage = {
      event: `${world.events["newsletter.signup.request"]}`,
    };
  }
);

Given(
  "a user signs up on {string} with below details",
  function (brandId: string, inputTable: DataTable) {
    world.brandId = brandId;
    let registrationData = inputTable.hashes()[0];
    if (registrationData.email === "<randomUser>") {
      registrationData.email = `autotesteverymile+${Date.now()}@gmail.com`;
    }

    world.events["user.registered"] = JSON.stringify(
      new Registration(brandId, registrationData)
    );

    world.logMessage = {
      event: `${world.events["user.registered"]}`,
    };
  }
);

//this step must always be preceeded by a step which must set world.events[eventType]
When(
  "a {string} event is sent to {string} for {string}",
  async function (
    eventType: string,
    eventBus: string,
    brandIdentifier: string
  ) {
    let response = await sendCustomEvent(
      eventType,
      eventBus,
      world.events[eventType]
    );

    //assert on the response code
    expect(response["$metadata"].httpStatusCode).eq(200);
    expect(response.FailedEntryCount).eq(0);

    world.logMessage = {
      event_bridge_response: `${response.FailedEntryCount}`,
    };
  }
);

When(
  "a {string} user {string} at checkout",
  function (userType: string, consent: string) {
    world.userType = userType;
    world.cartMarketingPref = "not_opt_in";
    if (consent === "opts_in") world.cartMarketingPref = "opt_in";
  }
);

When("user places an order for {string}", async function (brandId: string) {
  world.brandId = brandId;

  //generate order payload by using an existing order in CT
  //Note: This order reference in config has to change if there are new fields added/deleted to order

  let ctInstance = getCTInstance(world.brandId);
  let response = await ctInstance.getOrderDetailsForOrderNumber(
    world.config[`${brandId}`].refOrderNumber
  );

  //generate payload for order.created event
  let orderCreated = new OrderCreated(brandId, response.data);

  //Modify userType, cart marketing preference as per test and a new order number
  orderCreated.payload.orderNumber = generateRandomNumber(10).toString();

  if (world.userType === "guest") {
    delete orderCreated.payload.customerId;
    orderCreated.payload.anonymousId = uuidv4();
  } else {
    orderCreated.payload.customerId = uuidv4();
  }

  orderCreated.payload.customerEmail = `autotesteverymile+${generateRandomNumber(
    10
  )}@gmail.com`;
  orderCreated.payload.custom.fields.emcUserTimeZone = "Europe/London";
  orderCreated.payload.custom.fields.emcOrderId =
    orderCreated.payload.orderNumber;

  orderCreated.payload.custom.fields.emcUserMarketingPreference =
    world.cartMarketingPref;
  orderCreated.payload.lineItems[0].name["en-GB"] = "Auto Test Item";

  console.log(JSON.stringify(orderCreated));
  world.events["order.created"] = JSON.stringify(orderCreated);

  world.logMessage = {
    event_bridge_response: `${world.events["order.created"]}`,
  };
});

//This step needs to be enhanced to assert the complete payload being sent to BRAZE when we have long running mocks available on shard
Then(
  /"(.*)" notification is sent to correct BRAZE account for "(.*)"/,
  async function (eventType: string, brand: string) {
    let brandId = world.config[`${brand}`].brandId;
    getCRMInstance(brand);

    let event = JSON.parse(world.events[eventType]);
    let email =
      world.userType === "registered"
        ? `${event.payload.customerEmail}`
        : `${event.payload.email}`;

    let lookupKey = String(world.userType).match("registered|guest")
      ? { external_ids: [`${brandId}:${event.payload.customerId}`] }
      : { email_address: `${email}` };

    sleep(10000); //introducing a sleep before query to give enough time for profile to be created in BRAZE

    let response: AxiosResponse;
    let tmp: BrazeResponse;
    response = await world[`${world.brandId}_crm`].getUserProfile(
      JSON.stringify(lookupKey)
    );
    //assert on response
    tmp = response.data;
    expect(tmp.users.length, "Check if user is in Braze").to.be.greaterThan(0);

    // console.log(response);

    switch (eventType) {
      case "order.created":
        world.brazeResponse = tmp.users[0];
        //ToDo: braze payload assertions to be made here when long running mocks are available on shard
        break;
      case "newsletter.signup.request":
        world.brazeResponse = tmp.users[0];
        //ToDo: braze payload assertions to be made here when long running mocks are available on shard
        break;
      case "user.registered":
        world.brazeResponse = tmp.users[0];
        //ToDo: braze payload assertions to be made here when long running mocks are available on shard
        break;
    }

    world.logMessage = {
      event_bridge_response: `${world.brazeResponse}`,
    };
  }
);

//ToDo:This step needs to be enhanced to assert the complete payload being sent to BRAZE when we have long running mocks available on shard
Then("order event details are correctly persisted in BRAZE", function () {
  let brandId = world.config[`${world.brandId}`].brandId;
  //add the assertions on external_id , purchases, marketing preference, timezone
  let event = JSON.parse(world.events["order.created"]);

  //ToDo: compute alias for guest users
  let external_id =
    world.userType === "guest"
      ? `${brandId}:${event.payload.id}`
      : `${brandId}:${event.payload.customerId}`;

  if (world.userType === "registered") {
    expect(world.brazeResponse.external_id).eq(external_id);
  } else {
    //ToDo: assert on user alias
  }

  expect(world.brazeResponse.time_zone).eq(
    event.payload.custom.fields.emcUserTimeZone
  );

  //ToDo:change this to a loop to cater for orders with more items
  expect(world.brazeResponse.purchases[0].name).eq(
    event.payload.lineItems[0].name["en-GB"]
  );
});

Then("user is {string} in BRAZE", function (marketingPref: string) {
  expect(world.brazeResponse.email_subscribe).eq(marketingPref);
});

Then("user record count remains one", function () {
  expect(world.brazeResponse.users.length).eq(1);
});

Given(
  /"(newsletter|registration)" event details are correctly persisted in BRAZE/,
  async function (eventType: string) {
    console.log(eventType);
    console.log(world.brazeResponse);

    let event =
      eventType === "newsletter"
        ? JSON.parse(world.events["newsletter.signup.request"])
        : JSON.parse(world.events["user.registered"]);
    let brandId = `${event.metadata["x-emc-ubid"]}`;

    //ToDo: user_aliases -- brandId and fnv1a128 hash of customerEmail

    eventType === "newsletter"
      ? expect(world.brazeResponse.user_aliases.length).to.be.greaterThan(0)
      : expect(world.brazeResponse.user_aliases.length).eq(0);

    //language_code ,country_code, brandName -- to be read from brand config
    //ToDo:optimise below code
    let response: AxiosResponse = await getPublicConfig(brandId);
    // console.log(response.data.getPublicConfig.configMap[0].items);

    let brandName = response.data.getPublicConfig.configMap[0].items.filter(
      (e) => e.key == "brandName"
    )[0].value;

    let languageCode = response.data.getPublicConfig.configMap[0].items.filter(
      (e) => e.key == "languageCode"
    )[0].value;

    let getPrivateConfigResponse: AxiosResponse = await getPrivateConfig(
      brandId
    );

    let countryCode =
      getPrivateConfigResponse.data.getPrivateConfig.externalProviders
        .filter((e) => e.type == "BRAZE")[0]
        .providerConfigs.filter(
          (e) => e.key == "default-country-code"
        )[0].value;

    expect(world.brazeResponse.custom_attributes.brand_name).eq(brandName);
    expect(world.brazeResponse.custom_attributes.language_code).eq(
      languageCode
    );
    expect(world.brazeResponse.custom_attributes.country_code).eq(countryCode);
    expect(world.brazeResponse.email).eq(event.payload.email);

    if (eventType === "newsletter")
      expect(world.brazeResponse.time_zone).eq(event.payload.timezone);
    else {
      expect(world.brazeResponse.first_name).eq(event.payload.firstName);
      expect(world.brazeResponse.last_name).eq(event.payload.lastName);
    }
  }
);
