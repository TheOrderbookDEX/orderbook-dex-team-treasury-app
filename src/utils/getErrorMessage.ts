export function getErrorMessage(error: unknown) {
  try {
    return String((error as { message: unknown }).message);
  } catch {
    return String(error);
  }
}
