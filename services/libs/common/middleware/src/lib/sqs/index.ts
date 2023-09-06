import { createHash } from "crypto";
import { SQSEvent, SQSRecord } from "aws-lambda";

interface Request<TEvent> {
  event: TEvent;
}

export interface PatchedSQSRecord<TRecordPayload> extends SQSRecord {
  parsedBody: TRecordPayload;
}

export interface PatchedSQSEvent<TRecordPayload> extends SQSEvent {
  Records: Array<PatchedSQSRecord<TRecordPayload>>;
}

export function sqs<TRecordPayload>(): {
  before: (request: Request<PatchedSQSEvent<TRecordPayload>>) => void;
} {
  return {
    before(request: Request<PatchedSQSEvent<TRecordPayload>>): void {
      request.event.Records.forEach(
        (record: PatchedSQSRecord<TRecordPayload>) => {
          const { body, md5OfBody, messageId } = record;
          const calculatedDigest = createHash("md5").update(body).digest("hex");

          if (calculatedDigest !== md5OfBody) {
            throw new Error(
              `Checking the integrity of the message failed - messageId: ${messageId}`
            );
          }

          let parsedBody;
          try {
            parsedBody = JSON.parse(body);
          } catch (err) {
            throw new Error(
              `An error occurred parsing incoming message - messageId: ${messageId}`
            );
          }

          record.parsedBody = parsedBody;
        }
      );
    },
  };
}
