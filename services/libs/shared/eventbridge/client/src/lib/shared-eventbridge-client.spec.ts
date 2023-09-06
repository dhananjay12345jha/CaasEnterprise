import {
  getEventBridgeClient,
  sendCustomEvents,
} from "./shared-eventbridge-client";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

describe("sharedEventbridgeClient", () => {
  const region = "eu-west-1";
  const mockResponse = {
    $metadata: {
      attempts: 1,
    },
    Entries: [
      {
        Detail: "test",
      },
    ],
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("should send a custom event to eventbridge", async () => {
    try {
      const client: EventBridgeClient = await getEventBridgeClient({ region });
      client.send = jest.fn().mockResolvedValue(mockResponse);

      const input = {
        Entries: [
          {
            Detail: "test",
          },
        ],
      };
      const command = new PutEventsCommand(input);
      const data = await sendCustomEvents(client, command);

      expect(data).toBe(mockResponse);
    } catch (e) {
      throw new Error(e.message);
    }
  });
});
