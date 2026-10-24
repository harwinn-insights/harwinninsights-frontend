import { useEffect, useRef, useState } from 'react';
import { navigate } from '../lib/navigation.js';
import { ErrorMessage } from './ui.jsx';
import CompanyForm from './CompanyForm.jsx';

export default function Companies({ api }) {
  const [companies, setCompanies] = useState([]), [loading, setLoading] = useState(true);
  const [error, setError] = useState(null), [notice, setNotice] = useState('');
  const [adding, setAdding] = useState(false), [busy, setBusy] = useState(false);
  const [query, setQuery] = useState(''), [field, setField] = useState('all'), [revision, setRevision] = useState(0);
  const pending = useRef(false);
  useEffect(() => {
    const abort = new AbortController(); let active = true;
    // eslint-disable-next-line react/set-state-in-effect -- Reset state for an external refresh.
    setLoading(true); setError(null);
    api('/api/companies', { signal: abort.signal }).then(data => {
      if (active) { setCompanies(data.companies); setLoading(false); }
    }, err => { if (active && err.name !== 'AbortError') { setError(err); setLoading(false); } });
    return () => { active = false; abort.abort(); };
  }, [api, revision]);
  async function save(data) {
    if (pending.current) return false;
    pending.current = true; setBusy(true); setError(null); setNotice('');
    try {
      await api('/api/companies', { method: 'POST', body: data });
      setAdding(false); setNotice('Company created.'); setRevision(n => n + 1); return true;
    } catch (err) { setError(err); return false; }
    finally { pending.current = false; setBusy(false); }
  }
  const search = query.trim().toLocaleLowerCase();
  const visible = companies.filter(company => (field === 'all' ? [company.code, company.name] : [company[field]])
    .some(value => value.toLocaleLowerCase().includes(search)));
  return <>
    <div className="hi-page-heading"><div><p className="hi-eyebrow">ADMIN</p><h1>Companies</h1><p>Manage each company’s projects and permanent outcome links.</p></div>
      <div className="hi-actions"><button disabled={busy} onClick={() => setAdding(true)}>Add Company</button><button className="hi-secondary" disabled={busy || loading} onClick={() => setRevision(n => n + 1)}>Refresh</button></div>
    </div>
    <ErrorMessage error={error}/>{notice && <p role="status">{notice}</p>}
    {error && !adding && <button className="hi-secondary" onClick={() => setRevision(n => n + 1)}>Retry</button>}
    {adding && <section className="hi-panel"><h2>Add Company</h2><CompanyForm busy={busy} onSave={save} onCancel={() => setAdding(false)}/></section>}
    <section className="hi-panel" aria-busy={loading}>
      <div className="hi-filters"><label>Search companies<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Company name or ID"/></label>
        <label>Search by<select value={field} onChange={e => setField(e.target.value)}><option value="all">Name and ID</option><option value="name">Name</option><option value="code">Company ID</option></select></label></div>
      {loading ? <p role="status">Loading companies…</p> : !error && <>
        <p className="hi-muted">{visible.length} of {companies.length} companies</p>
        {!companies.length ? <p>No companies yet. Add a company to start creating projects.</p> : !visible.length ? <p>No companies match your search.</p> :
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map(company => <article className="rounded-xl border border-slate-200 p-5" key={company.id}>
            <p className="hi-eyebrow break-words">{company.code}</p><h2 className="break-words">{company.name}</h2>
            <a href={`/admin/projects/companies/${company.id}`} onClick={e => { e.preventDefault(); navigate(`/admin/projects/companies/${company.id}`); }} aria-label={`Manage ${company.name}`}>Manage →</a>
          </article>)}</div>}
      </>}
    </section>
  </>;
}
