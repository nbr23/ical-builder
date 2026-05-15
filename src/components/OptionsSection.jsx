import { useEffect, useRef, useState } from 'react';
import { UserIcon, BellIcon, PlusIcon, XIcon } from './icons.jsx';

const REMINDER_OPTS = [
  { v: '0', l: 'No reminder' },
  { v: '5', l: '5 minutes before' },
  { v: '10', l: '10 minutes before' },
  { v: '15', l: '15 minutes before' },
  { v: '30', l: '30 minutes before' },
  { v: '60', l: '1 hour before' },
  { v: '120', l: '2 hours before' },
  { v: '1440', l: '1 day before' },
];

export default function OptionsSection({ data, onChange, isOpen }) {
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 380);
    return () => clearTimeout(t);
  }, [isOpen]);

  const isValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const add = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!isValid(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    if (data.attendees.includes(email)) {
      setEmailError('Already in the list');
      return;
    }
    onChange('attendees', [...data.attendees, email]);
    setEmailInput('');
    setEmailError('');
    inputRef.current?.focus();
  };

  const remove = (email) =>
    onChange(
      'attendees',
      data.attendees.filter((a) => a !== email)
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <label className="field-label">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <UserIcon size={11} color="var(--text-muted)" /> Attendees
          </span>
        </label>

        <div style={{ display: 'flex', gap: 8, marginBottom: emailError ? 6 : 10 }}>
          <input
            ref={inputRef}
            type="email"
            className="field-input"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setEmailError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                add();
              }
            }}
            placeholder="attendee@example.com"
            style={{ fontFamily: 'var(--mono)', fontSize: 13 }}
          />
          <button
            className="btn-primary"
            onClick={add}
            style={{ flexShrink: 0, padding: '10px 14px', gap: 5 }}
          >
            <PlusIcon size={14} color="white" />
            Add
          </button>
        </div>

        {emailError && (
          <p style={{ fontSize: 12, color: 'oklch(50% 0.18 20)', marginBottom: 8 }}>
            {emailError}
          </p>
        )}

        {data.attendees.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.attendees.map((email) => (
              <div key={email} className="chip">
                {email}
                <button
                  className="chip-remove"
                  onClick={() => remove(email)}
                  aria-label={`Remove ${email}`}
                >
                  <XIcon size={11} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>
            No attendees yet — type an email and press Enter or comma to add.
          </p>
        )}
      </div>

      <div style={{ marginBottom: 0 }}>
        <label className="field-label">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <BellIcon size={11} color="var(--text-muted)" /> Reminder
          </span>
        </label>
        <select
          className="field-input"
          value={data.reminder}
          onChange={(e) => onChange('reminder', e.target.value)}
        >
          {REMINDER_OPTS.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
        {data.reminder !== '0' && (
          <p style={{ marginTop: 6, fontSize: 12, color: 'var(--text-faint)' }}>
            A VALARM block will be embedded in the .ics file.
          </p>
        )}
      </div>
    </div>
  );
}
