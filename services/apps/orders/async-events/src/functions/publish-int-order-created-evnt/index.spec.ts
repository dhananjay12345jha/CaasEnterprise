import { Context } from "aws-lambda/handler";
import { Index as InternalOrderCreatedEvent } from "@everymile-schemas/order-created";
import handler, { CTProxyEventBridgeEvent } from "./index";
import mockProxyEvent from "./__fixtures__/mockProxyEvent.json";
import mockInternalEvent from "./__fixtures__/mockInternalEvent.json";
import { ebEventBusClient } from "./singletons";

jest.mock("@middy/core", () => {
  return {
    __esModule: true,
    default(handler: (event: InternalOrderCreatedEvent) => Promise<void>) {
      function middyMock(event: InternalOrderCreatedEvent) {
        return handler(event);
      }
      middyMock.use = () => {
        return middyMock;
      };
      return middyMock;
    },
  };
});
jest.mock("./singletons");
const pushEventBridgeMessageMock = jest.mocked(
  ebEventBusClient.pushEventBridgeMessage
);

describe("THE handler", () => {
  describe("WHEN the record gets processed without an error", () => {
    it(
      "SHOULD call the pushEventBridgeMessage method of the EBEventBusClient with the result " +
        "AND return no messageIds",
      async () => {
        const result = await handler(
          mockProxyEvent as CTProxyEventBridgeEvent,
          {} as Context
        );

        expect(pushEventBridgeMessageMock).toBeCalledTimes(1);
        expect(pushEventBridgeMessageMock).toBeCalledWith(
          mockInternalEvent.detail
        );
        expect(result).toBeUndefined();
      }
    );
  });

  describe("WHEN processing a record of the batch throws", () => {
    beforeEach(() => {
      pushEventBridgeMessageMock.mockRejectedValueOnce(new Error("test"));
    });

    afterEach(() => {
      pushEventBridgeMessageMock.mockRestore();
    });

    it("SHOULD throw", () => {
      return expect(() =>
        handler(mockProxyEvent as CTProxyEventBridgeEvent, {} as Context)
      ).rejects.toEqual(new Error("test"));
    });
  });
});
