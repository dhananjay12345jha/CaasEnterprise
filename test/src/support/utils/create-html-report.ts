// eslint-disable-next-line @typescript-eslint/no-var-requires
const report = require("multiple-cucumber-html-reporter");

//Note:this is OOS for world object as this does not form a part of Scenario
// need to reload config and read again
report.generate({
  jsonDir: "./target/",
  reportPath: "./target/",
  metadata: {
    device: "Local test machine",
    platform: {
      name: `${process.platform.toString()}`,
      // version: '16.04'
    },
  },
  customData: {
    title: "Run info",
    data: [
      { label: "Project", value: "CaaS Commerce" },
      { label: "Release", value: "1.0" },
      { label: "Cycle", value: "B11221.34321" },
      { label: "Execution Start Time", value: "Nov 19th 2017, 02:31 PM EST" },
      { label: "Execution End Time", value: "Nov 19th 2017, 02:56 PM EST" },
    ],
  },
});
