import { ID_PATTERN } from '../lib/api.js';

export default function CompanyForm({ company, busy, onSave, onCancel }) {
  return <form className="hi-project-form" onSubmit={async event => {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget, values = new FormData(form);
    if (await onSave({ code: values.get('code'), name: values.get('name').trim(),
      ...(values.get('clearCallback') ? { callbackUrl: null } : values.get('callbackUrl') ? { callbackUrl: values.get('callbackUrl') } : {}) })) form.reset();
  }}>
    <label>Company ID<input name="code" required pattern={ID_PATTERN} maxLength={128} defaultValue={company?.code || ''} disabled={busy}/></label>
    <label>Company Name<input name="name" required maxLength={200} defaultValue={company?.name || ''} disabled={busy}/></label>
    <label>Public tool callback (optional, write only)<input name="callbackUrl" maxLength={2000} autoComplete="off" disabled={busy} placeholder="https://tool.example/result?projectId={pid}&status={status}"/></label>
    {company && <label><input type="checkbox" name="clearCallback" disabled={busy}/>Remove configured callback</label>}
    <p className="hi-muted">Leave callback blank when editing to keep it. Supported query values: {'{pid}, {uid}, {status}'}. HTTPS URLs only; credentials are unsupported.</p>
    <div className="hi-actions"><button disabled={busy}>{busy ? 'Saving…' : 'Save company'}</button><button type="button" className="hi-secondary" disabled={busy} onClick={onCancel}>Cancel</button></div>
  </form>;
}
