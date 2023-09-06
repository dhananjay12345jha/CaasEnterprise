import { Logger } from "@ei-services/services";
import { OMSClient } from "@ei-services/order-management-service";
import { omsClient, logger } from "./singletons";

describe("THE singletons module", () => {
  it("SHOULD export singleton instance of a logger", () => {
    const singletonInstance = logger;
    expect(singletonInstance).toBeDefined();
    expect(singletonInstance).toBeInstanceOf(Logger);
  });

  it("SHOULD export singleton instance of the oms client", () => {
    const singletonInstance = omsClient;
    expect(singletonInstance).toBeDefined();
    expect(singletonInstance).toBeInstanceOf(OMSClient);
  });
});
