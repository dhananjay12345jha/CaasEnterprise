import { createHash } from "crypto";
import { sqs } from "./";

jest.mock("crypto");

function mockSqsMessageFactory(stringifiedRecordPayload: string) {
  return {
    parsedBody: { foo: "bar" },
    messageId: "d373b52d-5302-446d-96ca-76392f46b0c2",
    receiptHandle: "string",
    body: stringifiedRecordPayload,
    attributes: {
      ApproximateReceiveCount: "string",
      SentTimestamp: "string",
      SenderId: "string",
      ApproximateFirstReceiveTimestamp: "string",
    },
    messageAttributes: {
      foo: {
        dataType: "bar",
      },
    },
    md5OfBody: "9bb58f26192e4ba00f01e2e7b136bbd8",
    eventSource: "string",
    eventSourceARN: "string",
    awsRegion: "string",
  };
}

describe("THE sqs middleware", () => {
  describe("WHEN there is one incoming record", () => {
    describe("AND the calculated hash doesn't match with the delivered one", () => {
      beforeEach(() => {
        (createHash as jest.Mock).mockImplementationOnce(() => {
          return {
            update() {
              return this;
            },
            digest() {
              return "It doesn't match";
            },
          };
        });
      });

      it("SHOULD throw", () => {
        expect(() => {
          return sqs<{ foo: string }>().before({
            event: {
              Records: [mockSqsMessageFactory(JSON.stringify({ foo: "bar" }))],
            },
          });
        }).toThrow(
          "Checking the integrity of the message failed - messageId: d373b52d-5302-446d-96ca-76392f46b0c2"
        );
      });
    });

    describe("AND the calculated hash matches with the delivered one", () => {
      beforeEach(() => {
        (createHash as jest.Mock).mockImplementation(() => {
          return {
            update() {
              return this;
            },
            digest() {
              return "9bb58f26192e4ba00f01e2e7b136bbd8";
            },
          };
        });
      });

      describe("AND the message is not parseable", () => {
        const unParseableRecord = "unparsable";

        it("SHOULD throw", () => {
          const tmp = mockSqsMessageFactory(unParseableRecord);
          expect(() => {
            return sqs<{ foo: string }>().before({
              event: { Records: [tmp] },
            });
          }).toThrow(
            "An error occurred parsing incoming message - messageId: d373b52d-5302-446d-96ca-76392f46b0c2"
          );
        });
      });

      describe("AND the message is parseable", () => {
        const parseableRecord = { foo: "bar" };

        it("SHOULD return the parsed message", () => {
          const request = {
            event: {
              Records: [mockSqsMessageFactory(JSON.stringify(parseableRecord))],
            },
          };
          sqs<{ foo: string }>().before(request);

          expect(request.event).toMatchObject({
            Records: [
              {
                parsedBody: parseableRecord,
                messageId: "d373b52d-5302-446d-96ca-76392f46b0c2",
              },
            ],
          });
        });
      });
    });
  });
});
