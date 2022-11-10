export function shared(): string {
  return 'shared';
}

export function capitalize(s: string) {
  return s[0].toUpperCase() + s.substring(1).toLowerCase();
}
