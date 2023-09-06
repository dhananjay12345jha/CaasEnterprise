import EventBridgeClient from "./EBEventBusClient";
import { Logger } from "@ei-services/services";
import { ebEventBusClient, logger } from "./singletons";

describe("THE singletons module", () => {
  it("SHOULD export singleton instance of a logger", () => {
    const singletonInstance = logger;
    expect(singletonInstance).toBeDefined();
    expect(singletonInstance).toBeInstanceOf(Logger);
  });

  it("SHOULD export singleton instance of the eventbridge client", () => {
    const singletonInstance = ebEventBusClient;
    expect(singletonInstance).toBeDefined();
    expect(singletonInstance).toBeInstanceOf(EventBridgeClient);
  });
});
