import { ApiRoot } from "@commercetools/platform-sdk";
import { buildCTPApiBuilder } from "./api-builder";

describe("commerceTools", () => {
  it("should return an instance of ApiRoot", () => {
    expect(
      buildCTPApiBuilder({
        projectKey: "projectKey",
        accessToken: "accessToken",
        apiHost: "http://apiroot",
      }) instanceof ApiRoot
    ).toBe(true);
  });

  it("should return an instance of ApiRoot when no API root sent", () => {
    expect(
      buildCTPApiBuilder({
        projectKey: "projectKey",
        accessToken: "accessToken",
      }) instanceof ApiRoot
    ).toBe(true);
  });

  it("should return an instance of ApiRoot when using client credentials", () => {
    expect(
      buildCTPApiBuilder({
        projectKey: "projectKey",
        accessToken: "accessToken",
        authType: "client_credentials",
        authMiddlewareOptions: {
          projectKey: "projectKey",
          host: "http://host.com",
          credentials: {
            clientId: "cleintID",
            clientSecret: "clientSecret",
          },
        },
      }) instanceof ApiRoot
    ).toBe(true);
  });

  it("should return an wrapped debugger instance of ApiRoot", () => {
    expect(
      buildCTPApiBuilder({
        projectKey: "projectKey",
        accessToken: "accessToken",
        debug: true,
      }) instanceof ApiRoot
    ).toBe(true);
  });
});
