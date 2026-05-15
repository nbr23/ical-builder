import { useEffect, useState } from 'react';
import AboutSection from './components/AboutSection.jsx';
import DateTimeSection from './components/DateTimeSection.jsx';
import LocationSection from './components/LocationSection.jsx';
import OptionsSection from './components/OptionsSection.jsx';
import PreviewCard from './components/PreviewCard.jsx';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  GithubIcon,
} from './components/icons.jsx';

const SECTION_ORDER = ['about', 'dateTime', 'location', 'options'];

function StatusBadge({ status }) {
  const cfg =
    {
      pending: {
        label: 'Pending',
        background: 'var(--bg)',
        color: 'var(--text-faint)',
        border: '1.5px solid var(--border)',
      },
      editing: {
        label: 'Editing',
        background: 'var(--accent)',
        color: 'white',
        border: '1.5px solid var(--accent)',
      },
      done: {
        label: 'Done',
        background: 'var(--success-light)',
        color: 'var(--success)',
        border: '1.5px solid oklch(80% 0.07 150)',
      },
    }[status] || {};

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 9px',
        borderRadius: 100,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        flexShrink: 0,
        ...cfg,
      }}
    >
      {status === 'done' && (
        <span style={{ display: 'flex' }}>
          <CheckIcon size={10} color="var(--success)" />
        </span>
      )}
      {cfg.label}
    </span>
  );
}

