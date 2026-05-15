import {
  CalendarIcon,
  RepeatIcon,
  MapPinIcon,
  VideoIcon,
  UserIcon,
  MailIcon,
  BellIcon,
  DownloadIcon,
} from './icons.jsx';
import { downloadICS } from '../ics.js';

const DAY_MAP = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
};

function fmtTime(t) {
  return `${t.hour}:${t.minute} ${t.period}`;
}

function fmtDate(d) {
  if (!d) return null;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function fmtReminder(v) {
  if (v === '0') return null;
  if (v === '60') return '1 hour before';
  if (v === '120') return '2 hours before';
  if (v === '1440') return '1 day before';
  return `${v} minutes before`;
}

function fmtRecurrence(rec, days, endMode, occ) {
  if (!rec || rec === 'none') return null;
  const tail = endMode === 'never' ? 'forever' : `${occ} times`;
  if (rec === 'daily') return `Daily · ${tail}`;
  if (rec === 'monthly') return `Monthly · ${tail}`;
  if (rec === 'weekly') {
    const d = (days || []).map((x) => DAY_MAP[x]).join(', ');
    return `Weekly${d ? ' on ' + d : ''} · ${tail}`;
  }
  if (rec === 'custom') return 'Custom recurrence';
  return null;
}

function Row({ icon, children, mono }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>
        {icon}
      </span>
      <span
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          fontFamily: mono ? 'var(--mono)' : 'var(--font)',
        }}
      >
        {children}
      </span>
    </div>
  );
}

export default function PreviewCard({ eventData, statuses, onClear }) {
  const { about, dateTime, location, options } = eventData;
  const doneCount = Object.values(statuses).filter((s) => s === 'done').length;
  const canDownload = !!about.title;

  const recStr = fmtRecurrence(
    dateTime.recurrence,
    dateTime.weeklyDays,
    dateTime.endMode,
    dateTime.occurrences
  );
  const hasContent =
    about.title || dateTime.date || location.address || about.description;

  return (
    <div
      style={{
        background: 'white',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 4,
          background:
            'linear-gradient(90deg, var(--accent) 0%, oklch(62% 0.18 300) 100%)',
        }}
      />

      <div style={{ padding: '20px 22px 22px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                marginBottom: 5,
              }}
            >
              Live Preview
            </div>
            <h2
              style={{
                fontSize: 21,
                fontWeight: 700,
                color: about.title ? 'var(--text)' : 'var(--text-faint)',
                lineHeight: 1.2,
                textWrap: 'pretty',
              }}
            >
              {about.title || 'Untitled Event'}
            </h2>
          </div>
          {doneCount > 0 && (
            <span
              style={{
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'var(--mono)',
                color: 'var(--accent)',
                background: 'var(--accent-light)',
                padding: '4px 9px',
                borderRadius: 100,
                whiteSpace: 'nowrap',
              }}
            >
              {doneCount} / 4
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          {dateTime.date && (
            <Row icon={<CalendarIcon size={14} />}>
              <strong style={{ color: 'var(--text)', fontWeight: 600 }}>
                {fmtDate(dateTime.date)}
              </strong>
              <span style={{ fontFamily: 'var(--mono)', marginLeft: 6 }}>
                {fmtTime(dateTime.startTime)} – {fmtTime(dateTime.endTime)}
              </span>
              {dateTime.timezone && (
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.65 }}>
                  {dateTime.timezone.split('/').pop().replace(/_/g, ' ')}
                </span>
              )}
            </Row>
          )}

          {recStr && <Row icon={<RepeatIcon size={14} />}>{recStr}</Row>}

          {location.address && (
            <Row icon={<MapPinIcon size={14} />}>{location.address}</Row>
          )}

          {location.conferenceUrl && (
            <Row icon={<VideoIcon size={14} />} mono>
              <a
                href={location.conferenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--accent)',
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  maxWidth: '100%',
                }}
              >
                {location.conferenceUrl}
              </a>
            </Row>
          )}

          {about.organizerName && (
            <Row icon={<UserIcon size={14} />}>
              {about.organizerName}
              {about.organizerEmail && (
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    marginLeft: 6,
                    opacity: 0.7,
                  }}
                >
                  · {about.organizerEmail}
                </span>
              )}
            </Row>
          )}

          {options.attendees.length > 0 && (
            <Row icon={<MailIcon size={14} />}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {options.attendees.map((e) => (
                  <span
                    key={e}
                    style={{
                      fontSize: 11,
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                      padding: '2px 8px',
                      borderRadius: 100,
                      fontFamily: 'var(--mono)',
                      fontWeight: 500,
                    }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            </Row>
          )}

          {options.reminder !== '0' && fmtReminder(options.reminder) && (
            <Row icon={<BellIcon size={14} />}>{fmtReminder(options.reminder)}</Row>
          )}

          {about.description && (
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 10,
                marginTop: 3,
              }}
            >
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                {about.description}
              </p>
            </div>
          )}

          {!hasContent && (
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-faint)',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '10px 0',
              }}
            >
              Fill in the sections above to see your event here.
            </p>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button
            className="btn-primary"
            onClick={() => downloadICS(eventData)}
            disabled={!canDownload}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: 14,
              opacity: canDownload ? 1 : 0.45,
              cursor: canDownload ? 'pointer' : 'not-allowed',
            }}
          >
            <DownloadIcon size={15} color="white" />
            Download .ics File
          </button>
          {onClear && (
            <button
              onClick={onClear}
              style={{
                display: 'block',
                margin: '12px auto 0',
                padding: '4px 8px',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-faint)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
            >
              Clear all fields
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
