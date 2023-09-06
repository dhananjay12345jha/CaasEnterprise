import { faker } from "@faker-js/faker";
import { default as passwordChangedHandler, HandlerEvent } from "./index";
import { Context as LambdaContext } from "aws-lambda/handler";
import { Logger } from "@ei-services/services";

const triggerMock = jest.fn();

jest.mock("./password-changed", () => {
  return {
    PasswordChanged: jest.fn(() => {
      return {
        trigger: triggerMock,
      };
    }),
  };
});

describe("password changed handler", () => {
  beforeEach(() => jest.restoreAllMocks());

  it("should not proceed if brand id is missing", async () => {
    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.string(),
      "detail-type": "forgotpassword.reset.completed",
      time: faker.datatype.string(),
      detail: {
        metadata: { "x-emc-ubid": null },
        payload: {
          customerId: faker.datatype.uuid(),
        },
      },
    };

    await expect(() =>
      passwordChangedHandler(event, {} as LambdaContext)
    ).rejects.toMatchSnapshot();

    expect(triggerMock).not.toHaveBeenCalled();
  });

  it("should call password changed trigger method with event payload", async () => {
    const dispatchId = faker.datatype.uuid();
    triggerMock.mockResolvedValue({ dispatch_id: dispatchId });

    const payload = {
      customerId: faker.datatype.uuid(),
    };

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.string(),
      "detail-type": "forgotpassword.reset.completed",
      time: faker.datatype.string(),
      detail: {
        metadata: { "x-emc-ubid": faker.datatype.uuid() },
        payload,
      },
    };

    await passwordChangedHandler(event, {} as LambdaContext);

    expect(triggerMock).toHaveBeenCalledWith(
      event.detail.metadata["x-emc-ubid"],
      payload
    );
  });

  it("should log an error when email trigger fails", async () => {
    triggerMock.mockRejectedValue(new Error("some-error"));

    const loggerSpy = jest.spyOn(Logger.prototype, "error");

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.uuid(),
      "detail-type": "forgotpassword.reset.completed",
      time: faker.datatype.string(),
      detail: {
        metadata: { "x-emc-ubid": faker.datatype.uuid() },
        payload: {
          customerId: faker.datatype.uuid(),
        },
      },
    };

    try {
      await passwordChangedHandler(event, {} as LambdaContext);
    } catch (err) {
      expect(loggerSpy).toHaveBeenCalledWith(
        "Error triggering password changed email: ",
        err
      );
    }
  });
});
