import newrelic from "newrelic";

type SafeAttribute = string | number | boolean;
type DefaultCustomAttributes = { brandId?: string; clientIp?: string };

export interface NewRelicCustomEvent {
  eventType: string;
  params: { [p: string]: SafeAttribute };
}

export interface NewRelicMiddlewareOptions {
  customAttributes?: { [p: string]: SafeAttribute };
  customEvents?: NewRelicCustomEvent[];
}

export function newRelic(opts: NewRelicMiddlewareOptions = {}) {
  const options = { ...opts };

  const newRelicBefore = async (request) => {
    const defaultCustomAttributes: DefaultCustomAttributes = {};

    // Http request
    if (request.event.headers) {
      defaultCustomAttributes.brandId =
        request.event.headers["x-emc-ubid"] ?? "";
      defaultCustomAttributes.clientIp =
        request.event.headers["CF-Connecting-IP"] ?? "";
    }

    // Internal EventBridge event
    if (request.event.detail && request.event.detail.metadata) {
      defaultCustomAttributes.brandId =
        request.event.detail.metadata["x-emc-ubid"] ?? "";
    }

    // Internal EventBridge proxy event
    if (request.event.detail && request.event.detail.projectKey) {
      defaultCustomAttributes.brandId = request.event.detail.projectKey ?? "";
    }

    // External event stripped off of the envelope
    if (request.event.projectKey) {
      defaultCustomAttributes.brandId = request.event.projectKey ?? "";
    }

    // Internal Adyen webhook event
    if (
      request.event.body &&
      request.event.body.notificationItems?.length > 0
    ) {
      defaultCustomAttributes.brandId =
        request.event.body.notificationItems[0]?.NotificationRequestItem
          ?.additionalData?.["metadata.brandId"] ?? "";
    }

    // Internal Webhook event
    if (request.event.body && request.event.body.brand) {
      defaultCustomAttributes.brandId = request.event.body.brand;
    }

    newrelic.addCustomAttributes({
      ...defaultCustomAttributes,
      ...options.customAttributes,
    });

    if (options.customEvents) {
      // append with every custom event
      options.customEvents.forEach((customEvent) =>
        newrelic.recordCustomEvent(customEvent.eventType, customEvent.params)
      );
    }
  };

  return {
    before: newRelicBefore,
  };
}
