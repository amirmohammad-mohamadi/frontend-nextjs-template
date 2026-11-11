// Shared infrastructure
export * from "./shared/types";
export * from "./shared/backend-adapter";
export * from "./shared/api-client";
export * from "./shared/api-errors";
export * from "./shared/bff-client";
export * from "./shared/describe-error";
export * from "./shared/transport";
export * from "./shared/endpoints";
export * from "./shared/query-gc-time";
export * from "./shared/query-client-provider";
export * from "./shared/hooks";

// Domains (browser-safe). Server-only auth plumbing is under "@services/auth/server".
export * from "./auth";
export * from "./example";
