function generateUID() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 11) +
    '@icalbuilder'
  );
}

function to24h(hour, minute, period) {
  let h = parseInt(hour, 10);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return { h, m: parseInt(minute, 10) };
}

export function formatICSDate(date, hour, minute, period) {
  if (!date) return null;
  const { h, m } = to24h(hour, minute, period);
  const d = new Date(date);
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, '0');
  const D = String(d.getDate()).padStart(2, '0');
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${Y}${M}${D}T${hh}${mm}00`;
}

function escapeText(text) {
  return (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function foldLine(line) {
  if (line.length <= 75) return line;
  const parts = [line.substring(0, 75)];
  for (let i = 75; i < line.length; i += 74) {
    parts.push(' ' + line.substring(i, i + 74));
  }
  return parts.join('\r\n');
}

function buildRRULE(recurrence, weeklyDays, endMode, occurrences, customRrule) {
  const dayMap = {
    sun: 'SU',
    mon: 'MO',
    tue: 'TU',
    wed: 'WE',
    thu: 'TH',
    fri: 'FR',
    sat: 'SA',
  };
  if (!recurrence || recurrence === 'none') return null;
  if (recurrence === 'custom') return customRrule || null;

  const countClause =
    endMode === 'never' ? '' : `;COUNT=${parseInt(occurrences, 10) || 10}`;

  if (recurrence === 'daily') return `FREQ=DAILY${countClause}`;
  if (recurrence === 'monthly') return `FREQ=MONTHLY${countClause}`;
  if (recurrence === 'weekly') {
    const days = (weeklyDays || [])
      .map((d) => dayMap[d])
      .filter(Boolean)
      .join(',');
    return `FREQ=WEEKLY${days ? ';BYDAY=' + days : ''}${countClause}`;
  }
  return null;
}

export function generateICS(eventData) {
  const { about, dateTime, location, options } = eventData;
  const uid = generateUID();
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}Z`;
  const dtstart = formatICSDate(
    dateTime.date,
    dateTime.startTime.hour,
    dateTime.startTime.minute,
    dateTime.startTime.period
  );
  const dtend = formatICSDate(
    dateTime.date,
    dateTime.endTime.hour,
    dateTime.endTime.minute,
    dateTime.endTime.period
  );
  const tz = dateTime.timezone || 'UTC';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ical.build//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
  ];

  if (dtstart) lines.push(`DTSTART;TZID=${tz}:${dtstart}`);
  if (dtend) lines.push(`DTEND;TZID=${tz}:${dtend}`);
  if (about.title) lines.push(`SUMMARY:${escapeText(about.title)}`);
  if (about.description)
    lines.push(`DESCRIPTION:${escapeText(about.description)}`);
  if (about.url) lines.push(`URL:${about.url}`);
  if (about.organizerName && about.organizerEmail)
    lines.push(
      `ORGANIZER;CN=${escapeText(about.organizerName)}:mailto:${about.organizerEmail}`
    );
  if (location.address) lines.push(`LOCATION:${escapeText(location.address)}`);
  if (location.lat && location.lng)
    lines.push(`GEO:${location.lat};${location.lng}`);
  if (location.conferenceUrl)
    lines.push(`X-CONFERENCE-URL:${location.conferenceUrl}`);

  (options.attendees || []).forEach((email) => {
    lines.push(`ATTENDEE;RSVP=TRUE:mailto:${email}`);
  });

  const rrule = buildRRULE(
    dateTime.recurrence,
    dateTime.weeklyDays,
    dateTime.endMode,
    dateTime.occurrences,
    dateTime.customRrule
  );
  if (rrule) lines.push(`RRULE:${rrule}`);

  const reminder = parseInt(options.reminder, 10);
  if (reminder > 0) {
    lines.push('BEGIN:VALARM');
    const h = Math.floor(reminder / 60);
    const m = reminder % 60;
    lines.push(
      `TRIGGER:-PT${h > 0 ? h + 'H' : ''}${m > 0 ? m + 'M' : h === 0 ? '0M' : ''}`
    );
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Reminder: ${escapeText(about.title || 'Event')}`);
    lines.push('END:VALARM');
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n');
}

export function downloadICS(eventData) {
  const content = generateICS(eventData);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(eventData.about.title || 'event')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function getAllTimezones() {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'Pacific/Honolulu',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Europe/Madrid',
      'Europe/Moscow',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Singapore',
      'Asia/Kolkata',
      'Asia/Dubai',
      'Australia/Sydney',
      'Pacific/Auckland',
      'America/Sao_Paulo',
      'America/Toronto',
      'America/Vancouver',
      'America/Mexico_City',
      'Africa/Lagos',
      'Africa/Cairo',
    ];
  }
}
