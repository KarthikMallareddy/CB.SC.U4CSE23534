import axios from 'axios';

const EVALUATION_SERVICE_BASE_URL = 'http://20.207.122.201/evaluation-service';

export const ALLOWED_STACKS = ['backend', 'frontend'];
export const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const BACKEND_PACKAGES = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
const FRONTEND_PACKAGES = ['api', 'component', 'hook', 'page', 'state', 'style'];
const SHARED_PACKAGES = ['auth', 'config', 'middleware', 'utils'];

let globalAccessToken: string | null = null;

export interface AuthResponse {
  access_token: string;
  [key: string]: any;
}

export interface AuthParams {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

/**
 * Authenticates with the evaluation service and returns an access_token.
 * It also caches the token globally for subsequent Log calls.
 * 
 * @param params Object containing your registration details and client credentials
 * @param authEndpoint Optional custom auth endpoint. Defaults to /auth
 * @returns The access_token string
 */
export async function Auth(params: AuthParams, authEndpoint: string = '/auth'): Promise<string> {
  try {
    const url = authEndpoint.startsWith('http') ? authEndpoint : `${EVALUATION_SERVICE_BASE_URL}${authEndpoint}`;
    
    // We try sending it as a JSON payload which is common
    const response = await axios.post<AuthResponse>(url, params);

    // Check if access_token is in response
    if (response.data && response.data.access_token) {
      globalAccessToken = response.data.access_token;
      return globalAccessToken;
    }
    
    throw new Error('access_token not found in the response');
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Logs a message to the evaluation service.
 * 
 * @param stack Stack trace or context string
 * @param level The log level (must be one of ALLOWED_LEVELS)
 * @param pkg The package or component name (must be one of ALLOWED_PACKAGES)
 * @param message The actual log message
 */
export async function Log(stack: string, level: string, pkg: string, message: string): Promise<void> {
  if (!globalAccessToken) {
    throw new Error('You must call Auth() and get an access token before calling Log()');
  }

  // Verify allowed strings
  if (!ALLOWED_STACKS.includes(stack)) {
    throw new Error(`Invalid stack: '${stack}'. Allowed stacks are: ${ALLOWED_STACKS.join(', ')}`);
  }

  if (!ALLOWED_LEVELS.includes(level)) {
    throw new Error(`Invalid level: '${level}'. Allowed levels are: ${ALLOWED_LEVELS.join(', ')}`);
  }

  let allowedPackages: string[] = [];
  if (stack === 'backend') {
    allowedPackages = [...BACKEND_PACKAGES, ...SHARED_PACKAGES];
  } else if (stack === 'frontend') {
    allowedPackages = [...FRONTEND_PACKAGES, ...SHARED_PACKAGES];
  }

  if (!allowedPackages.includes(pkg)) {
    throw new Error(`Invalid package '${pkg}' for stack '${stack}'. Allowed packages are: ${allowedPackages.join(', ')}`);
  }

  try {
    const logUrl = `${EVALUATION_SERVICE_BASE_URL}/logs`;
    
    await axios.post(
      logUrl,
      {
        stack,
        level,
        package: pkg,
        message
      },
      {
        headers: {
          'Authorization': `Bearer ${globalAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: any) {
    throw new Error(`Failed to send log to evaluation service: ${error.message}`);
  }
}

// Optionally export a helper to manually set the token without calling Auth
// Useful if your main app manages the token itself
export function setAccessToken(token: string) {
  globalAccessToken = token;
}
