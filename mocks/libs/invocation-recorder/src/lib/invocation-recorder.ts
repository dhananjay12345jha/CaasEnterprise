import {
  ExpressRequest,
  ExpressResponse,
  InvocationItem,
  InvocationRequest,
  InvocationResponse,
} from "./models";

export class InvocationRecorder {
  private invocationItems: InvocationItem[] = [];

  private buildInvocationItem(
    c: any,
    req: ExpressRequest,
    res: ExpressResponse,
    responseIncludesMetadata = false
  ): InvocationItem {
    const invocationRequest: InvocationRequest = {
      params: req.params,
      query: req.query,
      body: req.body,
      headers: req.headers,
      path: req.path,
      method: req.method,
    };

    const invocationResponse: InvocationResponse = {
      statusCode: res.statusCode,
      response: responseIncludesMetadata ? c.response.data : c.response,
    };

    return {
      request: invocationRequest,
      response: invocationResponse,
    };
  }

  recordInvocation = (
    c: any,
    req: ExpressRequest,
    res: ExpressResponse,
    responseIncludesMetadata = false
  ) =>
    this.invocationItems.push(
      this.buildInvocationItem(c, req, res, responseIncludesMetadata)
    );

  getLatestInvocations = (invocationCount?: number): InvocationItem[] => {
    const latestInvocations = this.invocationItems.reverse();
    return invocationCount
      ? latestInvocations.slice(0, invocationCount)
      : latestInvocations;
  };
}