function AccordionSection({
  number,
  title,
  icon,
  status,
  isOpen,
  onToggle,
  onConfirm,
  confirmLabel,
  children,
}) {
  return (
    <div
      style={{
        background: 'white',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: isOpen ? 'var(--shadow)' : 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '15px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
            background:
              status === 'done'
                ? 'var(--success-light)'
                : isOpen
                  ? 'var(--accent-light)'
                  : 'var(--bg)',
            border: `1.5px solid ${
              status === 'done'
                ? 'oklch(80% 0.07 150)'
                : isOpen
                  ? 'var(--accent-mid)'
                  : 'var(--border)'
            }`,
          }}
        >
          {status === 'done' ? (
            <span style={{ display: 'flex', color: 'var(--success)' }}>
              <CheckIcon size={13} color="var(--success)" />
            </span>
          ) : (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'var(--mono)',
                color: isOpen ? 'var(--accent)' : 'var(--text-faint)',
              }}
            >
              {number}
            </span>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            minWidth: 0,
          }}
        >
          <span
            style={{
              display: 'flex',
              flexShrink: 0,
              color:
                status === 'done'
                  ? 'var(--success)'
                  : isOpen
                    ? 'var(--accent)'
                    : 'var(--text-muted)',
            }}
          >
            {icon}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </span>
        </div>

        <StatusBadge status={status} />

        <span
          style={{
            display: 'flex',
            flexShrink: 0,
            color: 'var(--text-faint)',
            transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ChevronDownIcon size={15} />
        </span>
      </button>

      <div className={`accordion-body${isOpen ? ' open' : ''}`}>
        <div style={{ padding: '4px 18px 20px' }}>
          {children}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={onConfirm}>
              <span style={{ display: 'flex' }}>
                <CheckIcon size={13} color="white" />
              </span>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressDots({ statuses }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {SECTION_ORDER.map((s) => (
          <div
            key={s}
            style={{
              width: statuses[s] === 'done' ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background:
                statuses[s] === 'done'
                  ? 'var(--accent)'
                  : statuses[s] === 'editing'
                    ? 'var(--accent-mid)'
                    : 'var(--border)',
              transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'var(--mono)',
          color: 'var(--text-muted)',
        }}
      >
        {SECTION_ORDER.filter((s) => statuses[s] === 'done').length}/4
      </span>
    </div>
  );
}

function defaultTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

const STORAGE_KEY = 'ical-builder-state-v1';

const defaultEventData = () => ({
  about: {
    title: '',
    description: '',
    organizerName: '',
    organizerEmail: '',
    url: '',
  },
  dateTime: {
    date: null,
    startTime: { hour: '9', minute: '00', period: 'AM' },
    endTime: { hour: '10', minute: '00', period: 'AM' },
    timezone: defaultTimezone(),
    recurrence: 'none',
    weeklyDays: [],
    endMode: 'after',
    occurrences: '10',
    customRrule: '',
  },
  location: { address: '', lat: null, lng: null, conferenceUrl: '' },
  options: { attendees: [], reminder: '15' },
});

const defaultStatuses = () => ({
  about: 'editing',
  dateTime: 'pending',
  location: 'pending',
  options: 'pending',
});

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const defaults = defaultEventData();
    const ed = parsed.eventData || {};
    const merged = {
      about: { ...defaults.about, ...ed.about },
      dateTime: { ...defaults.dateTime, ...ed.dateTime },
      location: { ...defaults.location, ...ed.location },
      options: { ...defaults.options, ...ed.options },
    };
    if (merged.dateTime.date) merged.dateTime.date = new Date(merged.dateTime.date);
    return {
      eventData: merged,
      statuses: { ...defaultStatuses(), ...(parsed.statuses || {}) },
      openSection: parsed.openSection ?? 'about',
    };
  } catch {
    return null;
  }
}

export default function App() {
  const [persisted] = useState(loadPersisted);
  const [eventData, setEventData] = useState(persisted?.eventData ?? defaultEventData);
  const [statuses, setStatuses] = useState(persisted?.statuses ?? defaultStatuses);
  const [openSection, setOpenSection] = useState(persisted?.openSection ?? 'about');

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ eventData, statuses, openSection })
      );
    } catch {
      /* quota or disabled storage — silently ignore */
    }
  }, [eventData, statuses, openSection]);

  const clearAll = () => {
    if (!window.confirm('Clear all fields and start over?')) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setEventData(defaultEventData());
    setStatuses(defaultStatuses());
    setOpenSection('about');
  };

  const update = (section, key, val) =>
    setEventData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: val },
    }));

  const confirm = (id) => {
    const idx = SECTION_ORDER.indexOf(id);
    setStatuses((prev) => {
      const next = { ...prev, [id]: 'done' };
      if (idx < SECTION_ORDER.length - 1) {
        const nxt = SECTION_ORDER[idx + 1];
        if (next[nxt] === 'pending') next[nxt] = 'editing';
      }
      return next;
    });
    setOpenSection(idx < SECTION_ORDER.length - 1 ? SECTION_ORDER[idx + 1] : null);
  };

  const toggle = (id) => {
    if (openSection === id) {
      setOpenSection(null);
      return;
    }
    setOpenSection(id);
    setStatuses((prev) =>
      prev[id] === 'pending' ? { ...prev, [id]: 'editing' } : prev
    );
  };

  const sectionDefs = [
    {
      id: 'about',
      number: '01',
      title: 'About',
      confirmLabel: 'Save About',
      icon: <CalendarIcon size={15} />,
      content: (
        <AboutSection
          data={eventData.about}
          onChange={(k, v) => update('about', k, v)}
          isOpen={openSection === 'about'}
        />
      ),
    },
    {
      id: 'dateTime',
      number: '02',
      title: 'Date & Time',
      confirmLabel: 'Save Date & Time',
      icon: <ClockIcon size={15} />,
      content: (
        <DateTimeSection
          data={eventData.dateTime}
          onChange={(k, v) => update('dateTime', k, v)}
        />
      ),
    },
    {
      id: 'location',
      number: '03',
      title: 'Location',
      confirmLabel: 'Save Location',
      icon: <MapPinIcon size={15} />,
      content: (
        <LocationSection
          data={eventData.location}
          onChange={(k, v) => update('location', k, v)}
          isOpen={openSection === 'location'}
        />
      ),
    },
    {
      id: 'options',
      number: '04',
      title: 'Options',
      confirmLabel: 'Save Options',
      icon: <BellIcon size={15} />,
      content: (
        <OptionsSection
          data={eventData.options}
          onChange={(k, v) => update('options', k, v)}
          isOpen={openSection === 'options'}
        />
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 'var(--header-h)',
          background: 'oklch(99% 0.004 80 / 0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <a
          href="https://github.com/nbr23/ical-builder"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Fork on GitHub"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-faint)',
            textDecoration: 'none',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.02em',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
        >
          <GithubIcon size={13} />
          <span>Fork on GitHub</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: 'var(--accent)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ display: 'flex', color: 'white' }}>
              <CalendarIcon size={15} color="white" />
            </span>
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            ical<span style={{ color: 'var(--accent)' }}>.build</span>
          </span>
        </div>

        <ProgressDots statuses={statuses} />
      </header>

      <main
        style={{
          maxWidth: 620,
          margin: '0 auto',
          padding: '22px 16px 100px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {sectionDefs.map((s) => (
          <AccordionSection
            key={s.id}
            number={s.number}
            title={s.title}
            icon={s.icon}
            status={statuses[s.id]}
            isOpen={openSection === s.id}
            onToggle={() => toggle(s.id)}
            onConfirm={() => confirm(s.id)}
            confirmLabel={s.confirmLabel}
          >
            {s.content}
          </AccordionSection>
        ))}

        <div style={{ marginTop: 12 }}>
          <PreviewCard eventData={eventData} statuses={statuses} onClear={clearAll} />
        </div>
      </main>
    </div>
  );
}
