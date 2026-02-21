export const logInfo = (...args: unknown[]) => console.info("[Efund]", ...args);

export const logError = (...args: unknown[]) => console.error("[Efund]", ...args);

export const logDebug = (...args: unknown[]) => {
  const env = (import.meta as unknown as { env?: { DEV?: boolean } }).env;
  if (env?.DEV) console.debug("[Efund]", ...args);
};
