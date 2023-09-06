module.exports = {
  displayName: "crm-user-registered",
  preset: "../../../tools/jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  setupFiles: ["<rootDir>/dotenv-config.ts", "<rootDir>/jest.setup.js"],
  transform: { "\\.ts$": ["ts-jest"] },
  coverageDirectory: "../../../coverage/apps/crm/user-registered",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./junit",
        outputName: "crm-user-registered.xml",
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
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
