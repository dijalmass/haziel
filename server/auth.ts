export function validatePin(pin: string): boolean {
  const expectedPin = process.env.CAM_PIN || "1234";
  return pin === expectedPin;
}

const tokenStore = new Set<string>();

export function generateToken(): string {
  const token = crypto.randomUUID();
  tokenStore.add(token);
  return token;
}

export function isValidToken(token: string): boolean {
  return tokenStore.has(token);
}

export function revokeToken(token: string): void {
  tokenStore.delete(token);
}
