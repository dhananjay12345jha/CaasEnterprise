import { Index as InternalOrderCreatedEvent } from "@everymile-schemas/order-created";
import {
  OMSPermanentError,
  OrderPayload,
  OMSTransientError,
} from "@ei-services/order-management-service";
import distribute from "./distribute";
import mockInternalEvent from "./__fixtures__/mockInternalEvent.json";
import mockOrderPayload from "./__fixtures__/mockOrderPayload";
import { omsClient, logger } from "./singletons";

jest.mock("./singletons");
const omsClientGetOrderMock = jest.mocked(omsClient.getOrder);
const omsClientCreateOrderMock = jest.mocked(omsClient.createOrder);
const loggerErrorMock = jest.mocked(logger.error);

describe("THE distribute function", () => {
  afterEach(() => {
    loggerErrorMock.mockClear();
  });

  describe("WHEN getOrder method of the OMS client throws", () => {
    describe("AND the error is a OMSPermanentError", () => {
      const mockPermanentError = new OMSPermanentError("test");

      beforeEach(() => {
        omsClientGetOrderMock.mockRejectedValueOnce(mockPermanentError);
      });

      it("SHOULD log the error AND rethrow it", async () => {
        await expect(() =>
          distribute({
            payload: mockOrderPayload as OrderPayload,
            event: mockInternalEvent as InternalOrderCreatedEvent,
          })
        ).rejects.toThrow(mockPermanentError);
        expect(loggerErrorMock).toHaveBeenCalledTimes(1);
        expect(loggerErrorMock).toHaveBeenCalledWith(
          `distribute#distribute ${mockPermanentError.name} - An error occurred fetching the order from OMS: ${mockPermanentError.message} - failing invocation for a retry - brandID: 3402, saleReference: 1234567`
        );
      });
    });

    describe("AND the error is a OMSTransientError", () => {
      const mockTransientError = new OMSTransientError("test");

      beforeEach(() => {
        omsClientGetOrderMock.mockRejectedValueOnce(mockTransientError);
      });

      it("SHOULD throw the same error", () => {
        return expect(
          distribute({
            payload: mockOrderPayload as OrderPayload,
            event: mockInternalEvent as InternalOrderCreatedEvent,
          })
        ).rejects.toEqual(mockTransientError);
      });
    });

    describe("AND the error is an unexpected error", () => {
      const mockUnexpectedError = new Error("test");

      beforeEach(() => {
        omsClientGetOrderMock.mockRejectedValueOnce(mockUnexpectedError);
      });

      it("SHOULD throw the same error", () => {
        return expect(
          distribute({
            payload: mockOrderPayload as OrderPayload,
            event: mockInternalEvent as InternalOrderCreatedEvent,
          })
        ).rejects.toEqual(mockUnexpectedError);
      });
    });
  });

  describe("WHEN getOrder method of the OMS client returns the stored order", () => {
    const mockStoredOrder = {
      brandID: 1,
      channelType: 1,
      status: "string",
      currencyCode: "string",
      saleReference: "string",
      shippingService: "string",
      datePurchased: "string",
      amountPaid: 1,
      customerFirstName: "string",
      customerLastName: "string",
      customerAddressLine1: "string",
      customerTownCity: "string",
      customerPostalCode: "string",
      customerCountryCode: "string",
      customerEmail: "string",
      shippingFirstName: "string",
      shippingLastName: "string",
      shippingAddressLine1: "string",
      shippingTownCity: "string",
      shippingPostalCode: "string",
      shippingCountryCode: "string",
      shippingEmail: "string",
      orderItems: [
        {
          quantity: 1,
          itemName: "string",
          itemSKU: "string",
          saleItemReference: "string",
          itemCost: 1,
          vatRate: 1,
        },
      ],
    };

    beforeEach(() => {
      omsClientGetOrderMock.mockResolvedValueOnce(mockStoredOrder);
    });

    it("SHOULD return with undefined", () => {
      return expect(
        distribute({
          payload: mockOrderPayload as OrderPayload,
          event: mockInternalEvent as InternalOrderCreatedEvent,
        })
      ).resolves.toEqual(undefined);
    });
  });

  describe("WHEN getOrder method of the OMS client returns null", () => {
    beforeEach(() => {
      omsClientGetOrderMock.mockResolvedValueOnce(null); // Order can't be found in OMS
    });

    describe("WHEN createOrder method of the OMS client throws", () => {
      describe("AND the error is a OMSPermanentError", () => {
        const mockPermanentError = new OMSPermanentError("test");

        beforeEach(() => {
          omsClientCreateOrderMock.mockRejectedValueOnce(mockPermanentError);
        });

        it("SHOULD log the error AND rethrow it", async () => {
          await expect(() =>
            distribute({
              payload: mockOrderPayload as OrderPayload,
              event: mockInternalEvent as InternalOrderCreatedEvent,
            })
          ).rejects.toThrow(mockPermanentError);
          expect(loggerErrorMock).toHaveBeenCalledTimes(1);
          expect(loggerErrorMock).toHaveBeenCalledWith(
            `distribute#distribute ${mockPermanentError.name} - An error occurred creating the order in OMS: ${mockPermanentError.message} - brandID: 3402, saleReference: 1234567`
          );
        });
      });

      describe("AND the error is a OMSTransientError", () => {
        const mockTransientError = new OMSTransientError("test");

        beforeEach(() => {
          omsClientCreateOrderMock.mockRejectedValueOnce(mockTransientError);
        });

        it("SHOULD throw the same error", () => {
          return expect(
            distribute({
              payload: mockOrderPayload as OrderPayload,
              event: mockInternalEvent as InternalOrderCreatedEvent,
            })
          ).rejects.toEqual(mockTransientError);
        });
      });

      describe("AND the error is an unexpected error", () => {
        const mockUnexpectedError = new Error("test");

        beforeEach(() => {
          omsClientCreateOrderMock.mockRejectedValueOnce(mockUnexpectedError);
        });

        it("SHOULD throw the same error", () => {
          return expect(
            distribute({
              payload: mockOrderPayload as OrderPayload,
              event: mockInternalEvent as InternalOrderCreatedEvent,
            })
          ).rejects.toEqual(mockUnexpectedError);
        });
      });
    });

    describe("WHEN createOrder method of the OMS client returns with success", () => {
      beforeEach(() => {
        omsClientCreateOrderMock.mockResolvedValueOnce({
          foo: "bar",
        });
      });

      it("SHOULD return with undefined", () => {
        return expect(
          distribute({
            payload: mockOrderPayload as OrderPayload,
            event: mockInternalEvent as InternalOrderCreatedEvent,
          })
        ).resolves.toEqual(undefined);
      });
    });
  });
});
