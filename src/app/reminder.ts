/**
 * Daily reminders without accounts or a server: a recurring calendar event the member adds to their
 * own calendar (Apple/Outlook via .ics, Google via a prefilled link). The calendar does the nudging,
 * on every platform including iPhone, which web push can't reach reliably.
 */
import { SITE } from "@/config/site";
import { PROGRAM_DAYS } from "./xp";

const pad = (n: number) => String(n).padStart(2, "0");
const local = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

export function reminderPlan(time: string, day: number) {
  const [h, m] = time.split(":").map(Number);
  const start = new Date();
  start.setHours(h, m, 0, 0);
  if (start.getTime() < Date.now()) start.setDate(start.getDate() + 1); // first reminder is the next occurrence
  const count = Math.max(7, PROGRAM_DAYS - day + 1);
  const end = new Date(start.getTime() + 10 * 60000);
  const title = "GlowMax · Today's protocol";
  const body = `A few minutes: today's routine and one task. ${SITE.url}/app`;
  return { start, end, count, title, body };
}

export function icsText(time: string, day: number) {
  const r = reminderPlan(time, day);
  const esc = (s: string) => s.replace(/[\\;,]/g, (c) => "\\" + c);
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GlowMax//Reminder//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:glowmax-daily-${Date.now()}@glowmax`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${local(r.start)}`, `DTEND:${local(r.end)}`,
    `RRULE:FREQ=DAILY;COUNT=${r.count}`,
    `SUMMARY:${esc(r.title)}`, `DESCRIPTION:${esc(r.body)}`, `URL:${SITE.url}/app`,
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(r.title)}`, "TRIGGER:PT0M", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(time: string, day: number) {
  const r = reminderPlan(time, day);
  const q = new URLSearchParams({ action: "TEMPLATE", text: r.title, details: r.body, dates: `${local(r.start)}/${local(r.end)}`, recur: `RRULE:FREQ=DAILY;COUNT=${r.count}` });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

export function downloadIcs(time: string, day: number) {
  const url = URL.createObjectURL(new Blob([icsText(time, day)], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "glowmax-daily.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** One-off calendar event for the next check-in photo, offered right after a check-in is saved. */
function checkinPlan(on: Date) {
  const start = new Date(on);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 10 * 60000);
  const title = "GlowMax · Check-in photo";
  const body = `Same spot, same light, same distance as last time. ${SITE.url}/app/checkin`;
  return { start, end, title, body };
}

export function checkinIcsText(on: Date) {
  const r = checkinPlan(on);
  const esc = (s: string) => s.replace(/[\\;,]/g, (c) => "\\" + c);
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GlowMax//Check-in//EN", "BEGIN:VEVENT",
    `UID:glowmax-checkin-${r.start.getTime()}@glowmax`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${local(r.start)}`, `DTEND:${local(r.end)}`,
    `SUMMARY:${esc(r.title)}`, `DESCRIPTION:${esc(r.body)}`, `URL:${SITE.url}/app/checkin`,
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(r.title)}`, "TRIGGER:PT0M", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

export function checkinGoogleUrl(on: Date) {
  const r = checkinPlan(on);
  const q = new URLSearchParams({ action: "TEMPLATE", text: r.title, details: r.body, dates: `${local(r.start)}/${local(r.end)}` });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

export function downloadCheckinIcs(on: Date) {
  const url = URL.createObjectURL(new Blob([checkinIcsText(on)], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "glowmax-next-checkin.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
