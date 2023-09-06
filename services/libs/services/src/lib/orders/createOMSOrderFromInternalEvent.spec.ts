import { Index as InternalOrderCreatedEvent } from "@everymile-schemas/order-created";
import {
  getBrandConfigCachedClient,
  OMS_CONFIG_KEYS,
} from "@ei-services/brand-config";
import mockInternalEvent from "./__fixtures__/mockInternalEvent.json";
import mockOrderPayload from "./__fixtures__/mockOrderPayload";
import createOMSOrderFromInternalEvent, {
  CT_STATUS,
  OMS_STATUS,
  transformCentPrecisionMoney,
  resolveBrandID,
  transformStatus,
  transformAmountPaid,
  transformShippingCost,
  transformAddressLine1,
  transformAddressLine2,
  transformOrderItemsItemName,
  transformOrderItemsItemCost,
  transformOrderItems,
} from "./createOMSOrderFromInternalEvent";
import resolveShippingMethodKey from "./resolveShippingMethodKey";

jest.mock("@ei-services/brand-config");
jest.mock("./resolveShippingMethodKey");

const resolveShippingMethodKeyMock = jest.mocked(resolveShippingMethodKey);
const getBrandConfigCachedClientMock = jest.mocked(getBrandConfigCachedClient);
const configProviderMock = jest.fn();

const {
  detail: { payload, metadata },
} = mockInternalEvent as InternalOrderCreatedEvent;

beforeAll(() => {
  jest.restoreAllMocks();
  jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));
});

afterAll(() => jest.useRealTimers());

