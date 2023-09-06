import EBEventBusClient from "./EBEventBusClient";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { Detail } from "@everymile-schemas/order-created";
import mockInternalEvent from "./__fixtures__/mockInternalEvent.json";

jest.mock("@aws-sdk/client-eventbridge");
const MockedEventBridgeClient = <jest.Mock<EventBridgeClient>>EventBridgeClient;
const MockedPutEventsCommand = <jest.Mock<PutEventsCommand>>PutEventsCommand;

describe("THE EventBridgeClient client", () => {
  let eventBridgeClient;

  beforeEach(() => {
    eventBridgeClient = new EBEventBusClient({
      eventBusName: "foo",
      functionName: "bar",
      maxPutMessageAttempts: 1,
    }) as jest.Mocked<EBEventBusClient>;
  });

  afterEach(() => {
    MockedEventBridgeClient.prototype.send.mockClear();
  });

  describe("THE constructor", () => {
    it("SHOULD create an oms client instance", () => {
      expect(eventBridgeClient).toBeInstanceOf(EBEventBusClient);
    });
  });

  describe("THE pushEventBridgeMessage method", () => {
    afterEach(() => {
      MockedPutEventsCommand.mockClear();
    });

    it("SHOULD call the send method of the aws sdk client with the right parameters", async () => {
      await eventBridgeClient.pushEventBridgeMessage(
        mockInternalEvent.detail as Detail
      );
      expect(MockedPutEventsCommand).toBeCalledTimes(1);
      expect(MockedPutEventsCommand).toBeCalledWith({
        Entries: [
          {
            EventBusName: "foo",
            Source: "emc.bar",
            DetailType: "order.created",
            Detail: JSON.stringify(mockInternalEvent.detail),
          },
        ],
      });
      expect(MockedEventBridgeClient.prototype.send).toBeCalledTimes(1);
    });
  });
});
