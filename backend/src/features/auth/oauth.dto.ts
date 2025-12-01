// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeQuery(query: any): {
  code: string;
  authuser: string;
  scope: string;
  prompt: string;
} {
  return {
    code: String(query.code || ""),
    authuser: String(query.authuser || ""),
    scope: String(query.scope || ""),
    prompt: String(query.prompt || ""),
  };
}

export function isValidOauthParams(code: string): boolean {
  return !!code;
}
