import * as newrelic from "newrelic";
import { newRelic, NewRelicCustomEvent } from "./";

jest.mock("newrelic");

describe("newRelicMiddleware", () => {
  beforeEach(() => jest.resetAllMocks());

  const brandId = "1768c82a-2269-4e12-8090-63aaf9c56726";
  const clientIP = "192.168.1.1";

  describe("before()", () => {
    it("calls NR with default set of custom attributes", () => {
      newRelic().before({
        event: { headers: {} },
      });

      expect(newrelic.addCustomAttributes).toHaveBeenCalledTimes(1);
      expect(newrelic.addCustomAttributes).toBeCalledWith({
        brandId: "",
        clientIp: "",
      });

      expect(newrelic.recordCustomEvent).not.toHaveBeenCalled();
    });

    it("calls NR with default set of custom attributes if eventbridge internal event", () => {
      newRelic().before({
        event: { detail: { metadata: { "x-emc-ubid": "some-brand-id" } } },
      });

      expect(newrelic.addCustomAttributes).toHaveBeenCalledTimes(1);
      expect(newrelic.addCustomAttributes).toBeCalledWith({
        brandId: "some-brand-id",
      });

      expect(newrelic.recordCustomEvent).not.toHaveBeenCalled();
    });

    it("calls NR with default set of custom attributes if eventbridge proxy event", () => {
      newRelic().before({
        event: { detail: { projectKey: "some-brand-id" } },
      });

      expect(newrelic.addCustomAttributes).toHaveBeenCalledTimes(1);
      expect(newrelic.addCustomAttributes).toBeCalledWith({
        brandId: "some-brand-id",
      });

      expect(newrelic.recordCustomEvent).not.toHaveBeenCalled();
    });

    it("calls NR with default set of custom attributes if the external event is already stripped of of the envelope", () => {
      newRelic().before({
        event: { projectKey: "some-brand-id" },
      });

      expect(newrelic.addCustomAttributes).toHaveBeenCalledTimes(1);
      expect(newrelic.addCustomAttributes).toBeCalledWith({
        brandId: "some-brand-id",
      });

      expect(newrelic.recordCustomEvent).not.toHaveBeenCalled();
    });

    it("calls NR with default set of custom attributes if internal Adyen webhook event", () => {
      newRelic().before({
        event: {
          body: {
            notificationItems: [
              {
                NotificationRequestItem: {
                  additionalData: {
                    "metadata.brandId": "some-brand-id",
                  },
                },
              },
            ],
          },
        },
      });

      expect(newrelic.addCustomAttributes).toHaveBeenCalledTimes(1);
      expect(newrelic.addCustomAttributes).toBeCalledWith({
        brandId: "some-brand-id",
      });

      expect(newrelic.recordCustomEvent).not.toHaveBeenCalled();
    });

    it("calls NR with default set of custom attributes if internal webhook event", () => {
      newRelic().before({
        event: { body: { brand: "some-brand-id" } },
      });

      expect(newrelic.addCustomAttributes).toHaveBeenCalledTimes(1);
      expect(newrelic.addCustomAttributes).toBeCalledWith({
        brandId: "some-brand-id",
      });

      expect(newrelic.recordCustomEvent).not.toHaveBeenCalled();
    });

    it("will append additional custom attributes to the NR call when those are provided upon middy injection", () => {
      newRelic({
        customAttributes: { additionalCustomAttribute: "value123" },
      }).before({
        event: {
          headers: { "x-emc-ubid": brandId, "CF-Connecting-IP": clientIP },
        },
      });

      expect(newrelic.addCustomAttributes).toHaveBeenCalledTimes(1);
      expect(newrelic.addCustomAttributes).toBeCalledWith({
        brandId: brandId,
        clientIp: clientIP,
        additionalCustomAttribute: "value123",
      });

      expect(newrelic.recordCustomEvent).not.toHaveBeenCalled();
    });

    it("will record custom events to NR when those are provided upon middy injection", () => {
      const customEvents: NewRelicCustomEvent[] = [
        {
          eventType: "signInEvent",
          params: { username: "userName", password: "pa$$word" },
        },
        {
          eventType: "vipUserSignIn",
          params: { category: "VIP_TOP_10" },
        },
      ];
      newRelic({
        customEvents,
      }).before({
        event: {
          headers: { "x-emc-ubid": brandId, "CF-Connecting-IP": clientIP },
        },
      });

      expect(newrelic.recordCustomEvent).toHaveBeenCalledTimes(
        customEvents.length
      );

      customEvents.forEach((customEvent, index) =>
        expect(newrelic.recordCustomEvent).toHaveBeenNthCalledWith(
          index + 1,
          customEvent.eventType,
          customEvent.params
        )
      );

      expect(newrelic.addCustomAttributes).toHaveBeenCalledTimes(1);
      expect(newrelic.addCustomAttributes).toBeCalledWith({
        brandId: brandId,
        clientIp: clientIP,
      });
    });
  });
});
