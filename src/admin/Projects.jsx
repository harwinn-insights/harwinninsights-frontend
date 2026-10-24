import { useEffect, useRef, useState } from 'react';
import { ID_PATTERN } from '../lib/api.js';
import { navigate } from '../lib/navigation.js';
import { ErrorMessage, Pager } from './ui.jsx';
import Companies from './Companies.jsx';
import CompanyForm from './CompanyForm.jsx';

export default function Projects({ api, user, companyId }) {
  const admin = !user?.role || user.role === 'ADMIN';
  if (admin && !companyId) return <Companies api={api}/>;
  if (!admin && companyId) return <><h1>Company management</h1><p role="alert">Administrator access required.</p><a href="/admin/projects" onClick={e => { e.preventDefault(); navigate('/admin/projects'); }}>Back to assigned projects</a></>;
  return <ProjectWorkspace key={companyId || 'assigned'} api={api} user={user} admin={admin} companyId={companyId}/>;
}

function ProjectWorkspace({ api, user, admin, companyId }) {
  const pending = useRef(false);
  const [loading, setLoading] = useState(true), [projects, setProjects] = useState([]), [companies, setCompanies] = useState([]), [users, setUsers] = useState([]), [links, setLinks] = useState(null);
  const [error, setError] = useState(null), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState(null), [adding, setAdding] = useState(false), [companyEdit, setCompanyEdit] = useState(false), [deleting, setDeleting] = useState(null);
  const [page, setPage] = useState(1), [pageSize, setPageSize] = useState(25);
  const company = companies.find(c => c.id === companyId);
  useEffect(() => {
    const abort = new AbortController(), options = { signal: abort.signal }; let active = true;
    // eslint-disable-next-line react/set-state-in-effect -- Reset state for external scoped requests.
    setLoading(true); setError(null);
    Promise.all([
      api(`/api/projects?page=${page}&pageSize=${pageSize}${companyId ? '&companyId=' + encodeURIComponent(companyId) : ''}`, options),
      ...(admin ? [api('/api/companies', options), api('/api/users', options)] : []),
      ...(companyId ? [api(`/api/companies/${companyId}/links`, options)] : []),
    ]).then(([p, c, u, l]) => {
      if (!active) return;
      setProjects(p.projects); setCompanies(c?.companies || []); setUsers(u?.users || []); setLinks(l || null); setLoading(false);
    }, err => { if (active && err.name !== 'AbortError') { setError(err); setLoading(false); } });
    return () => { active = false; abort.abort(); };
  }, [api, admin, companyId, page, pageSize, revision]);
  async function mutate(path, method, body, message = 'Saved.') {
    if (pending.current) return false;
    pending.current = true; setBusy(true); setError(null); setNotice('');
    try {
      await api(path, { method, body }); setRevision(n => n + 1); setEditing(null); setAdding(false); setCompanyEdit(false); setDeleting(null); setNotice(message); return true;
    } catch (err) { setError(err); return false; }
    finally { pending.current = false; setBusy(false); }
  }
  const visible = projects.filter(p => companyId ? p.companyId === companyId : !!p.companyId);
  function projectForm(project) {
    return <form className="hi-project-form" key={project?.id || 'new'} onSubmit={async e => {
      e.preventDefault(); if (pending.current) return;
      const form = e.currentTarget, values = new FormData(form);
      // Ownership is context-only on creation and is NEVER included in edits.
      if ((!project && !company) || (project && companyId && project.companyId !== companyId)) { setError(new Error('Project does not belong to this company.')); return; }
      const body = { name: values.get('name').trim(), pid: values.get('pid') || null,
        ...(project ? { active: values.get('active') === 'on' } : { companyId: company.id }) };
      if (await mutate(project ? `/api/projects/${project.id}` : '/api/projects', project ? 'PATCH' : 'POST', body, project ? 'Project updated.' : 'Project created.')) form.reset();
    }}>
      <label>Company<input readOnly value={company ? `${company.code} - ${company.name}` : ''}/></label>
      <label>Project Name<input name="name" required maxLength={200} defaultValue={project?.name || ''} disabled={busy}/></label>
      <label>Project ID<input name="pid" required={!project} pattern={ID_PATTERN} maxLength={128} defaultValue={project?.pid || ''} disabled={busy}/></label>
      {project && <label>Accept callbacks<input type="checkbox" name="active" defaultChecked={project.active} disabled={busy}/></label>}
      <div className="hi-actions"><button disabled={busy}>{project ? 'Save changes' : 'Add project'}</button><button type="button" className="hi-secondary" disabled={busy} onClick={() => { setEditing(null); setAdding(false); }}>Cancel</button></div>
    </form>;
  }
  function callbackUrl(path) {
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    return new URL(base + path, window.location.origin).href;
  }
  function callbackTemplate(path) {
      const params = new URLSearchParams({ [links.projectParameter || 'projectId']: '{PID}' });
      params.set(links.paramMap.uid, '{UID}');
      return callbackUrl(path) + '?' + params.toString().replaceAll('%7BPID%7D', '{PID}').replaceAll('%7BUID%7D', '{UID}');
  }
  async function copyLink(status, path) {
    try {
      await navigator.clipboard.writeText(callbackTemplate(path)); setNotice(`${status} link copied.`);
    } catch { setError(new Error('Copy unavailable. Use the displayed path and parameter mapping.')); }
  }
  return <>
    {admin && <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap gap-2"><a href="/admin/projects" onClick={e => { e.preventDefault(); navigate('/admin/projects'); }}>Admin / Companies</a><span aria-hidden="true">/</span><span aria-current="page">{company?.name || 'Company'}</span></nav>}
    <div className="hi-page-heading"><div><p className="hi-eyebrow">ADMIN</p><h1>{company?.name || (companyId ? 'Company management' : 'Assigned projects')}</h1></div><button className="hi-secondary" disabled={busy || loading} onClick={() => setRevision(n => n + 1)}>Refresh</button></div>
    <ErrorMessage error={error}/>{notice && <p role="status">{notice}</p>}
    {error && <button className="hi-secondary" disabled={busy} onClick={() => setRevision(n => n + 1)}>Retry</button>}
    {loading ? <p role="status">Loading projects...</p> : !error && companyId && !company ? <p role="alert">Company not found. Return to Companies and select an existing company.</p> : <>
      {admin && company && <>
        <section className="hi-panel"><div className="hi-page-heading"><h2>Company details</h2><button className="hi-secondary" disabled={busy} onClick={() => setCompanyEdit(true)}>Edit company</button></div>
          <dl className="grid gap-4 sm:grid-cols-2"><div><dt className="hi-muted">Company ID</dt><dd>{company.code}</dd></div><div><dt className="hi-muted">Company name</dt><dd>{company.name}</dd></div></dl>
          {companyEdit && <CompanyForm key={company.id} company={company} busy={busy} onSave={body => mutate(`/api/companies/${company.id}`, 'PATCH', body, 'Company updated.')} onCancel={() => setCompanyEdit(false)}/>}
        </section>
        <section className="hi-panel"><h2>Permanent outcome links</h2><p>Configure these four company callbacks once in the provider’s survey platform. They stay the same for every project. The provider supplies the current external PID and UID dynamically. Internal references are managed by Harwinn. Respondents use the provider’s survey URL directly.</p>
          <p className="hi-muted">URLs use VITE_API_BASE_URL, or the current origin when a same-origin API proxy is configured. Verify that configuration before sharing. Templates contain placeholders, not real respondent or project data.</p>
          {links && Object.entries(links.links).map(([status, path]) => <div className="mb-4" key={status}><strong>{status}</strong><p>Permanent company callback URL</p><code className="block break-all my-2">{callbackUrl(path)}</code><p>Dynamic parameter template — replace placeholders using the provider’s fields</p><code className="block break-all my-2">{callbackTemplate(path)}</code>
            <div className="hi-actions"><button className="hi-secondary" onClick={() => copyLink(status, path)}>Copy {status} link</button><a href={'/tracking/' + status.toLowerCase()} target="_blank" rel="noreferrer">Preview {status}</a></div></div>)}
          {links && <pre className="overflow-x-auto">{JSON.stringify({uid: links.paramMap.uid}, null, 2)}</pre>}
        </section>
        <section className="hi-panel"><div className="hi-page-heading"><h2>Company projects</h2><button disabled={busy} onClick={() => { setAdding(true); setEditing(null); }}>Add Project</button></div>
          {adding && <><h3>Create Project</h3>{projectForm(null)}<p>PID is the external project identifier, unique within this company. Internal UUIDs are assigned by the backend.</p></>}
        </section>
      </>}
      <section className="hi-panel hi-table-wrap" aria-busy={loading}><table><thead><tr>{['Company', 'Project ID', 'Project Name', 'Internal UUID', 'Status', 'Assignments', 'Actions'].map(title => <th key={title}>{title}</th>)}</tr></thead>
        <tbody>{visible.map(project => <tr key={project.id}><td>{project.company ? `${project.company.code} - ${project.company.name}` : 'Company'}</td><td>{project.pid || 'Not assigned'}</td><td>{project.name}</td><td>{project.id}</td><td>{project.active ? 'Active' : 'Inactive'}</td>
          <td>{project.assignments?.length || 0} assigned{admin && users.map(member => { const assigned = project.assignments?.some(a => a.adminId === member.id); return <label key={member.id}><input type="checkbox" checked={!!assigned} disabled={busy} onChange={() => mutate(`/api/projects/${project.id}/assignments/${member.id}`, assigned ? 'DELETE' : 'PUT')}/>{member.email} ({member.role})</label>; })}</td>
          <td>{admin && <div className="hi-actions"><button disabled={busy} onClick={() => { setEditing(project); setAdding(false); }}>Edit</button><button className="hi-danger" disabled={busy} onClick={() => setDeleting(project)}>Delete</button></div>}</td></tr>)}</tbody></table>
        {!visible.length && !error && <p>No projects yet</p>}
        <Pager page={page} pageSize={pageSize} count={projects.length} onPage={setPage} onSize={size => { setPageSize(size); setPage(1); }} disabled={busy || loading}/>
      </section>
      {editing && <section className="hi-panel"><h2>Edit project</h2>{projectForm(editing)}<p>Editing the external PID preserves the internal UUID and history. Project ownership cannot be changed here.</p></section>}
      {deleting && <section className="hi-panel"><h2>Delete {deleting.name}?</h2><p>Only projects without tracking history can be deleted.</p><div className="hi-actions"><button className="hi-danger" disabled={busy} onClick={() => mutate(`/api/projects/${deleting.id}`, 'DELETE')}>Confirm deletion</button><button className="hi-secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancel</button></div></section>}
      {admin && <section className="hi-panel"><h2>Manage existing users</h2>{users.map(member => <div className="hi-actions" key={member.id}><span>{member.email}</span><select aria-label={`Role for ${member.email}`} disabled={busy || member.id === user?.id} value={member.role} onChange={e => mutate(`/api/users/${member.id}`, 'PATCH', { role: e.target.value })}><option>ADMIN</option><option>USER</option></select><label><input type="checkbox" checked={member.active} disabled={busy || member.id === user?.id} onChange={e => mutate(`/api/users/${member.id}`, 'PATCH', { active: e.target.checked })}/>Active</label></div>)}</section>}
    </>}
  </>;
}
