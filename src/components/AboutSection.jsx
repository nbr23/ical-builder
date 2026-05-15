import { useEffect, useRef, useState } from 'react';
import { UserIcon, MailIcon, LinkIcon } from './icons.jsx';

export default function AboutSection({ data, onChange, isOpen }) {
  const [titleFocused, setTitleFocused] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => titleRef.current?.focus(), 380);
    return () => clearTimeout(t);
  }, [isOpen]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label className="field-label">Event Title</label>
        <input
          ref={titleRef}
          type="text"
          value={data.title}
          onChange={(e) => onChange('title', e.target.value)}
          onFocus={() => setTitleFocused(true)}
          onBlur={() => setTitleFocused(false)}
          placeholder="Untitled Event"
          style={{
            width: '100%',
            fontSize: 26,
            fontWeight: 700,
            border: 'none',
            borderBottom: `2.5px solid ${titleFocused ? 'var(--accent)' : 'var(--border)'}`,
            outline: 'none',
            background: 'transparent',
            color: data.title ? 'var(--text)' : 'var(--text-faint)',
            padding: '6px 0 8px',
            transition: 'border-color 0.18s',
            fontFamily: 'var(--font)',
            lineHeight: 1.2,
          }}
        />
      </div>

      <div className="field-group">
        <label className="field-label">Description</label>
        <textarea
          className="field-input"
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="What's this event about? Who should attend?"
          rows={3}
          style={{ resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field-group">
          <label className="field-label">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <UserIcon size={11} color="var(--text-muted)" />
              Organizer Name
            </span>
          </label>
          <input
            type="text"
            className="field-input"
            value={data.organizerName}
            onChange={(e) => onChange('organizerName', e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="field-group">
          <label className="field-label">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MailIcon size={11} color="var(--text-muted)" />
              Organizer Email
            </span>
          </label>
          <input
            type="email"
            className="field-input"
            value={data.organizerEmail}
            onChange={(e) => onChange('organizerEmail', e.target.value)}
            placeholder="you@example.com"
            style={{ fontFamily: 'var(--mono)', fontSize: 13 }}
          />
        </div>
      </div>

      <div className="field-group" style={{ marginBottom: 0 }}>
        <label className="field-label">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <LinkIcon size={11} color="var(--text-muted)" />
            Event URL
          </span>
        </label>
        <input
          type="url"
          className="field-input"
          value={data.url}
          onChange={(e) => onChange('url', e.target.value)}
          placeholder="https://example.com/event"
          style={{ fontFamily: 'var(--mono)', fontSize: 13 }}
        />
      </div>
    </div>
  );
}
