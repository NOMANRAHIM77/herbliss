const pakistanDate = new Intl.DateTimeFormat("en-PK", {
  timeZone: "Asia/Karachi",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const displayDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});

function isWorkingDay(date: Date) {
  return date.getUTCDay() !== 0 && date.getUTCDay() !== 6;
}

function addWorkingDays(date: Date, days: number) {
  const result = new Date(date);
  let remaining = days;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    if (isWorkingDay(result)) remaining -= 1;
  }
  return result;
}

export function getDeliveryDates(now: Date, estimatedWorkingDays: number) {
  // Use UTC for date-only arithmetic after choosing today's date in Pakistan.
  const parts = pakistanDate.formatToParts(now);
  const read = (type: "year" | "month" | "day") =>
    Number(parts.find((part) => part.type === type)?.value);
  const ordered = new Date(
    Date.UTC(read("year"), read("month") - 1, read("day")),
  );
  const dispatchStart = addWorkingDays(ordered, 1);
  const dispatchEnd = addWorkingDays(ordered, 2);
  // Count the order date as day one when it falls on a working day.
  const firstWorkingDay = isWorkingDay(ordered) ? ordered : dispatchStart;
  const delivered = addWorkingDays(firstWorkingDay, estimatedWorkingDays - 1);

  return [
    displayDate.format(ordered),
    displayDate.formatRange(dispatchStart, dispatchEnd),
    displayDate.format(delivered),
  ] as const;
}
