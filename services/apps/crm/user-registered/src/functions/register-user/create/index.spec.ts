import { faker } from "@faker-js/faker";
import userRegisteredHandler, { HandlerEvent } from "./index";
import { Context as LambdaContext } from "aws-lambda/handler";

const trackUserRegisteredMock = jest.fn();

jest.mock("./register-user-event", () => {
  return {
    RegisterUser: jest.fn(() => {
      return {
        trackRegisterUserEvent: trackUserRegisteredMock,
      };
    }),
  };
});

describe("trigger user registered", () => {
  beforeEach(() => jest.restoreAllMocks());

  it("should throw an error if brand id is missing", async () => {
    const customerId = faker.datatype.uuid();
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName);

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.string(),
      "detail-type": "user.registered",
      time: faker.datatype.string(),
      detail: {
        referenced: false,
        metadata: { "x-emc-ubid": null },
        correlationId: faker.datatype.uuid(),
        payload: {
          firstName,
          lastName,
          email,
          customerId,
        },
      },
    };
    await expect(() =>
      userRegisteredHandler(event, {} as LambdaContext)
    ).rejects.toMatchSnapshot();
  });

  it("should return a confirmation response body and passes all input fields", async () => {
    trackUserRegisteredMock.mockResolvedValue(true);

    const brandId = faker.datatype.uuid();
    const customerId = faker.datatype.uuid();
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName);

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.uuid(),
      "detail-type": "user.registered",
      time: faker.datatype.string(),
      detail: {
        referenced: false,
        metadata: { "x-emc-ubid": brandId },
        correlationId: faker.datatype.uuid(),
        payload: {
          firstName,
          lastName,
          email,
          customerId,
        },
      },
    };

    const response = await userRegisteredHandler(event, {} as LambdaContext);

    expect(response).toBe(true);
    expect(trackUserRegisteredMock).toBeCalledTimes(1);
    expect(trackUserRegisteredMock).toBeCalledWith(
      brandId,
      event.detail.payload.customerId,
      {
        email,
        first_name: firstName,
        last_name: lastName,
      }
    );
  });

  it("should throw an error when the trackRegisterUserEvent throws an error", async () => {
    trackUserRegisteredMock.mockRejectedValue(
      new Error("Error while creating user alias")
    );

    const brandId = faker.datatype.uuid();
    const customerId = faker.datatype.uuid();
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName);

    const event: HandlerEvent = {
      version: "1.0",
      id: faker.datatype.uuid(),
      "detail-type": "user.registered",
      time: faker.datatype.string(),
      detail: {
        referenced: false,
        metadata: { "x-emc-ubid": brandId },
        correlationId: faker.datatype.uuid(),
        payload: {
          firstName,
          lastName,
          email,
          customerId,
        },
      },
    };

    await expect(() =>
      userRegisteredHandler(event, {} as LambdaContext)
    ).rejects.toThrow(Error);
  });
});
