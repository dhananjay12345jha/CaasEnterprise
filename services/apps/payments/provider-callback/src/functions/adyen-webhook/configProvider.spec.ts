import { dlqClientConfigValidator } from "./configProvider";

describe("DLQ", () => {
  it("Throws errors where expected", () => {
    const result = dlqClientConfigValidator({ region: "region", url: "url" });
    expect(result).toEqual({
      region: "region",
      url: "url",
    });

    try {
      dlqClientConfigValidator({ region: "region" } as any);
    } catch (e) {
      expect(e).toEqual(new TypeError("The type of url has to be a string"));
    }

    try {
      dlqClientConfigValidator({ region: 123 } as any);
    } catch (e) {
      expect(e).toEqual(new TypeError("The type of region has to be a string"));
    }

    try {
      dlqClientConfigValidator({ region: "123", url: 233 });
    } catch (e) {
      expect(e).toEqual(new TypeError("The type of url has to be a string"));
    }

    try {
      dlqClientConfigValidator({ url: "123" } as any);
    } catch (e) {
      expect(e).toEqual(new TypeError("The type of region has to be a string"));
    }
  });
});
