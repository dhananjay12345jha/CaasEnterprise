import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { getInventoryBySku } from "./getInventoryBySku";
import { InternalCommerceServiceError } from "../errors";

jest.mock("@ei-services/commerce-tools");

describe("getInventoryBySku", () => {
  let client;

  beforeEach(() => {
    client = {
      inventory: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              version: "1",
            },
          ],
        },
      }),
    };

    jest
      .mocked(buildCommerceToolsGenericClient)
      .mockResolvedValue(client as never);
  });

  it("should throw InternalCommerceServiceError if call to CT throws", async () => {
    client.execute.mockRejectedValue(new Error("some 404 error"));

    await expect(() => getInventoryBySku("foo", "bar")).rejects.toThrow(
      InternalCommerceServiceError
    );
  });

  it("should return undefined when no result is yielded", async () => {
    client.execute.mockResolvedValue({
      statusCode: 200,
      body: {
        results: [],
      },
    });
    const response = await getInventoryBySku("foo", "bar");

    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith({
      queryArgs: {
        where: 'sku="BAR"',
      },
    });

    expect(response).toBeUndefined();
  });

  it("should construct a correct inventory entry query when a single sku is provided", async () => {
    const response = await getInventoryBySku("foo", "bar");

    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith({
      queryArgs: {
        where: 'sku="BAR"',
      },
    });

    expect(response).toStrictEqual({ id: 1, version: "1" });
  });
});
