import { Logger } from "@ei-services/services";
import { logger } from "./singletons";

describe("THE singletons module", () => {
  it("SHOULD export singleton instance of a logger", () => {
    const singletonInstance = logger;
    expect(singletonInstance).toBeDefined();
    expect(singletonInstance).toBeInstanceOf(Logger);
  });
});
