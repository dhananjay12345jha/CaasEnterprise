import { Context } from "aws-lambda/handler";
import { Index as InternalOrderCreatedEvent } from "@everymile-schemas/order-created";
import distribute from "./distribute";
import handler from "./index";
import mockEvent from "./__fixtures__/mockInternalEvent.json";
import mockOrderPayload from "./__fixtures__/mockOrderPayload";
import {
  getBrandConfigCachedClient,
  OMS_CONFIG_KEYS,
} from "@ei-services/brand-config";
import { resolveShippingMethodKey } from "@ei-services/services";

jest.mock("@middy/core", () => {
  return {
    __esModule: true,
    default(handler: (event: InternalOrderCreatedEvent) => Promise<void>) {
      function middyMock(event: InternalOrderCreatedEvent) {
        return handler(event);
      }
      middyMock.use = () => {
        return middyMock;
      };
      return middyMock;
    },
  };
});
jest.mock("@ei-services/brand-config");
jest.mock("./distribute");
jest.mock(
  "../../../../../../libs/services/src/lib/orders/resolveShippingMethodKey"
);

const resolveShippingMethodKeyMock = jest.mocked(resolveShippingMethodKey);
const getBrandConfigCachedClientMock = jest.mocked(getBrandConfigCachedClient);
const configProviderMock = jest.fn();

describe("THE handler", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    getBrandConfigCachedClientMock.mockReturnValueOnce({
      getProviderConfig: configProviderMock,
    } as never);
    configProviderMock.mockResolvedValueOnce({
      [OMS_CONFIG_KEYS.OMS_BRAND_ID]: "3402",
    });
    resolveShippingMethodKeyMock.mockResolvedValueOnce("NEXTDAY1");
  });

  it("SHOULD call the distribute function with the result", async () => {
    await handler(mockEvent as InternalOrderCreatedEvent, {} as Context);

    expect(distribute).toBeCalledWith({
      payload: mockOrderPayload,
      event: mockEvent,
    });
  });
});
