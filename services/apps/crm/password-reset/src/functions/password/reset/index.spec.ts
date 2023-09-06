import { faker } from "@faker-js/faker";
import { default as resetPasswordHandler, HandlerEvent } from "./index";
import { Context as LambdaContext } from "aws-lambda/handler";
import { Logger } from "@ei-services/services";

const triggerMock = jest.fn();

jest.mock("./password-reset", () => {
  return {
    PasswordReset: jest.fn(() => {
      return {
        trigger: triggerMock,
      };
    }),
  };
});

describe("password reset handler", () => {
  beforeEach(() => jest.restoreAllMocks());

  it("should not proceed if brand id is missing", async () => {
    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.string(),
      "detail-type": "forgotpassword.reset.request",
      time: faker.datatype.string(),
      detail: {
        metadata: { "x-emc-ubid": null },
        payload: {
          email: faker.internet.email(),
          newCode: faker.datatype.uuid(),
          expiry: new Date().getTime(),
          customerId: faker.datatype.uuid(),
        },
      },
    };

    await expect(() =>
      resetPasswordHandler(event, {} as LambdaContext)
    ).rejects.toMatchSnapshot();
    expect(triggerMock).not.toHaveBeenCalled();
  });

  it("should call password reset trigger method with event payload", async () => {
    const dispatchId = faker.datatype.uuid();
    triggerMock.mockResolvedValue({ dispatch_id: dispatchId });

    const payload = {
      email: faker.internet.email(),
      newCode: faker.datatype.uuid(),
      expiry: new Date().getTime(),
      customerId: faker.datatype.uuid(),
    };

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.string(),
      "detail-type": "forgotpassword.reset.request",
      time: faker.datatype.string(),
      detail: {
        metadata: { "x-emc-ubid": faker.datatype.uuid() },
        payload,
      },
    };

    await resetPasswordHandler(event, {} as LambdaContext);

    expect(triggerMock).toHaveBeenCalledWith(
      event.detail.metadata["x-emc-ubid"],
      payload
    );
  });

  it("should log an error when message trigger fails", async () => {
    triggerMock.mockRejectedValue(new Error("some-error"));

    const loggerSpy = jest.spyOn(Logger.prototype, "error");

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.uuid(),
      "detail-type": "forgotpassword.reset.request",
      time: faker.datatype.string(),
      detail: {
        metadata: { "x-emc-ubid": faker.datatype.uuid() },
        payload: {
          email: faker.internet.email(),
          newCode: faker.datatype.uuid(),
          expiry: new Date().getTime(),
          customerId: faker.datatype.uuid(),
        },
      },
    };

    try {
      await resetPasswordHandler(event, {} as LambdaContext);
    } catch (err) {
      expect(loggerSpy).toHaveBeenCalledWith(
        "Error triggering password reset email: ",
        err
      );
    }
  });
});
