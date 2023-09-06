import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import resolveShippingMethodKey from "./resolveShippingMethodKey";

const buildCommerceToolsGenericClientMock = jest.mocked(
  buildCommerceToolsGenericClient
);

jest.mock("@ei-services/commerce-tools");

let clientMock: { execute: jest.Mock };
let clientBuilderMock: {
  get: jest.Mock;
  shippingMethods: jest.Mock;
  withId: jest.Mock;
};

beforeEach(() => {
  jest.restoreAllMocks();
  clientMock = {
    execute: jest.fn(),
  };
  clientBuilderMock = {
    shippingMethods: jest.fn().mockReturnThis(),
    withId: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnValueOnce(clientMock),
  };
  buildCommerceToolsGenericClientMock.mockResolvedValueOnce(
    clientBuilderMock as never
  );
  clientMock.execute.mockResolvedValueOnce({ body: { key: "STD1" } });
});

it("SHOULD resolve the shipping method key", async () => {
  const resolvedKey = await resolveShippingMethodKey("brand-1", {
    typeId: "shipping-method",
    id: "ship-id",
  });

  expect(resolvedKey).toBe("STD1");
});

it("SHOULD call the commerce tools client methods", async () => {
  await resolveShippingMethodKey("brand-1", {
    typeId: "shipping-method",
    id: "ship-id",
  });

  expect(clientBuilderMock.shippingMethods).toHaveBeenCalledWith();
  expect(clientBuilderMock.withId).toHaveBeenCalledWith({ ID: "ship-id" });
  expect(clientBuilderMock.get).toHaveBeenCalledWith();
  expect(clientMock.execute).toHaveBeenCalledWith();
});
