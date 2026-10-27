import { useEffect, useRef, useState } from 'react';
import { OUTCOMES, request } from '../lib/api.js';
import Outcome from './Outcome.jsx';

export default function RecordedOutcome({ expectedStatus }) {
  // Keep the proof in memory only; remove it before rendering links or requesting assets.
  const [receipt] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('receipt'));
  const [record, setRecord] = useState(null);
  const pending = useRef(null);
  const [error, setError] = useState(() => receipt ? null : 'No verified outcome confirmation was supplied.');
  useEffect(() => {
    window.history.replaceState(null, '', window.location.pathname);
    document.title = 'Outcome confirmation | HARWINN INSIGHTS';
    const referrer = document.createElement('meta');
    referrer.name = 'referrer';
    referrer.content = 'no-referrer';
    document.head.appendChild(referrer);
    let active = true;
    const cleanup = () => { active = false; referrer.remove(); };
    if (!receipt) return cleanup;
    pending.current ??= request('/api/tracking/outcome', { method: 'POST', body: { receipt, expectedStatus } });
    pending.current.then(data => {
      if (!active) return;
      if (!OUTCOMES.includes(data.status) || data.status !== expectedStatus || typeof data.uid !== 'string' || typeof data.pid !== 'string') {
        setError('This address does not match the recorded outcome.');
      } else setRecord({status:data.status,uid:data.uid,pid:data.pid,respondentIp:typeof data.respondentIp === 'string' ? data.respondentIp : null});
    }, err => { if (active) setError(err.message); });
    return cleanup;
  }, [receipt, expectedStatus]);
  if (record) return <Outcome status={record.status} verified publicRecord={record} />;
  return <div className="hi-app hi-center hi-outcome"><section className="hi-panel">
    <h1>{error ? 'Unable to verify outcome' : 'Verifying your outcome…'}</h1>
    <p role="status">{error || 'Please keep this page open while we confirm your recorded response.'}</p>
    {!error && <p className="hi-muted">We record the network address of this request with your response when available.</p>}
    <a href="/">Visit HARWINN INSIGHTS</a>
  </section></div>;
}
