module.exports = {
  displayName: "payments-provider-callback",
  preset: "../../../tools/jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  setupFiles: ["<rootDir>/dotenv-config.ts", "<rootDir>/jest.setup.js"],
  transform: { "\\.ts$": ["ts-jest"] },
  coverageDirectory: "../../../coverage/apps/payments/provider-callback",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./junit",
        outputName: "payments-provider-callback.xml",
      },
    ],
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
