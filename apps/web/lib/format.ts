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

export function formatDateOnly(value?: Date | string | null): string {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString("en-US", {
    dateStyle: "medium",
    timeZone: "UTC"
  });
}

export function formatShortDate(value?: Date | string | null): string {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC"
  });
}

export function formatRelativeDateLabel(value?: Date | string | null): string {
  if (!value) {
    return "No deadline recorded";
  }

  const date = new Date(value);
  const now = new Date();
  const startOfTarget = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  const startOfToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const dayDiff = Math.round((startOfTarget - startOfToday) / (24 * 60 * 60 * 1000));

  if (dayDiff === 0) {
    return "Due today";
  }

  if (dayDiff === 1) {
    return "Due tomorrow";
  }

  if (dayDiff > 1) {
    return `Due in ${dayDiff} days`;
  }

  if (dayDiff === -1) {
    return "1 day overdue";
  }

  return `${Math.abs(dayDiff)} days overdue`;
}

export function formatListCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
