export function cleanupEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  if (email.indexOf(" ") !== -1) return false;
  return /\w+@\w+\.\w+/.test(email);
}
