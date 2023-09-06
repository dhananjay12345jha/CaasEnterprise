import { Index as InternalOrderCreatedEvent } from "@everymile-schemas/order-created";
import mockEvent from "./__fixtures__/mockEvent.json";
import DLQClient from "./shared-dlq-client";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const MockedSQSClient: jest.Mock = <jest.Mock<SQSClient>>SQSClient;
const mockDLQURL = "http://foo.com/bar";
const mockDLQRegion = "qw-erty-1";

jest.mock("@aws-sdk/client-sqs");

describe("THE DLQ client", () => {
  describe("THE publish method", () => {
    it("SHOULD call the send method of the native client with the right parameters", async () => {
      const instance = new DLQClient({
        url: mockDLQURL,
        region: mockDLQRegion,
      });
      await instance.publish({
        event: mockEvent as InternalOrderCreatedEvent,
        rejectionReason: { errorMessage: "Foo", errorName: "Bar" },
      });
      expect(SendMessageCommand).toBeCalledWith({
        MessageBody: JSON.stringify({
          event: mockEvent,
          rejectionReason: { errorMessage: "Foo", errorName: "Bar" },
        }),
        QueueUrl: mockDLQURL,
      });
      expect(MockedSQSClient.prototype.send).toBeCalledTimes(1);
      expect(MockedSQSClient.prototype.send.mock.calls[0][0]).toBeInstanceOf(
        SendMessageCommand
      );
    });
  });
});
