module.exports = {
  displayName: "crm-newsletter-profile",
  preset: "../../../tools/jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  setupFiles: ["<rootDir>/dotenv-config.ts"],
  transform: { "\\.ts$": ["ts-jest"] },
  coverageDirectory: "../../../coverage/apps/crm/newsletter-profile",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./junit",
        outputName: "crm-newsletter-profile.xml",
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
      branches: 60,
      functions: 70,
      lines: 85,
      statements: 85,
    },
  },
};
