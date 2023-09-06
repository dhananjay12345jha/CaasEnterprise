module.exports = {
  displayName: "stock-quantity-updates",
  preset: "../../../tools/jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  setupFiles: ["<rootDir>/dotenv-config.ts"],
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  coverageDirectory: "../../../coverage/apps/stock/quantity-updates",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./junit",
        outputName: "stock-quantity-updates.xml",
      },
    ],
  ],
};
