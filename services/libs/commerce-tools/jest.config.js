module.exports = {
  displayName: "commerce-tools",
  preset: "../../tools/jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  transform: {
    // "^.+\\.[tj]sx?$": "ts-jest",
    ".(ts|tsx)": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../coverage/libs/commerce-tools",
  reporters: [
    "default",
    [
      "jest-junit",
      { outputDirectory: "./junit", outputName: "commerce-tools.xml" },
    ],
  ],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ["text", "cobertura", "json-summary", "html"],
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
