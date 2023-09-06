import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import axios from "axios";

import { PasswordResetMessage } from "../../src/functions/password/reset";

const ebClientConfig = {
  ...(process.env.AWS_LOCAL_EVENTBRIDGE_ENDPOINT
    ? { endpoint: process.env.AWS_LOCAL_EVENTBRIDGE_ENDPOINT }
    : null),
};
const ebClient = new EventBridgeClient(ebClientConfig);
const brazeMockUrl = process.env.BRAZE_MOCK_URL;

describe("Password Reset", () => {
  const brandId = "746120b5-702d-44a1-9c7e-e8c46b3a6e17";
  const customerId = "2813ff4f-88f5-4f72-b977-1192680e6493";
  const expiry = Math.floor(new Date().getTime() / 1000);

  const payload: PasswordResetMessage = {
    newCode: "some-code",
    email: "some@email.com",
    expiry,
  };

  const expectedPayload = {
    canvas_id: "some-canvas-id",
    recipients: [
      {
        external_user_id: `${brandId}:${customerId}`,
        canvas_entry_properties: {
          url: {
            pwd_reset_url: `https://some.domain.com/reset-password?email=some@email.com&exp=${
              expiry * 1000
            }&code=some-code`,
            expiry: new Date(expiry * 1000).toISOString(),
          },
        },
        send_to_existing_only: true,
      },
    ],
  };

  beforeEach(() => sendEvent(brandId, payload));

  it("trigger a password reset email on Braze", async () => {
    assertInvocationRecord(
      200,
      { dispatch_id: "some-random-id", message: "success" },
      expectedPayload
    );
  });
});

const sendEvent = async (brandId: string, payload: PasswordResetMessage) => {
  const command = new PutEventsCommand({
    Entries: [
      {
        Time: new Date(),
        DetailType: "forgotpassword.reset.request",
        Detail: JSON.stringify({
          payload,
          metadata: {
            "x-emc-ubid": brandId,
          },
        }),
        EventBusName: "localhost-transact-bus",
      },
    ],
  });

  return await ebClient.send(command);
};

const assertInvocationRecord = async (
  expectedStatusCode: number,
  expectedResponse,
  expectedRequestBody
) => {
  let assertedInvocationHistory = false;

  let invocationHistory;
  for (let counter = 0; counter < 1; counter++) {
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
    expect(latestInvocation.request.body).toStrictEqual(expectedRequestBody);

    assertedInvocationHistory = true;
    break;
  }

  if (assertedInvocationHistory === false) {
    throw new Error("Failed to find invocation record");
  }
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const axiosInstance = axios.create({
  baseURL: brazeMockUrl,
});

async function getInvocationHistory() {
  const response = await axiosInstance.get(
    "/braze/invocations/history/latest/1"
  );

  return response.data;
}