describe("THE createOMSOrderFromInternalEvent module", () => {
  describe("THE transformCentPrecisionMoney transformer function", () => {
    it("SHOULD transform CT cent precision money type", () => {
      expect(
        transformCentPrecisionMoney({
          centAmount: 1234567,
          fractionDigits: 2,
        })
      ).toBe(12345.67);
    });
  });

  describe("THE resolveBrandID function", () => {
    beforeEach(() => {
      getBrandConfigCachedClientMock.mockReturnValueOnce({
        getProviderConfig: configProviderMock,
      } as never);
      configProviderMock.mockResolvedValueOnce({
        [OMS_CONFIG_KEYS.OMS_BRAND_ID]: "3402",
      });
    });

    it("SHOULD resolve the brandID property AND invoke the config provider", async () => {
      const brandID = await resolveBrandID("emc-ubib");

      expect(brandID).toBe(3402);
      expect(configProviderMock).toHaveBeenCalledWith(
        "emc-ubib",
        ["oms-emc-brand-id"],
        "OMS"
      );
    });
  });

  describe("THE transformStatus transformer function", () => {
    describe("WHEN status is recognisable", () => {
      it("SHOULD transform the status property", () => {
        expect(transformStatus(CT_STATUS)).toBe(OMS_STATUS);
      });
    });

    describe("WHEN status is not recognisable", () => {
      it("SHOULD throw", () => {
        expect(() => transformStatus("Cancelled")).toThrow(
          'The status of the order is not recognised. The recognisable status is "Open" but received "Cancelled".'
        );
      });
    });
  });

  describe("THE transformAmountPaid transformer function", () => {
    it("SHOULD transform the amountPaid property", () => {
      expect(
        transformAmountPaid({
          centAmount: 1234567,
          fractionDigits: 2,
        })
      ).toBe(12345.67);
    });
  });

  describe("THE transformShippingCost transformer function", () => {
    it("SHOULD transform the shippingCost property", () => {
      expect(
        transformShippingCost({
          centAmount: 1234567,
          fractionDigits: 2,
        })
      ).toBe(12345.67);
    });
  });

  describe("THE transformAddressLine1 transformer function", () => {
    describe("WHEN the pOBox property is null", () => {
      const pOBox = null;

      describe("AND the streetNumber is null and the streetName is not null", () => {
        const streetNumber = null;
        const streetName = "Heaven St";
        const apartment = "1";
        const building = "A";

        it("SHOULD transform the addressLine1 property", () => {
          expect(
            transformAddressLine1(
              pOBox,
              apartment,
              building,
              streetNumber,
              streetName
            )
          ).toBe("1 A Heaven St");
        });
      });

      describe("AND the pOBox streetNumber is not null and the streetName is null", () => {
        const streetNumber = "111";
        const streetName = null;
        const apartment = "1";
        const building = "A";

        it("SHOULD transform the addressLine1 property", () => {
          expect(
            transformAddressLine1(
              pOBox,
              apartment,
              building,
              streetNumber,
              streetName
            )
          ).toBe("1 A 111");
        });
      });
    });

    describe("WHEN the pOBox property is not null", () => {
      const pOBox = "FOO";
      const streetNumber = null;
      const streetName = null;
      const apartment = null;
      const building = null;

      it("SHOULD transform the addressLine1 property", () => {
        expect(
          transformAddressLine1(
            pOBox,
            apartment,
            building,
            streetNumber,
            streetName
          )
        ).toBe("FOO");
      });
    });
  });

  describe("THE transformAddressLine2 transformer function", () => {
    describe("AND the additionalStreetInfo property is null", () => {
      const additionalStreetInfo = null;
      const additionalAddressInfo = "BAR";
      const state = "BAZ";

      it("SHOULD transform the addressLine2 property", () => {
        expect(
          transformAddressLine2(
            additionalStreetInfo,
            additionalAddressInfo,
            state
          )
        ).toBe("BAR, BAZ");
      });
    });

    describe("AND the additionalAddressInfo property is null", () => {
      const additionalStreetInfo = "FOO";
      const additionalAddressInfo = null;
      const state = "BAZ";

      it("SHOULD transform the addressLine2 property", () => {
        expect(
          transformAddressLine2(
            additionalStreetInfo,
            additionalAddressInfo,
            state
          )
        ).toBe("FOO, BAZ");
      });
    });

    describe("AND the state property is null", () => {
      const additionalStreetInfo = "FOO";
      const additionalAddressInfo = "BAR";
      const state = null;

      it("SHOULD transform the addressLine2 property", () => {
        expect(
          transformAddressLine2(
            additionalStreetInfo,
            additionalAddressInfo,
            state
          )
        ).toBe("FOO, BAR");
      });
    });

    describe("AND the additionalStreetInfo and additionalAddressInfo property are null", () => {
      const additionalStreetInfo = null;
      const additionalAddressInfo = null;
      const state = "BAZ";

      it("SHOULD transform the addressLine2 property", () => {
        expect(
          transformAddressLine2(
            additionalStreetInfo,
            additionalAddressInfo,
            state
          )
        ).toBe("BAZ");
      });
    });

    describe("AND the additionalStreetInfo and state property are null", () => {
      const additionalStreetInfo = null;
      const additionalAddressInfo = "BAR";
      const state = null;

      it("SHOULD transform the addressLine2 property", () => {
        expect(
          transformAddressLine2(
            additionalStreetInfo,
            additionalAddressInfo,
            state
          )
        ).toBe("BAR");
      });
    });

    describe("AND the additionalAddressInfo and state property are null", () => {
      const additionalStreetInfo = "FOO";
      const additionalAddressInfo = null;
      const state = null;

      it("SHOULD transform the addressLine2 property", () => {
        expect(
          transformAddressLine2(
            additionalStreetInfo,
            additionalAddressInfo,
            state
          )
        ).toBe("FOO");
      });
    });

    describe("AND the additionalStreetInfo, additionalAddressInfo and state property are all null", () => {
      const additionalStreetInfo = null;
      const additionalAddressInfo = null;
      const state = null;

      it("SHOULD transform the addressLine2 property", () => {
        expect(
          transformAddressLine2(
            additionalStreetInfo,
            additionalAddressInfo,
            state
          )
        ).toBe("");
      });
    });

    describe("AND the additionalStreetInfo, additionalAddressInfo and state property are all set", () => {
      const additionalStreetInfo = "FOO";
      const additionalAddressInfo = "BAR";
      const state = "BAZ";

      it("SHOULD transform the addressLine2 property", () => {
        expect(
          transformAddressLine2(
            additionalStreetInfo,
            additionalAddressInfo,
            state
          )
        ).toBe("FOO, BAR, BAZ");
      });
    });
  });

  describe("THE transformOrderItemsItemName transformer function", () => {
    describe("WHEN the locale is know", () => {
      const knownLocale = "en-GB";

      it("SHOULD transform the itemName property of an order item", () => {
        expect(transformOrderItemsItemName({ [knownLocale]: "foo" })).toBe(
          "foo"
        );
      });
    });

    describe("WHEN the locale is not known", () => {
      const unknownLocale = "en-US";

      it("SHOULD throw", () => {
        expect(() =>
          transformOrderItemsItemName({ [unknownLocale]: "foo" })
        ).toThrow(new Error(`Unknown locale: ${unknownLocale}`));
      });
    });
  });

  describe("THE transformOrderItemsItemCost transformer function", () => {
    it("HOULD transform the itemCost property of an order item", () => {
      expect(
        transformOrderItemsItemCost({
          centAmount: 1234567,
          fractionDigits: 2,
        })
      ).toBe(12345.67);
    });
  });

  describe("THE transformOrderItems transformer function", () => {
    it("HOULD transform the itemCost property of an order item", () => {
      expect(transformOrderItems(payload.lineItems)).toEqual([
        {
          itemCost: 12,
          itemName: "Red Shoe Size 1",
          itemSKU: "red-shoe-size-1",
          quantity: 12,
          saleItemReference: "661f24ea-751c-4362-aefa-8db5826ce0de",
          vatRate: 0.2,
        },
      ]);
    });
  });

  describe("THE createOMSOrderFromInternalEvent function", () => {
    beforeEach(() => {
      resolveShippingMethodKeyMock.mockResolvedValueOnce("STD1");
      getBrandConfigCachedClientMock.mockReturnValueOnce({
        getProviderConfig: configProviderMock,
      } as never);
      configProviderMock.mockResolvedValueOnce({
        [OMS_CONFIG_KEYS.OMS_BRAND_ID]: "3402",
      });
    });

    it(
      "SHOULD map the incoming event to the OMS payload " +
        "AND invoke the shipping key resolver " +
        "AND invoke the config provider",
      async () => {
        const omsPayload = await createOMSOrderFromInternalEvent({
          payload,
          metadata,
        });

        expect(omsPayload).toStrictEqual(mockOrderPayload);
        expect(resolveShippingMethodKeyMock).toHaveBeenCalledWith(
          "441f706c-7cae-4abb-9510-92f795ff82c7",
          undefined
        );
        expect(configProviderMock).toHaveBeenCalledWith(
          "emc-ubib",
          ["oms-emc-brand-id"],
          "OMS"
        );
      }
    );
  });
});
