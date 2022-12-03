import type { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "test",
      preset: "ts-jest",
      coveragePathIgnorePatterns: ["/node_modules/", "/example/"],
      setupFiles: ["./jest.setup.ts"],
    },
    {
      displayName: "lint",
      runner: "jest-runner-eslint",
      testMatch: [
        "<rootDir>/{example,lib}/**/*.{ts,tsx}",
        "<rootDir>/*.{ts,tsx}",
      ],
    },
  ],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};

export default config;
