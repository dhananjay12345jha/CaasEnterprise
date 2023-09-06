import { InvocationRecorder } from "./invocation-recorder";
import { faker } from "@faker-js/faker";
import { InvocationRequest, InvocationResponse } from "./models";
import { ExpressRequestBuilder, ExpressResponseBuilder } from "./__tests__";

describe("invocationRecorder", () => {
  it("should return latest invocations when invocation logged", () => {
    const contextOne = {
      response: faker.datatype.string(),
    };
    const expressInvocationOneRequest = new ExpressRequestBuilder().build();
    const expressInvocationOneResponse = new ExpressResponseBuilder().build();

    const contextTwo = {
      response: faker.datatype.string(),
    };
    const expressInvocationTwoRequest = new ExpressRequestBuilder().build();
    const expressInvocationTwoResponse = new ExpressResponseBuilder().build();

    const invocationRecorder = new InvocationRecorder();
    invocationRecorder.recordInvocation(
      contextOne,
      expressInvocationOneRequest,
      expressInvocationOneResponse
    );
    invocationRecorder.recordInvocation(
      contextTwo,
      expressInvocationTwoRequest,
      expressInvocationTwoResponse
    );

    const latestInvocations = invocationRecorder.getLatestInvocations();

    const expectedRequestOne: InvocationRequest = {
      params: expressInvocationTwoRequest.params,
      query: expressInvocationTwoRequest.query,
      body: expressInvocationTwoRequest.body,
      headers: expressInvocationTwoRequest.headers,
      method: expressInvocationTwoRequest.method,
      path: expressInvocationTwoRequest.path,
    };

    const expectedResponseOne: InvocationResponse = {
      statusCode: expressInvocationTwoResponse.statusCode,
      response: contextTwo.response,
    };

    const expectedRequestTwo: InvocationRequest = {
      params: expressInvocationOneRequest.params,
      query: expressInvocationOneRequest.query,
      body: expressInvocationOneRequest.body,
      headers: expressInvocationOneRequest.headers,
      method: expressInvocationOneRequest.method,
      path: expressInvocationOneRequest.path,
    };

    const expectedResponseTwo: InvocationResponse = {
      statusCode: expressInvocationOneResponse.statusCode,
      response: contextOne.response,
    };

    expect(latestInvocations).not.toBeNull();
    expect(latestInvocations.length).toBe(2);

    expect(latestInvocations[0].request).toStrictEqual(expectedRequestOne);
    expect(latestInvocations[0].response).toStrictEqual(expectedResponseOne);

    expect(latestInvocations[1].request).toStrictEqual(expectedRequestTwo);
    expect(latestInvocations[1].response).toStrictEqual(expectedResponseTwo);
  });
});
