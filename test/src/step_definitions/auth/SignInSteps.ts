import { Auth } from "../../api/Auth";
import { SignIn } from "../../models/request/SignIn";
import { world } from "../../support/utils/custom.world";
import {
  deleteUserDetails,
  generateRandomUser,
  generateRequestPayload,
  getAUserFromAUserPool,
  getPrivateIdentityProviderConfig,
  getUserDetails,
} from "../../support/utils/authHelpers";
import {
  validateOpenAPISpec,
  validateResponseJSON,
} from "../../support/utils/helpers";
import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { AxiosResponse } from "axios";
import { expect } from "chai";

const auth = new Auth();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let signInReq: SignIn = new SignIn();
let signInResponse: AxiosResponse;

Given(
  /user signs in successfully to '(.*)' with newly created details/,
  async function (brandId: string) {
    signInResponse = await auth.signInRegisteredUser(
      world.config.globals.testConfig.authAPIVersion,
      JSON.stringify(world.signInReq)
    );
    expect(signInResponse.status).to.be.eq(200);
    world.token = "Bearer " + signInResponse.data?.accessToken;
  }
);

Given("auth mock is configured to return a {int} response", function (int) {
  world.mockRequestConfigHeader = { headers: { Prefer: "code=" + int } };
});

Given(
  /a user (.*) in (.*) user pool/,
  async function (flag: string, brandId: string, inputTable: DataTable) {
    world.brandId = brandId;
    signInReq = inputTable.hashes()[0];

    if (signInReq.password.includes("fromConfig")) {
      signInReq.password = world.config[`${brandId}`].password;
    }

    if (
      signInReq.username == "randomUser" ||
      signInReq.username.includes("fromCode")
    ) {
      // const user = generateRandomUser();
      const user = `autotesteverymile+${Date.now()}@gmail.com`;
      world.ramdomUser = user;
      signInReq.username = world.ramdomUser;

      //create user and return
      let signUpReq = {
        username: `${signInReq.username}`,
        password: `${signInReq.password}`,
      };
      let signUpResponse = await auth.signupAUser(JSON.stringify(signUpReq));

      expect(signUpResponse.status).to.be.eq(200);

      world.signUpReq = signUpReq;

      return;
    } else if (signInReq.username == "sameUser") {
      signInReq.username = world.ramdomUser;
    }

    //check if the user is in the user pool, if not call sign-up to create a user
    const identityProviderResponse = await getPrivateIdentityProviderConfig(
      world.config[`${brandId}_brandId`]
    );
    const userPoolId =
      identityProviderResponse.data.getPrivateConfig.identityProvider
        .userPoolId;

    let users = await getAUserFromAUserPool(
      userPoolId,
      `email = "${signInReq.username}"`
    );

    if (flag.trim().startsWith("exists")) {
    } else {
      if (users != undefined && users.Users != undefined) {
        if (flag.trim() == "does not exist") {
          if (users.Users.length > 0) {
            const deletedUser = await deleteUserDetails(
              userPoolId,
              signInReq.username
            );
            users = await getAUserFromAUserPool(
              userPoolId,
              `email = "${signInReq.username}"`
            );
            world.log.debug("deleting user : " + signInReq.username);
          }
          expect(users.Users.length).is.eq(0);
        } else {
          if (users.Users.length < 1) {
            world.log.debug(
              "User is not in user pool, sign up before continuing"
            );

            let signUpReq = {
              username: `${signInReq.username}`,
              password: `${signInReq.password}`,
            };
            let signUpResponse = await auth.signupAUserWithGuestToken(
              JSON.stringify(signUpReq),
              { token: `${world.token}` }
            );

            expect(signUpResponse).to.be.eq(200);
          } else world.log.debug("User is in user pool, continuing");
        }
      }
    }
  }
);

Then(
  /following user should (exist|not exist) in (brandA|brandB) user pool/,
  async function (flag: string, brandId: string, inputTable: DataTable) {
    //check if the user is in the user pool, if not call sign-up to create a user
    const identityProviderResponse = await getPrivateIdentityProviderConfig(
      world.config[`${brandId}_brandId`]
    );
    const userPoolId =
      identityProviderResponse.data.getPrivateConfig.identityProvider
        .userPoolId;
    signInReq = inputTable.hashes()[0];
    if (signInReq.username == "sameUser") {
      signInReq.username = world.ramdomUser;
    }
    const users = await getAUserFromAUserPool(
      userPoolId,
      `email = "${signInReq.username}"`
    );

    flag.trim() == "not exist"
      ? expect(users.Users.length).is.eq(0)
      : expect(users.Users.length).is.greaterThan(0);
  }
);

When(
  /the (above|same) user attempts to signin to the (.*)$/,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function (_param1: string, brandId) {
    world.brandId = brandId.trim();
    signInResponse = await auth.signInRegisteredUser(
      world.config.globals.testConfig.authAPIVersion,
      JSON.stringify(signInReq)
    );
  }
);

