/**
 * Shared in-memory token store.
 * Decouples the logger (which sets the token) from the service (which reads it),
 * breaking the circular import chain.
 */
let token: string | null = null;

export function setToken(t: string): void {
  token = t;
}

export function getToken(): string {
  if (!token) throw new Error('Bearer token not initialized. Call initLogger() at startup.');
  return token;
}
