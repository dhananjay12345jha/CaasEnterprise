// cucumber.js

let common = [
  "./**/features/**/*.feature", // Specify our feature files
  "--require-module ts-node/register", // Load TypeScript module
  "--require ./src/step_definitions/**/*.ts", // Load step definitions
  "--require ./src/support/utils/*.ts", // Load support utils
  "--format json:./target/results.json", //output to json file
  "--publish-quiet",
  '--tags "not @ignore"',
  //  "--parallel 2",
].join(" ");

//yarn cucumber-js -p sanity -p integ
// yarn integ-e2e -- -p sanity  -p integ

module.exports = {
  undefined: `${common} --world-parameters {"env":"dev"}`,
  default: `${common} --world-parameters {"env":"integ"}`,
  dev: `${common} --world-parameters {"env":"dev"}`,
  integ: `${common} --world-parameters {"env":"integ"}`,
  qa1: `${common} --world-parameters {"env":"qa1"}`,
  sanity: `${common} --tags @sanity`,
  regression: `${common} --tags @regression`,
  smoke: `${common} --tags @smoke`,
};
