const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

const WEEKDAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type ParsedDeadline = {
  deadlineText?: string;
  deadlineAt?: string;
  deadlineTimezone?: string;
  deadlineConfidence?: number;
  ambiguityNotes: string[];
};

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

function endOfUtcMonth(year: number, monthIndex: number): Date {
  return new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
}

function endOfUtcQuarter(year: number, quarter: number): Date {
  const monthIndex = quarter * 3 - 1;
  return endOfUtcMonth(year, monthIndex);
}

function endOfIsoWeek(date: Date): Date {
  const day = date.getUTCDay();
  const diffToSunday = (7 - day) % 7;
  const end = new Date(date);
  end.setUTCDate(date.getUTCDate() + diffToSunday);
  return endOfUtcDay(end);
}

function startOfIsoWeek(date: Date): Date {
  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() + diffToMonday);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function nextWeekday(base: Date, weekdayIndex: number): Date {
  const start = new Date(base);
  start.setUTCHours(0, 0, 0, 0);
  let diff = weekdayIndex - start.getUTCDay();
  if (diff <= 0) {
    diff += 7;
  }

  start.setUTCDate(start.getUTCDate() + diff);
  return endOfUtcDay(start);
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function extractDeadlineText(
  normalizedText: string,
): { raw: string; kind: string } | undefined {
  const patterns: Array<[RegExp, string]> = [
    [/\btomorrow\b/, "tomorrow"],
    [/\bnext week\b/, "next_week"],
    [/\bthis week\b/, "this_week"],
    [/\bthis month\b/, "this_month"],
    [/\bby (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/, "weekday"],
    [
      /\b(before )?(the )?end of (january|february|march|april|may|june|july|august|september|october|november|december)\b/,
      "end_of_month",
    ],
    [/\bq([1-4])(?:\s+(\d{4}))?\b/, "quarter"],
  ];

  for (const [pattern, kind] of patterns) {
    const match = normalizedText.match(pattern);
    if (match?.[0]) {
      return { raw: match[0], kind };
    }
  }

  return undefined;
}

export function detectAmbiguityNotes(text: string): string[] {
  const normalized = normalizeText(text);
  const notes: string[] = [];

  if (/\b(probably|maybe|roughly|around|ish|hopefully|expect|expected)\b/.test(normalized)) {
    notes.push("Timing language is tentative.");
  }

  if (/\bcoming weeks\b/.test(normalized)) {
    notes.push("Deadline references a vague multi-week window.");
  }

  if (/\bafter the next phase\b/.test(normalized)) {
    notes.push("Deadline depends on another undefined milestone.");
  }

  if (/\bbasically done\b/.test(normalized)) {
    notes.push("Completion language is subjective rather than deadline-bound.");
  }

  if (/\bsoon\b/.test(normalized) && !/\b(next week|this week|this month)\b/.test(normalized)) {
    notes.push("Timing uses vague 'soon' language.");
  }

  return notes;
}

export function parseDeadlineFromText(input: {
  text: string;
  sourcePostedAt?: string;
  sourceTimezone?: string;
}): ParsedDeadline {
  const sourceDate = input.sourcePostedAt
    ? new Date(input.sourcePostedAt)
    : new Date();

  const normalized = normalizeText(input.text);
  const ambiguityNotes = detectAmbiguityNotes(input.text);
  const extracted = extractDeadlineText(normalized);
  const timezone = input.sourceTimezone ?? "UTC";

  if (!extracted) {
    return { ambiguityNotes };
  }

  if (extracted.kind === "tomorrow") {
    const next = new Date(sourceDate);
    next.setUTCDate(next.getUTCDate() + 1);
    return {
      deadlineText: extracted.raw,
      deadlineAt: endOfUtcDay(next).toISOString(),
      deadlineTimezone: timezone,
      deadlineConfidence: 0.95,
      ambiguityNotes,
    };
  }

  if (extracted.kind === "this_week") {
    return {
      deadlineText: extracted.raw,
      deadlineAt: endOfIsoWeek(sourceDate).toISOString(),
      deadlineTimezone: timezone,
      deadlineConfidence: 0.85,
      ambiguityNotes,
    };
  }

  if (extracted.kind === "next_week") {
    const nextWeekStart = startOfIsoWeek(sourceDate);
    nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);
    return {
      deadlineText: extracted.raw,
      deadlineAt: endOfIsoWeek(nextWeekStart).toISOString(),
      deadlineTimezone: timezone,
      deadlineConfidence: 0.7,
      ambiguityNotes,
    };
  }

  if (extracted.kind === "this_month") {
    return {
      deadlineText: extracted.raw,
      deadlineAt: endOfUtcMonth(
        sourceDate.getUTCFullYear(),
        sourceDate.getUTCMonth(),
      ).toISOString(),
      deadlineTimezone: timezone,
      deadlineConfidence: 0.85,
      ambiguityNotes,
    };
  }

  if (extracted.kind === "weekday") {
    const weekdayMatch = normalized.match(
      /\bby (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/,
    );
    const weekday = weekdayMatch?.[1];

    if (weekday) {
      const index = WEEKDAY_NAMES.indexOf(weekday as (typeof WEEKDAY_NAMES)[number]);

      return {
        deadlineText: extracted.raw,
        deadlineAt: nextWeekday(sourceDate, index).toISOString(),
        deadlineTimezone: timezone,
        deadlineConfidence: 0.82,
        ambiguityNotes,
      };
    }
  }

  if (extracted.kind === "end_of_month") {
    const match = normalized.match(
      /\b(before )?(the )?end of (january|february|march|april|may|june|july|august|september|october|november|december)\b/,
    );
    const monthName = match?.[3];

    if (monthName) {
      let year = sourceDate.getUTCFullYear();
      const monthIndex = MONTH_NAMES.indexOf(
        monthName as (typeof MONTH_NAMES)[number],
      );

      if (monthIndex < sourceDate.getUTCMonth()) {
        year += 1;
      }

      return {
        deadlineText: extracted.raw,
        deadlineAt: endOfUtcMonth(year, monthIndex).toISOString(),
        deadlineTimezone: timezone,
        deadlineConfidence: 0.78,
        ambiguityNotes,
      };
    }
  }

  if (extracted.kind === "quarter") {
    const match = normalized.match(/\bq([1-4])(?:\s+(\d{4}))?\b/);
    const quarter = Number(match?.[1]);
    const year = match?.[2] ? Number(match[2]) : sourceDate.getUTCFullYear();

    if (quarter >= 1 && quarter <= 4) {
      return {
        deadlineText: extracted.raw,
        deadlineAt: endOfUtcQuarter(year, quarter).toISOString(),
        deadlineTimezone: timezone,
        deadlineConfidence: 0.8,
        ambiguityNotes,
      };
    }
  }

  return { ambiguityNotes };
}
