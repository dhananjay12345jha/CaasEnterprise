import createInternalEventFromProxyEvent from "./createInternalEventFromProxyEvent";
import { CTExternalOrderResource } from "../interfaces";
import mockInternalEvent from "./__fixtures__/mockInternalEvent.json";
import mockCTOrderResource from "./__fixtures__/mockCTOrderResource.json";

describe("THE createInternalEventFromExternalEvent function", () => {
  it("SHOULD create the internal event from the external event", () => {
    expect(
      createInternalEventFromProxyEvent({
        ctOrder: mockCTOrderResource as CTExternalOrderResource,
        brandID: "441f706c-7cae-4abb-9510-92f795ff82c7",
        correlationId: "7e92293e-0637-5013-a517-5c207243a481",
      })
    ).toStrictEqual(mockInternalEvent.detail);
  });

  it("SHOULD create the internal event with datalake property used fo tagging", () => {
    expect(
      createInternalEventFromProxyEvent({
        ctOrder: mockCTOrderResource as CTExternalOrderResource,
        brandID: "441f706c-7cae-4abb-9510-92f795ff82c7",
        correlationId: "7e92293e-0637-5013-a517-5c207243a481",
      })
    ).toHaveProperty("datalake");
  });

  describe("WHEN some of the properties have null value", () => {
    const origCustomerEmail = mockCTOrderResource.customerEmail;

    beforeEach(() => {
      mockCTOrderResource.customerEmail = null;
    });

    afterEach(() => {
      mockCTOrderResource.customerEmail = origCustomerEmail;
    });

    it("SHOULD purge the properties with null value", () => {
      expect(
        createInternalEventFromProxyEvent({
          ctOrder: mockCTOrderResource as CTExternalOrderResource,
          brandID: "441f706c-7cae-4abb-9510-92f795ff82c7",
          correlationId: "7e92293e-0637-5013-a517-5c207243a481",
        })
      ).not.toHaveProperty("customerEmail");
    });
  });
});
