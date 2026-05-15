import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPinIcon, SearchIcon, SpinnerIcon, VideoIcon } from './icons.jsx';

// Leaflet bundles relative image URLs that break under Vite — point them at the imported assets.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export default function LocationSection({ data, onChange, isOpen }) {
  const [query, setQuery] = useState(data.address || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const mapDiv = useRef(null);
  const mapInst = useRef(null);
  const marker = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => searchRef.current?.focus(), 380);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!showDrop) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(data.address || '');
    }
  }, [data.address, showDrop]);

  useEffect(() => {
    if (!isOpen || mapInst.current) return;
    const t = setTimeout(() => {
      if (!mapDiv.current || mapInst.current) return;
      const map = L.map(mapDiv.current, { zoomControl: true }).setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        placeMarker(map, lat, lng);
        onChange('lat', lat);
        onChange('lng', lng);
        reverseGeocode(lat, lng);
      });

      mapInst.current = map;
      setMapReady(true);

      if (data.lat && data.lng) {
        placeMarker(map, data.lat, data.lng);
        map.setView([data.lat, data.lng], 13);
      }
    }, 380);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        mapInst.current && mapInst.current.invalidateSize();
      }, 420);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (mapInst.current) {
        mapInst.current.remove();
        mapInst.current = null;
      }
    };
  }, []);

  function placeMarker(map, lat, lng) {
    if (marker.current) marker.current.remove();
    marker.current = L.marker([lat, lng]).addTo(map);
  }

  async function reverseGeocode(lat, lng) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
      );
      const j = await r.json();
      if (j.display_name) {
        setQuery(j.display_name);
        onChange('address', j.display_name);
      }
    } catch {
      /* noop */
    }
  }

  const doSearch = useCallback(
    debounce(async (q) => {
      if (!q || q.length < 3) {
        setResults([]);
        setGeoError('');
        return;
      }
      setSearching(true);
      setGeoError('');
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(q)}&addressdetails=1`
        );
        const j = await r.json();
        setResults(j);
        if (j.length > 0) setShowDrop(true);
        else setGeoError('No locations found — try a different query.');
      } catch {
        setGeoError('Search unavailable — check your connection.');
      } finally {
        setSearching(false);
      }
    }, 480),
    []
  );

  const pickResult = (r) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setQuery(r.display_name);
    onChange('address', r.display_name);
    onChange('lat', lat);
    onChange('lng', lng);
    setShowDrop(false);
    setResults([]);
    if (mapInst.current) {
      placeMarker(mapInst.current, lat, lng);
      mapInst.current.setView([lat, lng], 14);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label className="field-label">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <MapPinIcon size={11} color="var(--text-muted)" /> Address
          </span>
        </label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <input
              ref={searchRef}
              type="text"
              className="field-input"
              value={query}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                onChange('address', v);
                doSearch(v);
              }}
              onFocus={() => results.length > 0 && setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 180)}
              placeholder="Search for an address or place…"
              style={{ paddingLeft: 36 }}
            />
            <span
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                pointerEvents: 'none',
                color: 'var(--text-faint)',
              }}
            >
              {searching ? <SpinnerIcon size={15} /> : <SearchIcon size={15} />}
            </span>
          </div>

          {showDrop && results.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                zIndex: 400,
                background: 'white',
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
            >
              {results.map((r, i) => (
                <div
                  key={i}
                  onMouseDown={() => pickResult(r)}
                  style={{
                    padding: '10px 12px',
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 9,
                    alignItems: 'flex-start',
                    borderBottom:
                      i < results.length - 1 ? '1px solid var(--bg)' : 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                >
                  <span style={{ marginTop: 1, flexShrink: 0, color: 'var(--accent)' }}>
                    <MapPinIcon size={14} />
                  </span>
                  <span style={{ lineHeight: 1.45, color: 'var(--text)' }}>
                    {r.display_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {geoError && (
          <p style={{ marginTop: 6, fontSize: 12, color: 'oklch(50% 0.15 30)' }}>
            {geoError}
          </p>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <div
          ref={mapDiv}
          style={{
            height: 260,
            borderRadius: 10,
            border: '1.5px solid var(--border)',
            overflow: 'hidden',
            background: 'var(--bg)',
          }}
        />
        {!mapReady && isOpen && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              pointerEvents: 'none',
            }}
          >
            <SpinnerIcon size={24} />
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: -10 }}>
        Search an address above, or click anywhere on the map to drop a pin.
      </p>

      <div className="field-group" style={{ marginBottom: 0 }}>
        <label className="field-label">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <VideoIcon size={11} color="var(--text-muted)" /> Conference / Video Link
          </span>
        </label>
        <input
          type="url"
          className="field-input"
          value={data.conferenceUrl}
          onChange={(e) => onChange('conferenceUrl', e.target.value)}
          placeholder="https://meet.google.com/abc-def-ghi"
          style={{ fontFamily: 'var(--mono)', fontSize: 13 }}
        />
      </div>
    </div>
  );
}
