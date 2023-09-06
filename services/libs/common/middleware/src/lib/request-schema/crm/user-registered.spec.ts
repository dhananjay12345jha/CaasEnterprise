import { z } from "../../validator";
import { ZodError } from "zod";
import {
  userRegisteredEventSchema,
  userRegisteredPayloadPreference,
} from "./user-registered";

describe("userRegisteredPayloadPreference", () => {
  const goodInput = {
    customerId: "",
    firstName: "",
    lastName: "",
    email: "",
    extra: "ignored",
  };

  test("good input is parsed", () => {
    const parsed = userRegisteredPayloadPreference.parse(goodInput);

    expect(parsed).toEqual({
      customerId: "",
      firstName: "",
      lastName: "",
      email: "",
    });
  });

  test.each([
    [{ ...goodInput, customerId: undefined }],
    [{ ...goodInput, firstName: undefined }],
    [{ ...goodInput, lastName: undefined }],
    [{ ...goodInput, email: undefined }],
  ])(
    "input violating validation rules throws zod error - i:%# - %p",
    (input) => {
      expect(() => userRegisteredPayloadPreference.parse(input)).toThrowError(
        ZodError
      );
    }
  );
});

describe("userRegisteredEventSchema", () => {
  test("that expected properties are assignable to the event schema type", async () => {
    // this test case is just testing the type, not runtime code

    type TestUserRegisteredEventSchemaType = z.infer<
      typeof userRegisteredEventSchema
    >;

    // check expected properties are assignable
    const testObj: TestUserRegisteredEventSchemaType = {
      "detail-type": "user.registered",
      source: "",
      time: "",
      account: "",
      id: "",
      version: "",
      region: "",
      detail: {
        correlationId: "",
        metadata: { "x-emc-ubid": "" },
        referenced: true,
        payload: {
          customerId: "",
          firstName: "",
          lastName: "",
          email: "",
        },
      },
    };

    expect(testObj).toBeDefined(); // dummy assert
  });
});
