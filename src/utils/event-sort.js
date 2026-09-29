/** End of event day (or start if no end) for past/upcoming checks. */
function eventEndMs(ev) {
  const raw = ev.endDate || ev.startDate;
  if (!raw) return null;
  const d = new Date(raw);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/** Upcoming if no date yet (TBD) or end/start is today or later. */
function isUpcomingEvent(ev) {
  const endMs = eventEndMs(ev);
  if (endMs == null) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return endMs >= today.getTime();
}

function startMs(ev) {
  return ev.startDate ? new Date(ev.startDate).getTime() : null;
}

/** Upcoming first (soonest / TBD at top), then past (most recent first). */
function sortEventsForDisplay(events) {
  const upcoming = [];
  const past = [];
  for (const ev of events) {
    (isUpcomingEvent(ev) ? upcoming : past).push(ev);
  }

  upcoming.sort((a, b) => {
    const sa = startMs(a);
    const sb = startMs(b);
    if (sa == null && sb == null) return 0;
    if (sa == null) return -1;
    if (sb == null) return 1;
    return sa - sb;
  });

  past.sort((a, b) => {
    const sa = startMs(a);
    const sb = startMs(b);
    if (sa == null && sb == null) return 0;
    if (sa == null) return 1;
    if (sb == null) return -1;
    return sb - sa;
  });

  return [...upcoming, ...past];
}

module.exports = { isUpcomingEvent, sortEventsForDisplay };