Then(
  /^user is(.*)signed in successfully (|and fails )with status code (\d+)$/,
  async function (flag: string, text: string, statusCode: number) {
    validateOpenAPISpec(signInResponse, `auth-api-public.yaml`);
    if (flag.trim() == "not") {
      expect(signInResponse.status).to.be.eq(statusCode);
    } else {
      expect(signInResponse.status).to.be.eq(statusCode);

      //retrieve the auth token to be used by other steps
      const responseObject = signInResponse.data;

      world.token = `Bearer ${responseObject?.accessToken}`;

      if (world.accessToken[world.brandId] !== null) {
        world.prevAccessToken[world.brandId] = world.accessToken[world.brandId];
        world.prevAccessTokenOnly[world.brandId] =
          world.accessTokenOnly[world.brandId];
        world.prevRefreshToken[world.brandId] =
          world.refreshToken[world.brandId];
      }

      world.accessToken[world.brandId] = responseObject?.accessToken;
      world.accessTokenOnly[world.brandId] =
        responseObject?.accessToken.split(":")[0];
      world.refreshToken[world.brandId] = responseObject?.refreshToken;

      //retrieve the user details from cognito using the accessToken--this confirms signin is successful
      const response = await getUserDetails(
        world.accessTokenOnly[world.brandId]
      );
      expect(response.UserAttributes).is.not.empty;
      world.logMessage = {
        accessToken: `${world.accessTokenOnly[world.brandId]}`,
        request: "GetUserDetails",
        response: response.UserAttributes,
      };
    }
  }
);

Given(
  /user tries to signin to (.*) with below details/,
  async function (brandId: string, inputTable: DataTable) {
    world.brandId = brandId;
    signInReq = inputTable.hashes()[0];
    if (signInReq.password.includes("fromConfig")) {
      signInReq.password = world.config[`${brandId}`].password;
    }

    if (signInReq.username.includes("fromCode")) {
      signInReq.username = world.ramdomUser;
    }

    if (world.isGuest) {
      signInResponse = await auth.signInAUserWithGuestToken(
        JSON.stringify(signInReq),
        { token: `${world.token.trim()}` }
      );
    } else
      signInResponse = await auth.signInRegisteredUser(
        world.config.globals.testConfig.authAPIVersion,
        JSON.stringify(signInReq)
      );
  }
);

Given(
  /User signed into (.*) with below details/,
  async function (brandId: string, inputTable: DataTable) {
    world.brandId = brandId;
    signInReq = inputTable.hashes()[0];
    if (signInReq.password.includes("fromConfig")) {
      signInReq.password = world.config[`${brandId}`].password;
    }
    signInResponse = await auth.signInRegisteredUser(
      world.config.globals.testConfig.authAPIVersion,
      JSON.stringify(signInReq)
    );
  }
);
Given(
  /user tries to signin to (.*) with below invalid details/,
  async function (brandId: string, inputbody: string) {
    world.brandId = brandId;
    signInResponse = await auth.signInRegisteredUser(
      world.config.globals.testConfig.authAPIVersion,
      inputbody
    );
  }
);

When(
  "user tries to signin to {string} version with below details",
  async function (ver: string, inputTable: DataTable) {
    const inputbody: string = await generateRequestPayload(
      new SignIn(),
      inputTable
    );
    signInResponse = await auth.signInRegisteredUser(ver, inputbody);
  }
);

Then("the signin response has below details", function (inputTable: DataTable) {
  validateResponseJSON(signInResponse.data, inputTable);
});

Then(/^Access token for (.*) is valid$/, async function (brandId: string) {
  const identityProviderResponse = await getPrivateIdentityProviderConfig(
    world.config[`${brandId}`].brandId
  );
  const userPoolId =
    identityProviderResponse.data.getPrivateConfig.identityProvider.userPoolId;
  const clientId =
    identityProviderResponse.data.getPrivateConfig.identityProvider.clientId;
  const verifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    tokenUse: "access",
    clientId: clientId,
  });

  try {
    await verifier.verify(world.accessTokenOnly[brandId]);
  } catch (e) {
    throw e.message;
  }
});

Then(/^SignIn Response message should have$/, function (inputTable) {
  validateResponseJSON(signInResponse.data, inputTable);
});
Given(/^Guest user request tokens for (.*)$/, async function (brandId: string) {
  world.brandId = brandId;
  signInResponse = await auth.signInAnonymousUser(
    world.config.globals.testConfig.authAPIVersion
  );
  expect(signInResponse.status).to.be.eq(200);
  world.token = " Bearer " + signInResponse.data?.accessToken;
});

Given(
  /^user signed in to (.*) with below details$/,
  async function (brandId: string, inputTable: DataTable) {
    world.brandId = brandId;
    if (world.env === "local") {
      world.token = "Bearer faketoken2";
    } else {
      signInReq = inputTable.hashes()[0];
      if (signInReq.password.includes("fromConfig")) {
        signInReq.password = world.config[`${brandId}`].password;
      }
      signInResponse = await auth.signInRegisteredUser(
        world.config.globals.testConfig.authAPIVersion,
        JSON.stringify(signInReq)
      );
      expect(signInResponse.status).to.be.eq(200);
      world.token = " Bearer " + signInResponse.data?.accessToken;
    }
  }
);
