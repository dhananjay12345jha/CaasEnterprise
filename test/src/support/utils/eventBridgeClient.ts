import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
// Set the AWS Region.
// ToDo: read this from config --do not hard code
const REGION = "eu-west-1"; //e.g. "us-east-1"
// Create an Amazon EventBridge service client object.
export const ebClient = new EventBridgeClient({ region: REGION });
