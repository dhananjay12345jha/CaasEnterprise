import { CommerceServiceError } from "./commerce-service-error";

describe("CommerceServiceError", () => {
  it("CommerceServiceError constructor works", () => {
    const reqParam = { reqObj: true };
    const reqHeader = { reqHeadeR: true };
    const errMessage = "Error message";

    const CSErr = new CommerceServiceError(reqParam, reqHeader, [
      {
        errorType: "400",
        message: errMessage,
      },
    ]);

    expect(CSErr.requestHeaders).toBe(reqHeader);
    expect(CSErr.requestParameters).toBe(reqParam);
  });
});
