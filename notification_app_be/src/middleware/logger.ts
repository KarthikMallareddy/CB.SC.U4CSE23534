import { Auth, Log, AuthParams } from 'logging_middleware';
import { config } from '../config/env';
import { setToken } from '../config/tokenStore';

const authParams: AuthParams = {
  email: config.evaluationService.email,
  name: config.evaluationService.name,
  rollNo: config.evaluationService.rollNo,
  accessCode: config.evaluationService.accessCode,
  clientID: config.evaluationService.clientID,
  clientSecret: config.evaluationService.clientSecret,
};

/**
 * Authenticates once at startup, caches the token in the shared token store
 * so all services can use it without re-authenticating.
 */
export async function initLogger(): Promise<void> {
  const token = await Auth(authParams, `${config.evaluationService.baseUrl}/auth`);
  setToken(token);
  console.log('[logger] Auth successful, bearer token cached');
}

/**
 * Thin wrapper around the middleware Log function fixed to "backend" stack.
 * Fire-and-forget: logging must never crash business logic.
 */
export async function log(
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
  pkg:
    | 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler'
    | 'repository' | 'route' | 'service' | 'auth' | 'config' | 'middleware' | 'utils',
  message: string
): Promise<void> {
  Log('backend', level, pkg, message).catch((err) => {
    console.error('[logger] Failed to send log:', err.message);
  });
}
