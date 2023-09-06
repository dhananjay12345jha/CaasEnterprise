module.exports = {
  displayName: "common-services",
  preset: "../../tools/jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../coverage/libs/services",
  coverageReporters: ["text", "cobertura", "json-summary", "html"],
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "./junit", outputName: "services.xml" }],
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
