import { faker } from "@faker-js/faker";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

import { BrazeClient } from "@ei-services/braze-service";
import {
  BrandConfigCachedClient,
  BRAZE_CONFIG_KEYS,
} from "@ei-services/brand-config";
import { EndpointType, EndpointScope } from "@everymile-idp/brand-config-sdk";

import { PasswordReset } from "./password-reset";
import { AssertionError } from "node:assert/strict";

jest.mock("@ei-services/braze-service");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("PasswordReset", () => {
  const brandId = faker.datatype.uuid();
  const customerId = faker.datatype.uuid();
  const code = faker.datatype.uuid();
  const canvasId = faker.datatype.uuid();
  const countryCode = faker.datatype.string();
  const appGroup = faker.datatype.string();
  const apiKey = faker.datatype.string();
  const apiUrl = faker.internet.url();
  const email = "some@email.com";

  const expiry = Math.floor(new Date().getTime() / 1000);

  const axiosMock = new MockAdapter(axios);

  it("should call braze with the relevant payload to trigger reset email", async () => {
    jest
      .spyOn(BrandConfigCachedClient.prototype, "getProviderConfig")
      .mockResolvedValueOnce({
        [BRAZE_CONFIG_KEYS.API_KEY]: apiKey,
        [BRAZE_CONFIG_KEYS.API_BASE_URL]: apiUrl,
        [BRAZE_CONFIG_KEYS.DEFAULT_COUNTRY_CODE]: countryCode,
        [BRAZE_CONFIG_KEYS.PASSWORD_RESET_CANVAS_ID]: canvasId,
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
    const instance = new PasswordReset();

    await instance.trigger(brandId, {
      email,
      newCode: code,
      expiry,
      customerId,
    });

    expect(brazeClientMock).toBeCalledWith({
      canvas_id: canvasId,
      recipients: [
        {
          external_user_id: `${brandId}:${customerId}`,
          canvas_entry_properties: {
            url: {
              pwd_reset_url: `https://www.some-storefront-url.com/reset-password/reset?email=some%40email.com&exp=${expiry}&code=${code}`,
              expiry: new Date(expiry * 1000).toISOString(),
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

    const instance = new PasswordReset();

    const triggerPromise = instance.trigger(brandId, {
      email,
      newCode: code,
      expiry,
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
