const config = Object.freeze({
  deadLetterQueue: {
    region: process.env.TRANSACT_BUS_DLQ_REGION,
    url: process.env.TRANSACT_BUS_DLQ_URL,
  },
});

export default config;

export function dlqClientConfigValidator({
  region,
  url,
}: {
  region: unknown;
  url: unknown;
}): {
  region: string;
  url: string;
} {
  if (typeof region !== "string") {
    throw new TypeError("The type of region has to be a string");
  }

  if (typeof url !== "string") {
    throw new TypeError("The type of url has to be a string");
  }

  return {
    region,
    url,
  };
}
