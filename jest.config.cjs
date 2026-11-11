module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      { swcrc: false, jsc: { transform: { react: { runtime: "automatic" } } } },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/src/**/*.spec.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@(utils|components|models|dtos|services|assets|enums)$": "<rootDir>/src/shared/$1/index.ts",
    "^@(utils|components|models|dtos|services|assets|enums)/(.*)$": "<rootDir>/src/shared/$1/$2",
  },
  coverageDirectory: "coverage",
};
