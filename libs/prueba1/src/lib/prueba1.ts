import { cleanupEmail, isValidEmail } from "@flash-ws/shared";

export function prueba1(): string {
  isValidEmail(cleanupEmail(""));
  return "prueba1";
}
