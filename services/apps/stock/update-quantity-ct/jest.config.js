module.exports = {
  displayName: "stock-update-quantity-ct",
  preset: "../../../tools/jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  setupFiles: ["<rootDir>/dotenv-config.ts", "<rootDir>/jest.setup.js"],
  transform: { "\\.ts$": ["ts-jest"] },
  coverageDirectory: "../../../coverage/apps/stock/update-quantity-ct",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./junit",
        outputName: "stock-update-quantity-ct.xml",
      },
    ],
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transformIgnorePatterns: ["^.+\\.js$"],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ["text", "lcov", "text-summary"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  testPathIgnorePatterns: ["/node_modules/", "/__fixtures__/"],
};
