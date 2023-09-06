import {
  After,
  AfterStep,
  Before,
  BeforeAll,
  BeforeStep,
} from "@cucumber/cucumber";
import * as log from "loglevel";
import { readFileSync } from "fs";
import { world } from "../support/utils/custom.world";

BeforeAll(function () {});

Before(async function () {
  // this.parameters.env --this is a reference to world parameters that are passed at command line
  // loads the config properties as per env
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const configProperties: any = JSON.parse(
    readFileSync(`./src/profiles/${this.parameters.env}.config.json`, "utf-8")
  );
  world.env = this.parameters.env;
  world.config = configProperties;
  world.log = log;
  world.log.setLevel(world.config.globals.testConfig.logLevel);

  //events
  world.events = {};

  //create an axios instance with default config to be shared within stepdefs of a Scenario
  // this default config will be merged with any config that is set at request level

  world.mockRequestConfigHeader = {};
  world.accessToken = {};
  world.token = {};
  world.mockRequestConfigHeader = {};
  world.accessTokenOnly = {};
  world.identityToken = {};
  world.refreshToken = {};
  world.prevAccessToken = {};
  world.prevIdentityToken = {};
  world.prevRefreshToken = {};
  world.refreshAccessToken = {};
  world.refreshIdentityToken = {};
  world.refreshAccessTokenOnly = {};
  world.prevAccessTokenOnly = {};
  world.randomUser = {};
  world.CTAccessToken = {};
  world.activeRecalcCartResponse = {};
  world.activeCartResponse = {};
});

BeforeStep(function () {
  world.logMessage = null;
});

AfterStep(function () {
  //we can check the stepStatus and can attach only if failed or log it always
  if (world.logMessage != null) {
    world.log.debug(JSON.stringify(world.logMessage, null, "\t"));
    this.attach(
      JSON.stringify(world.logMessage, null, "\t"),
      "application/json"
    );
    world.logMessage = null;
  }
});

After(function () {
  // delete contents of tmp directory
  world.mockRequestConfigHeader = {};

  //delete users cart if one exists
  // ToDo: this needs to be checked per brand
  // if(world.activeCartResponse != null){

  // }
});
