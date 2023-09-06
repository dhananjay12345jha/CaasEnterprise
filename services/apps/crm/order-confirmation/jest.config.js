module.exports = {
  displayName: "crm-order-confirmation",
  preset: "../../../tools/jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  setupFiles: ["<rootDir>/dotenv-config.ts"],
  transform: { "\\.ts$": ["ts-jest"] },
  coverageDirectory: "../../../coverage/apps/crm/order-confirmation",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        projectRoot: __dirname,
        outputDirectory: "./junit",
        outputName: "crm-order-confirmation.xml",
      },
    ],
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transformIgnorePatterns: ["^.+\\.js$"],
  collectCoverage: true,
  coverageReporters: ["text", "lcov", "text-summary"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  testPathIgnorePatterns: ["/node_modules/", "/__fixtures__/"],
  silent: true,
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
