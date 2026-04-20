/** Shared constants for local dev (host ports published by Docker Compose). */
export const LOCAL_API_PORTS = {
  auth: 4001,
  property: 4002,
  booking: 4003,
  payment: 4004,
} as const;

export * from './contracts/api';
