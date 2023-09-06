import { buildCommerceToolsGenericClient } from "@ei-services/commerce-tools";
import { updateInventoryQuantity } from "./updateInventoryQuantity";
import { InternalCommerceServiceError } from "../errors";

jest.mock("@ei-services/commerce-tools");

describe("updateInventoryQuantity", () => {
  let client;

  beforeEach(() => {
    client = {
      inventory: jest.fn().mockReturnThis(),
      withId: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: {
          id: "test",
          version: 2,
        },
      }),
    };

    jest
      .mocked(buildCommerceToolsGenericClient)
      .mockResolvedValue(client as any);
  });

  it("should throw InternalCommerceServiceError if call to CT throws", async () => {
    client.execute.mockRejectedValue(new Error("some 404 error"));

    await expect(() =>
      updateInventoryQuantity("foo", "bar", 1, 10)
    ).rejects.toThrow(InternalCommerceServiceError);
  });

  it("should construct a correct inventory quantity update when brand id, inventory id, current version and quantity are provided", async () => {
    const response = await updateInventoryQuantity("foo", "bar", 1, 10);

    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenCalledWith({
      body: {
        version: 1,
        actions: [
          {
            action: "changeQuantity",
            quantity: 10,
          },
        ],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ id: "test", version: 2 });
  });
});
