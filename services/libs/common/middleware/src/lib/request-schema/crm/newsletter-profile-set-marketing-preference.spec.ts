import { z } from "../../validator";
import { ZodError } from "zod";
import {
  newsletterProfileSetMarketingPayloadPreference,
  newsletterProfileSetMarketingPreferenceEventSchema,
} from "./newsletter-profile-set-marketing-preference";

describe("newsletterProfileSetMarketingPayloadPreference", () => {
  const goodInput = {
    timezone: "GMT",
    email: "email",
    marketingPreference: "opt_in",
    extra: "ignored",
  };

  test("good input is parsed", () => {
    const parsed =
      newsletterProfileSetMarketingPayloadPreference.parse(goodInput);

    expect(parsed).toEqual({
      timezone: "GMT",
      email: "email",
      marketingPreference: "opt_in",
    });
  });

  test.each([[{ ...goodInput, timezone: undefined }]])(
    "input omitting optional properties is parsed - i:%# - %p",
    (input) => {
      expect(
        newsletterProfileSetMarketingPayloadPreference.parse(input)
      ).toBeDefined();
    }
  );

  test.each([
    [{ ...goodInput, timezone: "not-a-tz" }],
    [{ ...goodInput, marketingPreference: "opt-around" }],
    [{ ...goodInput, marketingPreference: undefined }],
    [{ ...goodInput, email: undefined }],
  ])(
    "input violating validation rules throws zod error - i:%# - %p",
    (input) => {
      expect(() =>
        newsletterProfileSetMarketingPayloadPreference.parse(input)
      ).toThrowError(ZodError);
    }
  );
});

describe("newsletterProfileSetMarketingPreferenceEventSchema", () => {
  test("that expected properties are assignable to the event schema type", async () => {
    // this test case is just testing the type, not runtime code

    type TestNewsletterEventSchemaType = z.infer<
      typeof newsletterProfileSetMarketingPreferenceEventSchema
    >;

    // check expected properties are assignable
    const testObj: TestNewsletterEventSchemaType = {
      "detail-type": "newsletter.signup.request",
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
          marketingPreference: "opt_in",
          timezone: "",
          email: "",
        },
      },
    };

    expect(testObj).toBeDefined(); // dummy assert
  });
});
