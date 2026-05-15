import { useState, useMemo, useRef, useEffect } from 'react';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeIcon,
  RepeatIcon,
  SearchIcon,
} from './icons.jsx';
import { getAllTimezones } from '../ics.js';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAY_NAMES_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const navBtnStyle = {
  width: 28,
  height: 28,
  border: '1.5px solid var(--border)',
  borderRadius: 7,
  background: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

function MiniCalendar({ selectedDate, onSelect }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [viewYear, setViewYear] = useState(
    () => (selectedDate || today).getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    () => (selectedDate || today).getMonth()
  );

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const next = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const isSel = (d) =>
    d &&
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === d;
  const isToday = (d) =>
    d &&
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;
  const isPast = (d) => d && new Date(viewYear, viewMonth, d) < today;

  return (
    <div style={{ userSelect: 'none' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <button onClick={prev} style={navBtnStyle}>
          <ChevronLeftIcon size={13} color="var(--text-muted)" />
        </button>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.01em',
          }}
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button onClick={next} style={navBtnStyle}>
          <ChevronRightIcon size={13} color="var(--text-muted)" />
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
          marginBottom: 4,
        }}
      >
        {DAY_NAMES_SHORT.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-faint)',
              padding: '3px 0',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          const sel = isSel(day);
          const past = isPast(day);
          const tod = isToday(day);
          return (
            <div
              key={i}
              onClick={() =>
                day && !past && onSelect(new Date(viewYear, viewMonth, day))
              }
              style={{
                textAlign: 'center',
                padding: '7px 2px',
                fontSize: 13,
                fontWeight: sel ? 700 : tod ? 600 : 400,
                borderRadius: 7,
                cursor: day && !past ? 'pointer' : 'default',
                background: sel ? 'var(--accent)' : 'transparent',
                color: !day
                  ? 'transparent'
                  : sel
                    ? 'white'
                    : past
                      ? 'var(--text-faint)'
                      : tod
                        ? 'var(--accent)'
                        : 'var(--text)',
                border:
                  tod && !sel
                    ? '1.5px solid var(--accent-mid)'
                    : '1.5px solid transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => {
                if (day && !past && !sel)
                  e.currentTarget.style.background = 'var(--accent-light)';
              }}
              onMouseLeave={(e) => {
                if (!sel) e.currentTarget.style.background = 'transparent';
              }}
            >
              {day || ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeSelector({ label, value, onChange }) {
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  return (
    <div>
      <label className="field-label">{label}</label>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <select
          className="field-input"
          value={value.hour}
          onChange={(e) => onChange({ ...value, hour: e.target.value })}
          style={{
            width: 72,
            fontFamily: 'var(--mono)',
            fontSize: 14,
            padding: '9px 26px 9px 10px',
            textAlign: 'center',
          }}
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          :
        </span>
        <select
          className="field-input"
          value={value.minute}
          onChange={(e) => onChange({ ...value, minute: e.target.value })}
          style={{
            width: 72,
            fontFamily: 'var(--mono)',
            fontSize: 14,
            padding: '9px 26px 9px 10px',
            textAlign: 'center',
          }}
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <div
          style={{
            display: 'flex',
            border: '1.5px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {['AM', 'PM'].map((p) => (
            <button
              key={p}
              onClick={() => onChange({ ...value, period: p })}
              style={{
                padding: '9px 11px',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'var(--font)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.12s',
                background: value.period === p ? 'var(--accent)' : 'white',
                color: value.period === p ? 'white' : 'var(--text-muted)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimezonePicker({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);
  const allTz = useMemo(() => getAllTimezones(), []);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q
      ? allTz.filter((tz) => tz.toLowerCase().includes(q)).slice(0, 80)
      : allTz.slice(0, 80);
  }, [allTz, query]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      const sel = listRef.current.querySelector('[data-selected="true"]');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label className="field-label">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <GlobeIcon size={11} color="var(--text-muted)" /> Timezone
        </span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          className="field-input"
          value={open ? query : value}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search timezone…"
          style={{ fontFamily: 'var(--mono)', fontSize: 13, paddingLeft: 34 }}
        />
        <span
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-faint)',
            pointerEvents: 'none',
            display: 'flex',
          }}
        >
          <SearchIcon size={14} />
        </span>
      </div>
      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 300,
            background: 'white',
            border: '1.5px solid var(--border)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {filtered.length === 0 && (
            <div
              style={{
                padding: '12px',
                fontSize: 13,
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}
            >
              No results
            </div>
          )}
          {filtered.map((tz) => (
            <div
              key={tz}
              data-selected={tz === value}
              onMouseDown={() => {
                onChange(tz);
                setOpen(false);
                setQuery('');
              }}
              style={{
                padding: '9px 12px',
                fontSize: 12,
                fontFamily: 'var(--mono)',
                cursor: 'pointer',
                color: tz === value ? 'var(--accent)' : 'var(--text)',
                background: tz === value ? 'var(--accent-light)' : 'transparent',
                fontWeight: tz === value ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (tz !== value) e.currentTarget.style.background = 'var(--bg)';
              }}
              onMouseLeave={(e) => {
                if (tz !== value) e.currentTarget.style.background = 'transparent';
              }}
            >
              {tz}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecurrencePicker({
  recurrence,
  weeklyDays,
  endMode,
  occurrences,
  customRrule,
  onChange,
}) {
  const opts = [
    { v: 'none', l: 'None' },
    { v: 'daily', l: 'Daily' },
    { v: 'weekly', l: 'Weekly' },
    { v: 'monthly', l: 'Monthly' },
    { v: 'custom', l: 'Custom' },
  ];
  const weekDayDefs = [
    { k: 'sun', l: 'S' },
    { k: 'mon', l: 'M' },
    { k: 'tue', l: 'T' },
    { k: 'wed', l: 'W' },
    { k: 'thu', l: 'T' },
    { k: 'fri', l: 'F' },
    { k: 'sat', l: 'S' },
  ];
  const toggle = (d) =>
    onChange(
      'weeklyDays',
      weeklyDays.includes(d)
        ? weeklyDays.filter((x) => x !== d)
        : [...weeklyDays, d]
    );

  return (
    <div>
      <label className="field-label">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <RepeatIcon size={11} color="var(--text-muted)" /> Recurrence
        </span>
      </label>
      <div
        style={{
          display: 'flex',
          gap: 3,
          background: 'var(--bg)',
          padding: '4px',
          borderRadius: 10,
          border: '1.5px solid var(--border)',
          marginBottom: 14,
        }}
      >
        {opts.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange('recurrence', o.v)}
            style={{
              flex: 1,
              padding: '7px 4px',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font)',
              border: 'none',
              borderRadius: 7,
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: recurrence === o.v ? 'white' : 'transparent',
              color: recurrence === o.v ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow:
                recurrence === o.v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {o.l}
          </button>
        ))}
      </div>
      {recurrence === 'weekly' && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {weekDayDefs.map((d) => (
            <div
              key={d.k}
              className={`day-check${weeklyDays.includes(d.k) ? ' checked' : ''}`}
              onClick={() => toggle(d.k)}
              title={d.k}
            >
              {d.l}
            </div>
          ))}
        </div>
      )}
      {['daily', 'weekly', 'monthly'].includes(recurrence) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Ends
          </span>
          <select
            className="field-input"
            value={endMode}
            onChange={(e) => onChange('endMode', e.target.value)}
            style={{ width: 'auto', fontSize: 13, padding: '9px 32px 9px 12px' }}
          >
            <option value="never">Never</option>
            <option value="after">After</option>
          </select>
          {endMode === 'after' && (
            <>
              <input
                type="number"
                className="field-input"
                value={occurrences}
                onChange={(e) => onChange('occurrences', e.target.value)}
                min="1"
                max="365"
                style={{
                  width: 72,
                  textAlign: 'center',
                  fontSize: 14,
                }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                occurrences
              </span>
            </>
          )}
        </div>
      )}
      {recurrence === 'custom' && (
        <div>
          <label className="field-label">RRULE String</label>
          <input
            type="text"
            className="field-input"
            value={customRrule}
            onChange={(e) => onChange('customRrule', e.target.value)}
            placeholder="FREQ=WEEKLY;BYDAY=MO,WE;COUNT=10"
            style={{ fontFamily: 'var(--mono)', fontSize: 12 }}
          />
          <p style={{ marginTop: 5, fontSize: 11, color: 'var(--text-faint)' }}>
            Enter a raw RRULE value per the iCalendar spec. Omit the &quot;RRULE:&quot; prefix.
          </p>
        </div>
      )}
    </div>
  );
}

export default function DateTimeSection({ data, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <label className="field-label">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CalendarIcon size={11} color="var(--text-muted)" /> Date
          </span>
        </label>
        <div
          style={{
            background: 'white',
            border: '1.5px solid var(--border)',
            borderRadius: 10,
            padding: '14px 16px',
          }}
        >
          <MiniCalendar
            selectedDate={data.date}
            onSelect={(d) => onChange('date', d)}
          />
          {data.date && (
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid var(--border)',
                fontSize: 12,
                color: 'var(--accent)',
                fontWeight: 600,
                fontFamily: 'var(--mono)',
              }}
            >
              {data.date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <TimeSelector
          label="Start Time"
          value={data.startTime}
          onChange={(v) => onChange('startTime', v)}
        />
        <TimeSelector
          label="End Time"
          value={data.endTime}
          onChange={(v) => onChange('endTime', v)}
        />
      </div>
      <TimezonePicker value={data.timezone} onChange={(v) => onChange('timezone', v)} />
      <RecurrencePicker
        recurrence={data.recurrence}
        weeklyDays={data.weeklyDays}
        endMode={data.endMode}
        occurrences={data.occurrences}
        customRrule={data.customRrule}
        onChange={onChange}
      />
    </div>
  );
}
