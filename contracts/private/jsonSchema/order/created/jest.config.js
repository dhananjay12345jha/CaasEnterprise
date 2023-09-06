module.exports = {
  displayName: "@everymile-schemas/order-created",
  preset: "../../../../tools/jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  transform: {
    ".(ts|tsx)": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory:
    "../../../../coverage/packages/@everymile-schemas/order-created",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./junit",
        outputName: "@everymile-schemas/order-created.xml",
      },
    ],
  ],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ["text", "lcov", "text-summary"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  testPathIgnorePatterns: ["/node_modules/", "/__fixtures__/"],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
