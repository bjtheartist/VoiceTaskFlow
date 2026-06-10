const TZ = process.env.APP_TIMEZONE || "America/Chicago";

/** Today's date as YYYY-MM-DD in the app timezone. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** "Tuesday, June 10" style label for a YYYY-MM-DD string. */
export function dayLabel(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Short "Jun 10" label. */
export function shortLabel(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Relative day name: Today / Yesterday / weekday+date. */
export function relativeLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return "Today";
  const y = new Date(today + "T12:00:00");
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);
  if (iso === yesterday) return "Yesterday";
  return dayLabel(iso);
}
