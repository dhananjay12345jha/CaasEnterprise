module.exports = {
  displayName: "brand-config",
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
  coverageDirectory: "../../coverage/libs/brand-config",
  reporters: [
    "default",
    [
      "jest-junit",
      { outputDirectory: "./junit", outputName: "brand-config.xml" },
    ],
  ],
  coverageThreshold: {
    global: {
      branches: 83,
      functions: 83,
      lines: 85,
      statements: 85,
    },
  },
};
