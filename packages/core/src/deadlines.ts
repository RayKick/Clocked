import {
  addDays,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  formatISO,
  nextFriday,
  parseISO
} from "date-fns";

export type ParsedDeadline = {
  deadlineAt?: string;
  deadlineText?: string;
  deadlineTimezone?: string;
  deadlineConfidence: number;
  requiresReview: boolean;
  notes: string[];
};

const quarterRegex = /\bq([1-4])\b/i;

function toDate(value?: string | Date | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value : parseISO(value);
}

function parseWeekdayDeadline(text: string, base: Date): Date | undefined {
  if (!/\bfriday\b/i.test(text)) {
    return undefined;
  }

  return endOfDay(nextFriday(addDays(base, -1)));
}

export function parseDeadlineFromText(
  text: string,
  sourcePostedAt?: string | Date | null,
  timezone = "UTC"
): ParsedDeadline {
  const normalized = text.trim().toLowerCase();
  const baseDate = toDate(sourcePostedAt) ?? new Date();
  const notes: string[] = [];

  if (normalized.includes("tomorrow")) {
    return {
      deadlineAt: formatISO(endOfDay(addDays(baseDate, 1))),
      deadlineText: "tomorrow",
      deadlineTimezone: timezone,
      deadlineConfidence: 0.95,
      requiresReview: false,
      notes
    };
  }

  if (normalized.includes("this week")) {
    notes.push("Interpreted as end of current ISO week.");
    return {
      deadlineAt: formatISO(endOfWeek(baseDate, { weekStartsOn: 1 })),
      deadlineText: "this week",
      deadlineTimezone: timezone,
      deadlineConfidence: 0.8,
      requiresReview: false,
      notes
    };
  }

  if (normalized.includes("next week")) {
    notes.push("Interpreted as end of next ISO week.");
    return {
      deadlineAt: formatISO(
        endOfWeek(addWeeks(baseDate, 1), { weekStartsOn: 1 })
      ),
      deadlineText: "next week",
      deadlineTimezone: timezone,
      deadlineConfidence: 0.65,
      requiresReview: true,
      notes
    };
  }

  if (normalized.includes("this month")) {
    return {
      deadlineAt: formatISO(endOfMonth(baseDate)),
      deadlineText: "this month",
      deadlineTimezone: timezone,
      deadlineConfidence: 0.88,
      requiresReview: false,
      notes
    };
  }

  const quarterMatch = normalized.match(quarterRegex);
  if (quarterMatch) {
    const quarterNumber = Number(quarterMatch[1]);
    const quarterBase = new Date(
      Date.UTC(baseDate.getUTCFullYear(), (quarterNumber - 1) * 3, 1)
    );

    return {
      deadlineAt: formatISO(endOfQuarter(quarterBase)),
      deadlineText: `Q${quarterNumber}`,
      deadlineTimezone: timezone,
      deadlineConfidence: 0.82,
      requiresReview: false,
      notes
    };
  }

  if (normalized.includes("by friday")) {
    notes.push("Specific weekday inferred from source post date.");
    return {
      deadlineAt: formatISO(parseWeekdayDeadline(normalized, baseDate) ?? baseDate),
      deadlineText: "by Friday",
      deadlineTimezone: timezone,
      deadlineConfidence: 0.72,
      requiresReview: false,
      notes
    };
  }

  if (normalized.includes("coming weeks") || normalized.includes("coming week")) {
    notes.push("Deadline wording is vague and should be reviewed.");
    return {
      deadlineText: "coming weeks",
      deadlineTimezone: timezone,
      deadlineConfidence: 0.35,
      requiresReview: true,
      notes
    };
  }

  return {
    deadlineTimezone: timezone,
    deadlineConfidence: 0,
    requiresReview: true,
    notes: ["No bounded deadline detected."]
  };
}

export function isPastDeadline(
  deadlineAt?: string | Date | null,
  now: Date = new Date()
): boolean {
  const deadline = toDate(deadlineAt);
  if (!deadline) {
    return false;
  }

  return deadline.getTime() < now.getTime();
}

