import { DateTime } from "luxon";

export const formatToLocal = (isoDate, timeZone = "America/La_Paz") => {
  return DateTime.fromISO(isoDate, { zone: "utc" })
    .setZone(timeZone)
    .toFormat("dd/MM/yyyy HH:mm");
};

export const getTimeRemaining = (isoDate, timeZone = "America/La_Paz") => {
  const now = DateTime.now().setZone(timeZone);
  const due = DateTime.fromISO(isoDate, { zone: "utc" }).setZone(timeZone);

  if (due <= now) return null;

  const diff = due.diff(now, ["days", "hours", "minutes"]).toObject();

  if (diff.days >= 1) {
    return `Faltan ${Math.floor(diff.days)} día(s) y ${Math.floor(diff.hours)} hora(s)`;
  }
  if (diff.hours >= 1) {
    return `Faltan ${Math.floor(diff.hours)} hora(s) y ${Math.floor(diff.minutes)} minuto(s)`;
  }
  return `Faltan ${Math.floor(diff.minutes)} minuto(s)`;
};