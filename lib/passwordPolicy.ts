export const PASSWORD_POLICY_ERROR =
  "Gebruik een wachtwoord van minimaal 8 tekens met minstens 1 hoofdletter, 1 kleine letter en 1 cijfer.";

export function isStrongPassword(value: string): boolean {
  if (!value) return false;
  if (value.length < 8) return false;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasDigit = /\d/.test(value);
  return hasUpper && hasLower && hasDigit;
}

