import { Logger } from "@ei-services/services";
import { DLQClient } from "@ei-services/shared/dlq/client";
import { logger, dlqClient } from "./singletons";

describe("THE singletons module", () => {
  it("SHOULD export singleton instance of a logger", () => {
    const singletonInstance = logger;
    expect(singletonInstance).toBeDefined();
    expect(singletonInstance).toBeInstanceOf(Logger);
  });
  it("SHOULD export singleton instance of the dlq client", () => {
    const singletonInstance = dlqClient;
    expect(singletonInstance).toBeDefined();
    expect(singletonInstance).toBeInstanceOf(DLQClient);
  });
});
