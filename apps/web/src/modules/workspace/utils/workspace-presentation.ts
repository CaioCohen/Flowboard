export function formatWorkspaceLabel(value: string | undefined, fallback = "Unavailable"): string {
  if (!value) return fallback;

  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (character) => character.toUpperCase());
}
