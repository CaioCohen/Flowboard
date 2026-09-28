const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function getInitials(
  firstName?: string,
  lastName?: string,
  email?: string,
): string {
  const initials = [firstName, lastName]
    .map((name) => name?.trim().charAt(0).toUpperCase())
    .filter((initial): initial is string => Boolean(initial))
    .join("");

  return initials || email?.trim().charAt(0).toUpperCase() || "?";
}

export function formatNotificationDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Date unavailable" : DATE_FORMATTER.format(date);
}
