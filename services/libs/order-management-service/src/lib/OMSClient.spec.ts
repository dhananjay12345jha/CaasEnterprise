import nock from "nock";
import * as fetchModule from "node-fetch";
import {
  getBrandConfigCachedClient,
  OMS_CONFIG_KEYS,
} from "@ei-services/brand-config";
import { Logger } from "@ei-services/services";
import OMSClient from "./OMSClient";
import { OMSPermanentError, OMSTransientError } from "./errors";
import order from "./__fixtures__/orderPayloadMock.json";

const FetchError = fetchModule.FetchError;
const logger = new Logger();

jest.mock("@ei-services/brand-config");

describe("THE OMSClient", () => {
  const apiBase = "http://foo.com";
  const clientID = "foo";
  const clientSecret = "bar";
  let omsClient: OMSClient;

  beforeEach(() => {
    omsClient = new OMSClient({ logger });
  });

  describe("THE constructor", () => {
    it("SHOULD create an oms client instance", () => {
      expect(omsClient).toBeInstanceOf(OMSClient);
    });
  });

  describe('THE "getOrder" method', () => {
    const brandID = 1234;
    const saleReference = "bar";
    const path = "/v1/Orders";
    const mockStoredOrder = { foo: "bar" };

    describe("AND the authorization is yet configured", () => {
      beforeEach(() => {
        (getBrandConfigCachedClient as jest.Mock).mockImplementationOnce(() => {
          return {
            getProviderConfig() {
              return {
                [OMS_CONFIG_KEYS.EMC_API_BASE]: apiBase,
                [OMS_CONFIG_KEYS.EMC_CLIENT_ID]: clientID,
                [OMS_CONFIG_KEYS.EMC_CLIENT_SECRET]: clientSecret,
              };
            },
          };
        });
      });

      describe("AND the authorize request throws", () => {
        beforeEach(() => {
          nock(`${apiBase}`).post("/v1/AccessToken").reply(400);
        });

        it("SHOULD throw a permanent error", () => {
          return expect(
            omsClient.getOrder({
              brandID,
              saleReference,
            })
          ).rejects.toThrow(OMSPermanentError);
        });
      });

      describe("AND the authorize request returns with a token", () => {
        beforeEach(() => {
          nock(`${apiBase}`).post("/v1/AccessToken").reply(200, {
            accessToken: "1234567",
            expiresIn: 3599,
          });
        });

        let errorToThrow;
        let fetchSpy;

        describe("AND the http client throws", () => {
          beforeEach(() => {
            const origFetch = fetchModule.default;
            fetchSpy = jest
              .spyOn(fetchModule, "default")
              .mockImplementationOnce((...args) => origFetch(...args))
              .mockImplementationOnce(() => {
                throw errorToThrow;
              });
          });

          afterEach(() => {
            fetchSpy.mockRestore();
          });

          describe("AND the http client throws an AbortError", () => {
            beforeEach(() => {
              errorToThrow = new Error("abort error mock");
              errorToThrow.name = "AbortError";
            });

            it("SHOULD throw a transient error", () => {
              return expect(
                omsClient.getOrder({
                  brandID,
                  saleReference,
                })
              ).rejects.toThrow(OMSTransientError);
            });
          });

          describe("AND the http client throws a FetchError", () => {
            beforeEach(() => {
              errorToThrow = new FetchError("fetch error mock", "system");
            });

            it("SHOULD throw a transient error", () => {
              return expect(
                omsClient.getOrder({
                  brandID,
                  saleReference,
                })
              ).rejects.toThrow(OMSTransientError);
            });
          });

          describe("AND the http client throws any other error", () => {
            beforeEach(() => {
              errorToThrow = new Error("unexpected client error mock");
            });

            it("SHOULD should proxy the unexpected error", () => {
              return expect(
                omsClient.getOrder({
                  brandID,
                  saleReference,
                })
              ).rejects.toThrow(new Error("unexpected client error mock"));
            });
          });
        });

        describe("AND the underlying http request against OMS API call return with 404", () => {
          beforeEach(() => {
            nock(`${apiBase}`)
              .get(`${path}/${brandID}-${saleReference}`)
              .reply(404);
          });

          it("SHOULD return with null", async () => {
            return expect(
              omsClient.getOrder({
                brandID,
                saleReference,
              })
            ).resolves.toBeNull();
          });
        });

        describe("AND the underlying http request against OMS API call return with 4xx", () => {
          beforeEach(() => {
            nock(`${apiBase}`)
              .get(`${path}/${brandID}-${saleReference}`)
              .reply(400);
          });

          it("SHOULD throw a permanent error", () => {
            return expect(
              omsClient.getOrder({
                brandID,
                saleReference,
              })
            ).rejects.toThrow(OMSPermanentError);
          });
        });

        describe("AND the underlying http request against OMS API call return with 5xx", () => {
          beforeEach(() => {
            nock(`${apiBase}`)
              .get(`${path}/${brandID}-${saleReference}`)
              .reply(500);
          });

          it("SHOULD throw a transient error", () => {
            return expect(
              omsClient.getOrder({
                brandID,
                saleReference,
              })
            ).rejects.toThrow(OMSTransientError);
          });
        });

        describe("AND the underlying http request against OMS API returns the stored order successfully", () => {
          beforeEach(() => {
            nock(`${apiBase}`)
              .get(`${path}/${brandID}-${saleReference}`)
              .reply(200, mockStoredOrder);
          });

          it("SHOULD return the requested order", async () => {
            const result = await omsClient.getOrder({
              brandID,
              saleReference,
            });
            expect(result).toStrictEqual(mockStoredOrder);
          });
        });
      });
    });

    describe("AND the authorization already configured", () => {
      beforeEach(() => {
        omsClient.accessCreds = {
          apiBase: apiBase,
          clientID: clientID,
          clientSecret: clientSecret,
        };
      });

      describe("AND the authorize request throws", () => {
        beforeEach(() => {
          nock(`${apiBase}`).post("/v1/AccessToken").reply(400);
        });

        it("SHOULD throw a permanent error", () => {
          return expect(
            omsClient.getOrder({
              brandID,
              saleReference,
            })
          ).rejects.toThrow(OMSPermanentError);
        });
      });

      describe("AND the authorize request returns with a token", () => {
        beforeEach(() => {
          nock(`${apiBase}`).post("/v1/AccessToken").reply(200, {
            accessToken: "1234567",
            expiresIn: 3599,
          });
        });

        let errorToThrow;
        let fetchSpy;

        describe("AND the http client throws", () => {
          beforeEach(() => {
            const origFetch = fetchModule.default;
            fetchSpy = jest
              .spyOn(fetchModule, "default")
              .mockImplementationOnce((...args) => origFetch(...args))
              .mockImplementationOnce(() => {
                throw errorToThrow;
              });
          });

          afterEach(() => {
            fetchSpy.mockRestore();
          });

          describe("AND the http client throws an AbortError", () => {
            beforeEach(() => {
              errorToThrow = new Error("abort error mock");
              errorToThrow.name = "AbortError";
            });

            it("SHOULD throw a transient error", () => {
              return expect(
                omsClient.getOrder({
                  brandID,
                  saleReference,
                })
              ).rejects.toThrow(OMSTransientError);
            });
          });

          describe("AND the http client throws a FetchError", () => {
            beforeEach(() => {
              errorToThrow = new FetchError("fetch error mock", "system");
            });

            it("SHOULD throw a transient error", () => {
              return expect(
                omsClient.getOrder({
                  brandID,
                  saleReference,
                })
              ).rejects.toThrow(OMSTransientError);
            });
          });

          describe("AND the http client throws any other error", () => {
            beforeEach(() => {
              errorToThrow = new Error("unexpected client error mock");
            });

            it("SHOULD should proxy the unexpected error", () => {
              return expect(
                omsClient.getOrder({
                  brandID,
                  saleReference,
                })
              ).rejects.toThrow(new Error("unexpected client error mock"));
            });
          });
        });

        describe("AND the underlying http request against OMS API call return with 404", () => {
          beforeEach(() => {
            nock(`${apiBase}`)
              .get(`${path}/${brandID}-${saleReference}`)
              .reply(404);
          });

          it("SHOULD return with null", async () => {
            return expect(
              omsClient.getOrder({
                brandID,
                saleReference,
              })
            ).resolves.toBeNull();
          });
        });

        describe("AND the underlying http request against OMS API call return with 4xx", () => {
          beforeEach(() => {
            nock(`${apiBase}`)
              .get(`${path}/${brandID}-${saleReference}`)
              .reply(400);
          });

          it("SHOULD throw a permanent error", () => {
            return expect(
              omsClient.getOrder({
                brandID,
                saleReference,
              })
            ).rejects.toThrow(OMSPermanentError);
          });
        });

        describe("AND the underlying http request against OMS API call return with 5xx", () => {
          beforeEach(() => {
            nock(`${apiBase}`)
              .get(`${path}/${brandID}-${saleReference}`)
              .reply(500);
          });

          it("SHOULD throw a transient error", () => {
            return expect(
              omsClient.getOrder({
                brandID,
                saleReference,
              })
            ).rejects.toThrow(OMSTransientError);
          });
        });

        describe("AND the underlying http request against OMS API returns the stored order successfully", () => {
          beforeEach(() => {
            nock(`${apiBase}`)
              .get(`${path}/${brandID}-${saleReference}`)
              .reply(200, mockStoredOrder);
          });

          it("SHOULD return the requested order", async () => {
            const result = await omsClient.getOrder({
              brandID,
              saleReference,
            });
            expect(result).toStrictEqual(mockStoredOrder);
          });
        });
      });
    });
  });

  describe('THE "createOrder" method', () => {
    const path = "/v1/Orders";
    const mockOrderPayload = { foo: "bar" };

    describe("AND the authorization is not yet configured", () => {
      beforeEach(() => {
        (getBrandConfigCachedClient as jest.Mock).mockImplementationOnce(() => {
          return {
            getProviderConfig() {
              return {
                [OMS_CONFIG_KEYS.EMC_API_BASE]: apiBase,
                [OMS_CONFIG_KEYS.EMC_CLIENT_ID]: clientID,
                [OMS_CONFIG_KEYS.EMC_CLIENT_SECRET]: clientSecret,
              };
            },
          };
        });
      });

      describe("AND the authorize request throws", () => {
        beforeEach(() => {
          nock(`${apiBase}`).post("/v1/AccessToken").reply(400);
        });

        it("SHOULD throw a permanent error", () => {
          return expect(omsClient.createOrder(order)).rejects.toThrow(
            OMSPermanentError
          );
        });
      });

      describe("AND the authorize request returns with a token", () => {
        beforeEach(() => {
          nock(`${apiBase}`).post("/v1/AccessToken").reply(200, {
            accessToken: "1234567",
            expiresIn: 3599,
          });
        });

        let errorToThrow;
        let fetchSpy;

        describe("AND the http client throws", () => {
          beforeEach(() => {
            const origFetch = fetchModule.default;
            fetchSpy = jest
              .spyOn(fetchModule, "default")
              .mockImplementationOnce((...args) => origFetch(...args))
              .mockImplementationOnce(() => {
                throw errorToThrow;
              });
          });

          afterEach(() => {
            fetchSpy.mockRestore();
          });

          describe("AND the http client throws an AbortError", () => {
            beforeEach(() => {
              errorToThrow = new Error("abort error mock");
              errorToThrow.name = "AbortError";
            });

            it("SHOULD throw a transient error", () => {
              return expect(omsClient.createOrder(order)).rejects.toThrow(
                OMSTransientError
              );
            });
          });

          describe("AND the http client throws a FetchError", () => {
            beforeEach(() => {
              errorToThrow = new FetchError("fetch error mock", "system");
            });

            it("SHOULD throw a transient error", () => {
              return expect(omsClient.createOrder(order)).rejects.toThrow(
                OMSTransientError
              );
            });
          });

          describe("AND the http client throws any other error", () => {
            beforeEach(() => {
              errorToThrow = new Error("unexpected client error mock");
            });

            it("SHOULD should proxy the unexpected error", () => {
              return expect(omsClient.createOrder(order)).rejects.toThrow(
                new Error("unexpected client error mock")
              );
            });
          });
        });

        describe("AND the underlying http request against OMS API call return with 4xx", () => {
          beforeEach(() => {
            nock(`${apiBase}`).post(`${path}`).reply(400);
          });

          it("SHOULD throw a permanent error", () => {
            return expect(omsClient.createOrder(order)).rejects.toThrow(
              OMSPermanentError
            );
          });
        });

        describe("AND the underlying http request against OMS API call return with 5xx", () => {
          beforeEach(() => {
            nock(`${apiBase}`).post(`${path}`).reply(500);
          });

          it("SHOULD throw a transient error", () => {
            return expect(omsClient.createOrder(order)).rejects.toThrow(
              OMSTransientError
            );
          });
        });

        describe("AND the underlying http request against OMS API returns the stored order successfully", () => {
          beforeEach(() => {
            nock(`${apiBase}`).post(`${path}`).reply(200, mockOrderPayload);
          });

          it("SHOULD return the requested order", async () => {
            const result = await omsClient.createOrder(order);
            expect(result).toStrictEqual(mockOrderPayload);
          });
        });
      });
    });

    describe("AND the authorization is already configured", () => {
      beforeEach(() => {
        omsClient.accessCreds = {
          apiBase: apiBase,
          clientID: clientID,
          clientSecret: clientSecret,
        };
      });

      describe("AND the authorize request throws", () => {
        beforeEach(() => {
          nock(`${apiBase}`).post("/v1/AccessToken").reply(400);
        });

        it("SHOULD throw a permanent error", () => {
          return expect(omsClient.createOrder(order)).rejects.toThrow(
            OMSPermanentError
          );
        });
      });

      describe("AND the authorize request returns with a token", () => {
        beforeEach(() => {
          nock(`${apiBase}`).post("/v1/AccessToken").reply(200, {
            accessToken: "1234567",
            expiresIn: 3599,
          });
        });

        let errorToThrow;
        let fetchSpy;

        describe("AND the http client throws", () => {
          beforeEach(() => {
            const origFetch = fetchModule.default;
            fetchSpy = jest
              .spyOn(fetchModule, "default")
              .mockImplementationOnce((...args) => origFetch(...args))
              .mockImplementationOnce(() => {
                throw errorToThrow;
              });
          });

          afterEach(() => {
            fetchSpy.mockRestore();
          });

          describe("AND the http client throws an AbortError", () => {
            beforeEach(() => {
              errorToThrow = new Error("abort error mock");
              errorToThrow.name = "AbortError";
            });

            it("SHOULD throw a transient error", () => {
              return expect(omsClient.createOrder(order)).rejects.toThrow(
                OMSTransientError
              );
            });
          });

          describe("AND the http client throws a FetchError", () => {
            beforeEach(() => {
              errorToThrow = new FetchError("fetch error mock", "system");
            });

            it("SHOULD throw a transient error", () => {
              return expect(omsClient.createOrder(order)).rejects.toThrow(
                OMSTransientError
              );
            });
          });

          describe("AND the http client throws any other error", () => {
            beforeEach(() => {
              errorToThrow = new Error("unexpected client error mock");
            });

            it("SHOULD should proxy the unexpected error", () => {
              return expect(omsClient.createOrder(order)).rejects.toThrow(
                new Error("unexpected client error mock")
              );
            });
          });
        });

        describe("AND the underlying http request against OMS API call return with 4xx", () => {
          beforeEach(() => {
            nock(`${apiBase}`).post(`${path}`).reply(400);
          });

          it("SHOULD throw a permanent error", () => {
            return expect(omsClient.createOrder(order)).rejects.toThrow(
              OMSPermanentError
            );
          });
        });

        describe("AND the underlying http request against OMS API call return with 5xx", () => {
          beforeEach(() => {
            nock(`${apiBase}`).post(`${path}`).reply(500);
          });

          it("SHOULD throw a transient error", () => {
            return expect(omsClient.createOrder(order)).rejects.toThrow(
              OMSTransientError
            );
          });
        });

        describe("AND the underlying http request against OMS API returns the stored order successfully", () => {
          beforeEach(() => {
            nock(`${apiBase}`).post(`${path}`).reply(200, mockOrderPayload);
          });

          it("SHOULD return the requested order", async () => {
            const result = await omsClient.createOrder(order);
            expect(result).toStrictEqual(mockOrderPayload);
          });
        });
      });
    });
  });
});
