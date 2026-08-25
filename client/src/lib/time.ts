/** ATLAS TIME — محرك العرض: يعتمد على Intl/IANA ويدع DST تلقائياً. */
import type { City } from "@/data/cities";

export type Language = "ar" | "en";

const locale = (language: Language, calendar?: "gregory" | "islamic") =>
  language === "ar"
    ? `ar-SA-u-ca-${calendar ?? "gregory"}-nu-latn`
    : `en-GB-u-ca-${calendar ?? "gregory"}-nu-latn`;

export function cityName(city: City, language: Language) {
  return language === "ar" ? city.nameAr : city.nameEn;
}

export function countryName(city: City, language: Language) {
  return language === "ar" ? city.countryAr : city.countryEn;
}

export function timeParts(date: Date, city: City, language: Language, is24Hour = true) {
  const formatter = new Intl.DateTimeFormat(locale(language), {
    timeZone: city.timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !is24Hour,
  });
  const parts = formatter.formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return { hour: pick("hour"), minute: pick("minute"), second: pick("second"), dayPeriod: pick("dayPeriod") };
}

export function timeString(date: Date, city: City, language: Language, is24Hour = true, seconds = false) {
  const parts = timeParts(date, city, language, is24Hour);
  return `${parts.hour}:${parts.minute}${seconds ? `:${parts.second}` : ""}${parts.dayPeriod ? ` ${parts.dayPeriod}` : ""}`;
}

export function decimalHour(date: Date, city: City) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: city.timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const h = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const m = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return h + m / 60;
}

export function gregorianDate(date: Date, city: City, language: Language) {
  return new Intl.DateTimeFormat(locale(language, "gregory"), {
    timeZone: city.timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function hijriDate(date: Date, city: City, language: Language) {
  return new Intl.DateTimeFormat(locale(language, "islamic"), {
    timeZone: city.timezone,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function timezoneLabel(date: Date, city: City) {
  const zone = new Intl.DateTimeFormat("en-GB", { timeZone: city.timezone, timeZoneName: "shortOffset" })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;
  return zone?.replace("GMT", "GMT ") ?? city.timezone;
}

export function shortDateTime(date: Date, city: City, language: Language) {
  return new Intl.DateTimeFormat(locale(language), {
    timeZone: city.timezone,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function localStatus(date: Date, city: City, language: Language) {
  const hour = decimalHour(date, city);
  if (hour >= 9 && hour < 17) return language === "ar" ? "ضمن ساعات العمل" : "Within working hours";
  if (hour >= 7 && hour < 21) return language === "ar" ? "خارج ساعات العمل" : "Outside working hours";
  return language === "ar" ? "ليل محلي" : "Local night";
}

export function isDaytime(date: Date, city: City) {
  const hour = decimalHour(date, city);
  return hour >= 6 && hour < 18;
}

export function zonedTimeToUtc(input: string, city: City) {
  const [datePart, timePart] = input.split("T");
  if (!datePart || !timePart) return new Date();
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const approximate = Date.UTC(year, month - 1, day, hour, minute);
  let best = approximate;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (let offset = -900; offset <= 900; offset += 15) {
    const candidate = new Date(approximate + offset * 60_000);
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: city.timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(candidate);
    const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value ?? 0);
    const candidateMinutes = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"));
    const desiredMinutes = Date.UTC(year, month - 1, day, hour, minute);
    const delta = Math.abs(candidateMinutes - desiredMinutes);
    if (delta < bestDelta) { bestDelta = delta; best = candidate.getTime(); }
    if (delta === 0) break;
  }
  return new Date(best);
}

