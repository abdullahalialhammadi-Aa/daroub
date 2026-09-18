/** Shared client/server contract. No credentials are persisted by the client. */
export type LocalAuthAction='register'|'login'|'recover'|'logout';
export type LocalAuthError='invalid-input'|'invalid-credentials'|'account-unavailable'|'rate-limited'|'already-signed-in'|'unavailable'|'invalid-origin';
export type LocalAuthResult={ok:true;recoveryCode?:string}|{ok:false;error:LocalAuthError};
export const PASSWORD_MIN=15;
export const PASSWORD_MAX=128;
