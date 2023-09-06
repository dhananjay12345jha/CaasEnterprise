module.exports = {
  displayName: "common-middleware",
  preset: "../../../tools/jest.preset.js",
  silent: true, // Silencing logs on the stdout. Set it to false if you need console.logs
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
  coverageDirectory: "../../../../coverage/libs/common/middleware",
  reporters: [
    "default",
    [
      "jest-junit",
      { outputDirectory: "./junit", outputName: "serverless-middleware.xml" },
    ],
  ],
  coverageThreshold: {
    global: {
      branches: 84,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
