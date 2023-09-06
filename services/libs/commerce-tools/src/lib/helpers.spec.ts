import { CT_AUTH_TYPES, buildCTPApiBuilder } from "./api-builder";
import {
  EXTERNAL_PROVIDER_TYPES,
  getBrandConfigCachedClient,
  CT_CONFIG_KEYS,
} from "@ei-services/brand-config";
import {
  buildCommerceToolsClient,
  buildCommerceToolsGenericClient,
  generateCartHash,
} from "./helpers";
import { Cart, LineItem } from "@commercetools/platform-sdk";

jest.mock("./api-builder");
jest.mock("@ei-services/brand-config");

describe("CommerceTools helpers", () => {
  afterEach(jest.resetAllMocks);

  describe("buildCommerceToolsClient()", () => {
    it("assembles correct params for buildCTPApiBuilder() call and resolves with CT sdk client instance", async () => {
      const brandId = "some-brand-id";
      const accessToken = "s3cretTokenValue";

      const config = {
        [CT_CONFIG_KEYS.PROJECT_KEY]: "project-key-value",
        [CT_CONFIG_KEYS.API_URL]: "http://some-api-url.com/",
        [CT_CONFIG_KEYS.REGION]: "eu",
      };

      const getProviderConfigMock = jest.fn().mockResolvedValue(config);

      jest.mocked(getBrandConfigCachedClient).mockReturnValue({
        getProviderConfig: getProviderConfigMock,
      } as any);

      const expectedCTClientInstance = { super: "duper" };
      const withProjectKeyMock = jest
        .fn()
        .mockReturnValue(expectedCTClientInstance);

      const buildCTPApiBuilderMock = jest
        .mocked(buildCTPApiBuilder)
        .mockReturnValue({
          withProjectKey: withProjectKeyMock,
        } as any);

      const client = await buildCommerceToolsClient(brandId, accessToken);

      expect(getProviderConfigMock).toHaveBeenCalledTimes(1);
      expect(getProviderConfigMock).toHaveBeenCalledWith(
        brandId,
        Object.keys(config),
        EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
      );

      expect(buildCTPApiBuilderMock).toHaveBeenCalledTimes(1);
      expect(buildCTPApiBuilderMock).toHaveBeenCalledWith({
        projectKey: config[CT_CONFIG_KEYS.PROJECT_KEY],
        apiHost: config[CT_CONFIG_KEYS.API_URL],
        region: config[CT_CONFIG_KEYS.REGION],
        authType: CT_AUTH_TYPES.EXISTING_TOKEN,
        accessToken,
      });

      expect(withProjectKeyMock).toHaveBeenCalledTimes(1);
      expect(withProjectKeyMock).toHaveBeenCalledWith({
        projectKey: config[CT_CONFIG_KEYS.PROJECT_KEY],
      });

      expect(client).toStrictEqual(expectedCTClientInstance);
    });
  });

  describe("buildCommerceToolsGenericClient()", () => {
    it("assembles correct params for buildCTPApiBuilder() call and resolves with CT sdk client instance", async () => {
      const brandId = "some-brand-id";
      const scopes = ["manage_my_project", "manage_orders"];

      const config = {
        [CT_CONFIG_KEYS.PROJECT_KEY]: "project-key-value",
        [CT_CONFIG_KEYS.API_URL]: "http://some-api-url.com/",
        [CT_CONFIG_KEYS.AUTH_URL]: "http://auth.some-api-url.com/",
        [CT_CONFIG_KEYS.REGION]: "eu",
        [CT_CONFIG_KEYS.CLIENT_ID]: "client-id-value",
        [CT_CONFIG_KEYS.CLIENT_SECRET]: "super-secret-client-secret",
      };

      const getProviderConfigMock = jest.fn().mockResolvedValue(config);

      jest.mocked(getBrandConfigCachedClient).mockReturnValue({
        getProviderConfig: getProviderConfigMock,
      } as any);

      const expectedCTClientInstance = { super: "duper" };
      const withProjectKeyMock = jest
        .fn()
        .mockReturnValue(expectedCTClientInstance);

      const buildCTPApiBuilderMock = jest
        .mocked(buildCTPApiBuilder)
        .mockReturnValue({
          withProjectKey: withProjectKeyMock,
        } as any);

      const client = await buildCommerceToolsGenericClient(brandId, scopes);

      expect(getProviderConfigMock).toHaveBeenCalledTimes(1);
      expect(getProviderConfigMock).toHaveBeenCalledWith(
        brandId,
        Object.keys(config),
        EXTERNAL_PROVIDER_TYPES.COMMERCE_TOOLS
      );

      expect(buildCTPApiBuilderMock).toHaveBeenCalledTimes(1);
      expect(buildCTPApiBuilderMock).toHaveBeenCalledWith({
        projectKey: config[CT_CONFIG_KEYS.PROJECT_KEY],
        apiHost: config[CT_CONFIG_KEYS.API_URL],
        region: config[CT_CONFIG_KEYS.REGION],
        authType: CT_AUTH_TYPES.CLIENT_CREDENTIALS,
        accessToken: "",
        authMiddlewareOptions: {
          host: config[CT_CONFIG_KEYS.AUTH_URL],
          projectKey: config[CT_CONFIG_KEYS.PROJECT_KEY],
          credentials: {
            clientId: config[CT_CONFIG_KEYS.CLIENT_ID],
            clientSecret: config[CT_CONFIG_KEYS.CLIENT_SECRET],
          },
          scopes: scopes.map(
            (scope) => `${scope}:${config[CT_CONFIG_KEYS.PROJECT_KEY]}`
          ),
        },
      });

      expect(withProjectKeyMock).toHaveBeenCalledTimes(1);
      expect(withProjectKeyMock).toHaveBeenCalledWith({
        projectKey: config[CT_CONFIG_KEYS.PROJECT_KEY],
      });

      expect(client).toStrictEqual(expectedCTClientInstance);
    });
  });

  describe("generateCartHash", () => {
    test("generates a hash", () => {
      const cart: Partial<Cart> = {
        id: "some-cart-id",
        lineItems: [{ id: "a" }] as LineItem[],
      };

      const hash = generateCartHash(cart as Cart);

      expect(hash).toBe(
        "3f2d3382920cf76f6c108c87a501b0c6742601774c5db8bd3d71732299a9d852"
      );
    });

    test("generates equal hash for the same data", () => {
      const cart1: Partial<Cart> = {
        id: "some-cart-id",
        lineItems: [{ id: "a" }] as LineItem[],
      };

      const cart2: Partial<Cart> = {
        id: "some-cart-id",
        lineItems: [{ id: "a" }] as LineItem[],
      };

      expect(generateCartHash(cart1 as Cart)).toBe(
        generateCartHash(cart2 as Cart)
      );
    });

    test("generates different hash for different data", () => {
      const cart1: Partial<Cart> = {
        id: "some-cart-id",
        lineItems: [{ id: "a" }] as LineItem[],
      };

      const cart2: Partial<Cart> = {
        id: "some-cart-id",
        lineItems: [{ id: "a" }, { id: "b" }] as LineItem[],
      };

      expect(generateCartHash(cart1 as Cart)).not.toBe(
        generateCartHash(cart2 as Cart)
      );
    });
  });
});
