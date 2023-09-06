import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandOutput,
} from "@aws-sdk/client-sqs";

export default class DLQClient {
  private readonly url: string;
  private readonly sdkClient: SQSClient;

  constructor({ url, region }: { region: string; url: string }) {
    this.sdkClient = new SQSClient({ region });
    this.url = url;
  }

  async publish(event: {
    event: unknown;
    rejectionReason: { errorMessage: string; errorName: string };
  }): Promise<SendMessageCommandOutput> {
    const command = new SendMessageCommand({
      MessageBody: JSON.stringify(event),
      QueueUrl: this.url,
    });

    return this.sdkClient.send(command);
  }
}
