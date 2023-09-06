const { resolve } = require("path");

module.exports = async ({ resolveVariable }) => {
  const stage = await resolveVariable(
    'env:OVERRIDE_SLS_STAGE, opt:stage, "local"'
  );

  const buildConfigFile =
    process.env.SERVERLESS_CONFIG_JSON &&
    process.env.SERVERLESS_CONFIG_JSON !== ""
      ? process.env.SERVERLESS_CONFIG_JSON
      : `./serverless.${stage}.config.json`;

  const config = require(resolve(buildConfigFile));
  return config;
};
