import {
  EventBridgeClient,
  EventBridgeClientConfig,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

/** Example usage
 const input = { // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-eventbridge/interfaces/puteventscommandinput.html#entries
  Entries: [
    Detail: '{
      "valid": "json"
    }'
  ]
};
 const command = new PutEventsCommand(input);
 const client = await getEventBridgeClient({region: 'eu-west-1'})
 await sendCustomEvents(client, command);
 */

export async function getEventBridgeClient(
  config: EventBridgeClientConfig
): Promise<EventBridgeClient> {
  try {
    return new EventBridgeClient(config);
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

export async function sendCustomEvents(
  client: EventBridgeClient,
  command: PutEventsCommand
) {
  try {
    return await client.send(command);
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}
