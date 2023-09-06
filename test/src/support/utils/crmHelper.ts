import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { world } from "./custom.world";
import { v4 as uuidv4 } from "uuid";
import { ebClient } from "./eventBridgeClient";

export async function sendCustomEvent(
  eventType: string,
  eventBus: string,
  message: string
) {
  // Set the parameters.
  const params = {
    Entries: [
      {
        version: "0",
        Time: new Date(),
        id: uuidv4(),
        Detail: `${message}`,
        DetailType: `${eventType}`,
        EventBusName: `${world.config.globals.shardConfig[`${eventBus}`]}`, //RESOURCE_ARN
        Source: "com.autotest.app",
      },
    ],
  };

  // console.log(params);

  // const run = async () => {
  try {
    const data = await ebClient.send(new PutEventsCommand(params));
    // console.log("Success, event sent; requestID:", data);
    // console.log("Success, event sent; requestID:", data.Entries[0].Resources);
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
}
