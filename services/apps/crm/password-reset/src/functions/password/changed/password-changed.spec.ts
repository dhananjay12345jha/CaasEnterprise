import { faker } from "@faker-js/faker";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

import { BrazeClient } from "@ei-services/braze-service";
import {
  BrandConfigCachedClient,
  BRAZE_CONFIG_KEYS,
} from "@ei-services/brand-config";
import { EndpointType, EndpointScope } from "@everymile-idp/brand-config-sdk";

import { PasswordChanged } from "./password-changed";
import { AssertionError } from "node:assert/strict";

jest.mock("@ei-services/braze-service");

jest.useFakeTimers();
const date = new Date("2022-10-30T22:01:20");
jest.setSystemTime(date);

beforeEach(() => {
  jest.resetAllMocks();
});

describe("PasswordChanged", () => {
  const brandId = faker.datatype.uuid();
  const customerId = faker.datatype.uuid();
  const canvasId = faker.datatype.uuid();
  const countryCode = faker.datatype.string();
  const appGroup = faker.datatype.string();
  const apiKey = faker.datatype.string();
  const apiUrl = faker.internet.url();
  const email = "some@email.com";

  const axiosMock = new MockAdapter(axios);

  it("should call braze with the relevant payload to trigger password changed email", async () => {
    jest
      .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
      .mockResolvedValueOnce({
        [BRAZE_CONFIG_KEYS.API_KEY]: apiKey,
        [BRAZE_CONFIG_KEYS.API_BASE_URL]: apiUrl,
        [BRAZE_CONFIG_KEYS.DEFAULT_COUNTRY_CODE]: countryCode,
        [BRAZE_CONFIG_KEYS.PASSWORD_RESET_CANVAS_ID]: "4234234242",
        [BRAZE_CONFIG_KEYS.PASSWORD_UPDATED_CANVAS_ID]: canvasId,
        [BRAZE_CONFIG_KEYS.API_APP_GROUP_WEB]: appGroup,
      });

    jest
      .spyOn(BrandConfigCachedClient.prototype, "getPublicConfig")
      .mockResolvedValueOnce({
        getPublicConfig: {
          brand: {
            brandId,
            etld: "some-brand-domain",
            tenantId: "some-id",
          },
        },
      });

    jest
      .spyOn(BrandConfigCachedClient.prototype, "getRoutingConfig")
      .mockResolvedValueOnce({
        getRoutingConfig: {
          publicEndpoints: [
            {
              brandId,
              type: EndpointType.WebStorefront,
              url: "https://www.some-storefront-url.com",
              endpointScope: EndpointScope.Public,
            },
          ],
        },
      });

    const brazeClientMock = jest.spyOn(
      BrazeClient.prototype,
      "canvasTriggerSend"
    );

    axiosMock
      .onPost("/canvas/trigger/send")
      .reply(200, { dispatch_id: "some-id" });
    const instance = new PasswordChanged();

    await instance.trigger(brandId, {
      customerId,
    });

    expect(brazeClientMock).toBeCalledWith({
      canvas_id: canvasId,
      recipients: [
        {
          external_user_id: `${brandId}:${customerId}`,
          canvas_entry_properties: {
            action: {
              updated_at: "2022-10-30T22:01:20.000Z",
            },
          },
          send_to_existing_only: true,
        },
      ],
    });
  });

  it("should throw error if braze config not defined brand config", async () => {
    jest
      .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
      .mockResolvedValueOnce({});

    jest
      .spyOn(BrandConfigCachedClient.prototype, "getPublicConfig")
      .mockResolvedValueOnce({
        getPublicConfig: {
          brand: {
            brandId,
            etld: "some-brand-domain",
            tenantId: "some-id",
          },
        },
      });

    const instance = new PasswordChanged();

    const triggerPromise = instance.trigger(brandId, {
      customerId,
    });

    await expect(triggerPromise).rejects.toThrowError(AssertionError);
    await expect(triggerPromise).rejects.toThrowError(
      "Expected 'api-key' from brand config to be defined"
    );

    const brazeSpy = jest.mocked(BrazeClient);
    expect(brazeSpy).not.toBeCalled();
  });
});
