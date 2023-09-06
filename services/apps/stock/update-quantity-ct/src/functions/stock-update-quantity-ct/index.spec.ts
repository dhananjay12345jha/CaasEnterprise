import { v4 as uuid } from "uuid";
import { Context as LambdaContext } from "aws-lambda/handler";

import { default as updateQuantityCT, HandlerEvent } from "./index";
import * as enterpriseIntegrationServices from "@ei-services/services";
import { UPDATE_TYPE } from "@ei-services/common/middleware";

jest.mock("@ei-services/services");

describe("updateQuantityCT handler", () => {
  const mockedGetInventoryBySku = jest.spyOn(
    enterpriseIntegrationServices,
    "getInventoryBySku"
  );
  const mockedUpdateInventoryQuantity = jest.spyOn(
    enterpriseIntegrationServices,
    "updateInventoryQuantity"
  );
  let event: HandlerEvent;
  beforeEach(
    () =>
      (event = {
        version: "0",
        id: uuid(),
        "detail-type": "stock.quantity.updated",
        source: "emc.stock-quantity-updates-sandbox-stockQuantityUpdateWebhook",
        account: "100207810817",
        time: "2022-09-13T17:38:29Z",
        region: "eu-west-1",
        resources: [],
        detail: {
          payload: {
            sku: "handwash-regular",
            quantity: 2,
            updateType: UPDATE_TYPE.INCREMENT,
            time: "2022-06-14T09:35:29.373Z",
          },
          metadata: {
            "x-emc-ubid": "7a733796-ae2c-4032-89f7-24d4c4179612",
            "x-amzn-RequestId": "YaLzHhv8DoEEJJw=",
            "x-lambda-RequestId": "9fd015fc-716f-4481-9dbb-a384489fad52",
          },
        },
      })
  );

  afterEach(() => jest.clearAllMocks());

  describe("when update type is increment", () => {
    it("should not make requests if brand id is missing", async () => {
      event.detail.metadata["x-emc-ubid"] = null;
      try {
        await updateQuantityCT(event, {} as LambdaContext);
        expect("1").toEqual(0);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
      expect(mockedGetInventoryBySku).not.toHaveBeenCalled();
      expect(mockedUpdateInventoryQuantity).not.toHaveBeenCalled();
    });

    it("should not make requests if sku is missing", async () => {
      event.detail.payload.sku = null;

      await expect(() =>
        updateQuantityCT(event, {} as LambdaContext)
      ).rejects.toMatchSnapshot();
      expect(mockedGetInventoryBySku).not.toHaveBeenCalled();
      expect(mockedUpdateInventoryQuantity).not.toHaveBeenCalled();
    });

    it("should not make requests if quantity is missing", async () => {
      event.detail.payload.quantity = null;
      try {
        await updateQuantityCT(event, {} as LambdaContext);
        expect("1").toEqual(0);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
      expect(mockedGetInventoryBySku).not.toHaveBeenCalled();
      expect(mockedUpdateInventoryQuantity).not.toHaveBeenCalled();
    });

    it("should not make requests if updateType is missing", async () => {
      event.detail.payload.updateType = null;
      try {
        await updateQuantityCT(event, {} as LambdaContext);
        expect("1").toEqual(0);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
      expect(mockedGetInventoryBySku).not.toHaveBeenCalled();
      expect(mockedUpdateInventoryQuantity).not.toHaveBeenCalled();
    });

    it("should not make an update request if inventory record is not found", async () => {
      mockedGetInventoryBySku.mockResolvedValueOnce(undefined);
      await updateQuantityCT(event, {} as LambdaContext);
      expect(mockedGetInventoryBySku).toHaveBeenCalled();
      expect(mockedUpdateInventoryQuantity).not.toHaveBeenCalled();
    });

    it("should throw an error if updateInventoryQuantity fails", async () => {
      mockedGetInventoryBySku.mockResolvedValueOnce({
        id: "1",
        version: 1,
        availableQuantity: 1,
        sku: "handwash-regular",
        createdAt: "2021-06-14T09:35:29.373Z",
        lastModifiedAt: "2021-06-14T09:35:29.373Z",
        quantityOnStock: 1,
      });
      mockedUpdateInventoryQuantity.mockRejectedValueOnce(
        new Error("updateInventoryQuantity error")
      );
      await expect(() =>
        updateQuantityCT(event, {} as LambdaContext)
      ).rejects.toThrow("updateInventoryQuantity error");
    });

    it("should call updateInventoryQuantity when event format is correct", async () => {
      mockedGetInventoryBySku.mockResolvedValueOnce({
        id: "1",
        version: 1,
        availableQuantity: 1,
        sku: "handwash-regular",
        createdAt: "2021-06-14T09:35:29.373Z",
        lastModifiedAt: "2021-06-14T09:35:29.373Z",
        quantityOnStock: 1,
      });
      await updateQuantityCT(event, {} as LambdaContext);
      expect(mockedGetInventoryBySku).toHaveBeenCalledTimes(1);
      expect(mockedUpdateInventoryQuantity).toHaveBeenCalledTimes(1);
    });
  });

  describe("when update type is decrement", () => {
    beforeEach(() => {
      event.detail.payload.updateType = UPDATE_TYPE.DECREMENT;
    });

    it("should not call updateInventoryQuantity if event update quantity is greater than inventory entry quantity", async () => {
      mockedGetInventoryBySku.mockResolvedValueOnce({
        id: "1",
        version: 1,
        availableQuantity: 1,
        sku: "handwash-regular",
        createdAt: "2021-06-14T09:35:29.373Z",
        lastModifiedAt: "2021-06-16T09:35:29.373Z",
        quantityOnStock: 1,
      });
      await updateQuantityCT(event, {} as LambdaContext);
      expect(mockedGetInventoryBySku).toHaveBeenCalled();
      expect(mockedUpdateInventoryQuantity).not.toHaveBeenCalled();
    });

    it("should not call updateInventoryQuantity if inventory entry quantity is already 0", async () => {
      event.detail.payload.quantity = 0;
      mockedGetInventoryBySku.mockResolvedValueOnce({
        id: "1",
        version: 1,
        availableQuantity: 0,
        sku: "handwash-regular",
        createdAt: "2021-06-14T09:35:29.373Z",
        lastModifiedAt: "2021-06-16T09:35:29.373Z",
        quantityOnStock: 0,
      });
      await updateQuantityCT(event, {} as LambdaContext);
      expect(mockedGetInventoryBySku).toHaveBeenCalled();
      expect(mockedUpdateInventoryQuantity).not.toHaveBeenCalled();
    });

    it("should call updateInventoryQuantity if event update timestamp is newer than inventory entry last modified timestamp and event update quantity is greater than inventory entry quantity", async () => {
      mockedGetInventoryBySku.mockResolvedValueOnce({
        id: "1",
        version: 1,
        availableQuantity: 3,
        sku: "handwash-regular",
        createdAt: "2021-06-14T09:35:29.373Z",
        lastModifiedAt: "2021-06-12T09:35:29.373Z",
        quantityOnStock: 3,
      });
      await updateQuantityCT(event, {} as LambdaContext);
      expect(mockedGetInventoryBySku).toHaveBeenCalled();
      expect(mockedUpdateInventoryQuantity).toHaveBeenCalled();
    });
  });
});
