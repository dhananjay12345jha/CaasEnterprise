import { faker } from "@faker-js/faker";
import {
  default as setNewsletterProfileMarketingPreferenceHandler,
  HandlerEvent,
} from "./index";
import { Context as LambdaContext } from "aws-lambda/handler";

const setMarketingPreferenceMock = jest.fn();

jest.mock("./create-newsletter-profile", () => {
  return {
    NewsletterProfile: jest.fn(() => {
      return {
        setMarketingPreference: setMarketingPreferenceMock,
      };
    }),
  };
});

describe("trigger set marketing preference of newsletter profile handler", () => {
  beforeEach(() => jest.restoreAllMocks());

  it("should throw an error if brand id is missing", async () => {
    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.string(),
      "detail-type": "newsletter.signup.request",
      time: faker.datatype.string(),
      detail: {
        referenced: false,
        metadata: { "x-emc-ubid": null },
        correlationId: faker.datatype.uuid(),
        payload: {
          email: faker.internet.email(),
          marketingPreference: "opt_in",
          timezone: faker.datatype.string(),
        },
      },
    };

    await expect(() =>
      setNewsletterProfileMarketingPreferenceHandler(event, {} as LambdaContext)
    ).rejects.toMatchSnapshot();
  });

  it("should return a confirmation response body and passes all input fields", async () => {
    setMarketingPreferenceMock.mockResolvedValue(true);

    const brandId = faker.datatype.uuid();

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.uuid(),
      "detail-type": "newsletter.signup.request",
      time: faker.datatype.string(),
      detail: {
        referenced: false,
        metadata: { "x-emc-ubid": brandId },
        correlationId: faker.datatype.uuid(),
        payload: {
          email: faker.internet.email(),
          marketingPreference: "opt_in",
          timezone: "Europe/London",
        },
      },
    };

    await setNewsletterProfileMarketingPreferenceHandler(
      event,
      {} as LambdaContext
    );

    expect(setMarketingPreferenceMock).toBeCalledTimes(1);
    expect(setMarketingPreferenceMock).toBeCalledWith(
      brandId,
      event.detail.payload,
      event.time
    );
  });

  it("should throw an error when the setMarketingPreference throws an error", async () => {
    setMarketingPreferenceMock.mockRejectedValue(
      new Error("Error while triggering")
    );

    const brandId = faker.datatype.uuid();

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.uuid(),
      "detail-type": "newsletter.signup.request",
      time: faker.datatype.string(),
      detail: {
        referenced: false,
        metadata: { "x-emc-ubid": brandId },
        correlationId: faker.datatype.uuid(),
        payload: {
          email: faker.internet.email(),
          marketingPreference: "opt_in",
          timezone: "Europe/London",
        },
      },
    };

    await expect(() =>
      setNewsletterProfileMarketingPreferenceHandler(event, {} as LambdaContext)
    ).rejects.toThrow(Error);
  });
});
