import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsRequestEntry,
} from "@aws-sdk/client-eventbridge";
import { faker } from "@faker-js/faker";
import axios from "axios";

const ebClient = new EventBridgeClient({ endpoint: "http://localhost:4348" });

const maxInvocationHistoryRetrievalRetryCount = 4;

describe("trigger user registered", () => {
  it("should trigger user registered with success result", async () => {
    const brandId = "746120b5-702d-44a1-9c7e-e8c46b3a6e17";
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = "test@test.com";
    const customerId = "test";
    const correlationId = faker.datatype.uuid();

    const userRegisteredEvent = {
      version: "0",
      id: faker.datatype.uuid(),
      DetailType: "user.registered",
      Detail: JSON.stringify({
        referenced: true,
        correlationId,
        payload: {
          firstName,
          lastName,
          email,
          customerId,
        },
        metadata: {
          "x-emc-ubid": brandId,
        },
      }),
    } as PutEventsRequestEntry;

    const command = new PutEventsCommand({
      Entries: [userRegisteredEvent],
    });

    await ebClient.send(command);

    const expectedStatusCode = 201;
    const expectedResponse = {
      attributes_processed: 1,
      events_processed: 1,
      message: "success",
    };

    const expectedUserRegisteredRequest = {
      attributes: [
        {
          _update_existing_only: false,
          account_status: "active",
          account_type: "full",
          brand_name: "",
          country_code: "",
          email: email,
          email_subscribe: "subscribed",
          first_name: firstName,
          language_code: "",
          last_name: lastName,
          profile_creation_date: "2022-09-20T10:15:30Z",
          time_zone: "",
          user_alias: {
            alias_name: `${brandId}:69ipwwh87j5pybfpgxj4nig85`,
            alias_label: "user_key",
          },
        },
      ],
    };

    await assertInvocationRecord(
      expectedStatusCode,
      expectedResponse,
      expectedUserRegisteredRequest
    );
  }, 5000);
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
