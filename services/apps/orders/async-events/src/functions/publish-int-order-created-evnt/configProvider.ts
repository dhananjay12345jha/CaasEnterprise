const config = Object.freeze({
  eventBridgeEventBus: {
    eventBusName: process.env.TRANSACT_BUS_NAME,
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    maxPutMessageAttempts: parseInt(
      process.env.TRANSACT_BUS_MAX_PUT_MESSAGES_ATTEMPTS as string,
      10
    ),
  },
});

export default config;

export function ebEventBusClientConfigValidator({
  eventBusName,
  functionName,
  maxPutMessageAttempts,
}: {
  eventBusName: unknown;
  functionName: unknown;
  maxPutMessageAttempts: unknown;
}): {
  eventBusName: string;
  functionName: string;
  maxPutMessageAttempts: number;
} {
  if (typeof eventBusName !== "string") {
    throw new TypeError("The type of eventBusName has to be a string");
  }

  if (typeof functionName !== "string") {
    throw new TypeError("The type of functionName has to be a string");
  }

  if (
    typeof maxPutMessageAttempts !== "number" &&
    Math.floor(maxPutMessageAttempts as number) !== maxPutMessageAttempts
  ) {
    throw new TypeError(
      "The type of maxPutMessageAttempts has to be an integer"
    );
  }

  return {
    eventBusName,
    functionName,
    maxPutMessageAttempts,
  };
}
