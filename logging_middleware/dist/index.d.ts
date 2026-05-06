export declare const ALLOWED_STACKS: string[];
export declare const ALLOWED_LEVELS: string[];
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
export declare function Auth(params: AuthParams, authEndpoint?: string): Promise<string>;
/**
 * Logs a message to the evaluation service.
 *
 * @param stack Stack trace or context string
 * @param level The log level (must be one of ALLOWED_LEVELS)
 * @param pkg The package or component name (must be one of ALLOWED_PACKAGES)
 * @param message The actual log message
 */
export declare function Log(stack: string, level: string, pkg: string, message: string): Promise<void>;
export declare function setAccessToken(token: string): void;
