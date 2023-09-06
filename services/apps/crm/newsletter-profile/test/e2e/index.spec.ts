import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsRequestEntry,
} from "@aws-sdk/client-eventbridge";
import { UserEvent, UserPurchase } from "@ei-services/braze-service";
import { faker } from "@faker-js/faker";
import axios from "axios";

const ebClient = new EventBridgeClient({ endpoint: "http://localhost:4340" });

const maxInvocationHistoryRetrievalRetryCount = 4;

describe("trigger create newsletter profile", () => {
  it("should trigger create newsletter profile with success result", async () => {
    const brandId = "746120b5-702d-44a1-9c7e-e8c46b3a6e17";
    const brazeDefaultCountryCode = "GB";
    const timezone = faker.datatype.string();
    const email = "test@test.com";
    const marketingPreference = "opt_in";
    const newsletterSignupRequestMessageId = faker.datatype.uuid();

    const expectedUserAlias = {
      alias_name: `${brandId}:665ocufch1x4zax8l6syjv42c`,
      alias_label: "user_key",
    };

    const newsletterSignupMessage = {
      timezone: timezone,
      email: email,
      marketingPreference: marketingPreference,
    };

    const orderCreatedEvent = {
      version: "0",
      id: newsletterSignupRequestMessageId,
      DetailType: "newsletter.signup.request",
      Detail: JSON.stringify({
        referenced: true,
        correlationId: faker.datatype.uuid(),
        payload: newsletterSignupMessage,
        metadata: {
          "x-emc-ubid": brandId,
        },
      }),
    } as PutEventsRequestEntry;

    const command = new PutEventsCommand({
      Entries: [orderCreatedEvent],
    });

    await ebClient.send(command);

    const expectedStatusCode = 201;
    const expectedResponse = {
      attributes_processed: 1,
      events_processed: 1,
      message: "success",
    };

    const expectedNewsletterProfileCreationRequest = {
      attributes: [
        {
          external_id: null,
          user_alias: expectedUserAlias,
          email: newsletterSignupMessage.email,
          language_code: "",
          brand_name: "",
          country_code: brazeDefaultCountryCode,
          time_zone: newsletterSignupMessage.timezone,
          email_subscribe: "Opted-in",
          account_type: "newsletter",
          _update_existing_only: false,
          profile_creation_date: expect.any(String),
        },
      ],
      purchases: [] as UserPurchase[],
      events: [] as UserEvent[],
    };

    await assertInvocationRecord(
      expectedStatusCode,
      expectedResponse,
      expectedNewsletterProfileCreationRequest
    );
  });

  it("should trigger create newsletter profile for registered user with failed result", async () => {
    const brandId = "746120b5-702d-44a1-9c7e-e8c46b3a6e18";

    const brazeDefaultCountryCode = "GB";
    const timezone = faker.datatype.string();
    const email = "test@test.com";
    const marketingPreference = "opt_in";
    const newsletterSignupRequestMessageId = faker.datatype.uuid();

    const expectedUserAlias = {
      alias_name: `${brandId}:665ocufch1x4zax8l6syjv42c`,
      alias_label: "user_key",
    };

    const newsletterSignupMessage = {
      timezone: timezone,
      email: email,
      marketingPreference: marketingPreference,
    };

    const orderCreatedEvent = {
      version: "0",
      id: newsletterSignupRequestMessageId,
      DetailType: "newsletter.signup.request",
      Detail: JSON.stringify({
        referenced: true,
        correlationId: faker.datatype.uuid(),
        payload: newsletterSignupMessage,
        metadata: {
          "x-emc-ubid": brandId,
        },
      }),
    } as PutEventsRequestEntry;

    const command = new PutEventsCommand({
      Entries: [orderCreatedEvent],
    });

    await ebClient.send(command);

    const expectedStatusCode = 201;
    const expectedResponse = {
      message: "400 Bad Request",
      errors: {
        items: [
          {
            type: "400 Bad Request",
            input_array: "400 Bad Request",
            index: 0,
          },
        ],
      },
    };

    const expectedNewsletterProfileCreationRequest = {
      attributes: [
        {
          external_id: null,
          user_alias: expectedUserAlias,
          email: newsletterSignupMessage.email,
          language_code: "",
          brand_name: "",
          country_code: brazeDefaultCountryCode,
          time_zone: newsletterSignupMessage.timezone,
          email_subscribe: "Opted-in",
          account_type: "newsletter",
          account_status: null,
          _update_existing_only: false,
          profile_creation_date: expect.any(String),
        },
      ],
      purchases: [] as UserPurchase[],
      events: [] as UserEvent[],
    };

    await assertInvocationRecord(
      expectedStatusCode,
      expectedResponse,
      expectedNewsletterProfileCreationRequest
    );
  });
});

async function assertInvocationRecord(
  expectedStatusCode: number,
  expectedResponse,
  expectedRequestBody
) {
  let assertedInvocationHistory = false;

  let invocationHistory;
  for (
    let counter = 0;
    counter < maxInvocationHistoryRetrievalRetryCount;
    counter++
  ) {
    await delay(1000);
    invocationHistory = await getInvocationHistory();

    if (!invocationHistory || invocationHistory.invocations?.length === 0) {
      continue;
    }

    const latestInvocation = invocationHistory.invocations[0];

    expect(latestInvocation.response.statusCode).toBe(expectedStatusCode);
    expect(latestInvocation.response.response.value).toStrictEqual(
      expectedResponse
    );
    expect(latestInvocation.request.body).toEqual(
      expect.objectContaining(expectedRequestBody)
    );

    assertedInvocationHistory = true;
    break;
  }

  if (assertedInvocationHistory === false) {
    throw new Error("Failed to find invocation record");
  }
}

// Requires min. NodeJS v16.6.0
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const brazeMockBaseURL = process.env.BRAZE_MOCK_URL || "";
const axiosInstance = axios.create({
  baseURL: brazeMockBaseURL,
});

async function getInvocationHistory() {
  const response = await axiosInstance.get(
    "/braze/invocations/history/latest/1"
  );

  return response.data;
}
