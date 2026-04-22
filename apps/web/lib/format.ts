export function formatDisplayDate(value?: Date | string | null): string {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  });
}

