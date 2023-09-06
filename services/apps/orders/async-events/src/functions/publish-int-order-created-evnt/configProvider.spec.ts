import { ebEventBusClientConfigValidator } from "./configProvider";

describe("Eb validator", () => {
  it("Throws errors where expected", () => {
    const result = ebEventBusClientConfigValidator({
      eventBusName: "ebname",
      functionName: "func",
      maxPutMessageAttempts: 3,
    });
    expect(result).toEqual({
      eventBusName: "ebname",
      functionName: "func",
      maxPutMessageAttempts: 3,
    });

    try {
      ebEventBusClientConfigValidator({ eventBusName: "name" } as any);
    } catch (e) {
      expect(e).toEqual(
        new TypeError("The type of functionName has to be a string")
      );
    }

    try {
      ebEventBusClientConfigValidator({ eventBusName: 123 } as any);
    } catch (e) {
      expect(e).toEqual(
        new TypeError("The type of eventBusName has to be a string")
      );
    }

    try {
      ebEventBusClientConfigValidator({ functionName: "123" } as any);
    } catch (e) {
      expect(e).toEqual(
        new TypeError("The type of eventBusName has to be a string")
      );
    }

    try {
      ebEventBusClientConfigValidator({
        eventBusName: "123",
        functionName: 123,
      } as any);
    } catch (e) {
      expect(e).toEqual(
        new TypeError("The type of functionName has to be a string")
      );
    }

    try {
      ebEventBusClientConfigValidator({
        eventBusName: "123",
        functionName: "232",
        maxPutMessageAttempts: "three",
      } as any);
    } catch (e) {
      expect(e).toEqual(
        new TypeError("The type of maxPutMessageAttempts has to be an integer")
      );
    }
  });
});
