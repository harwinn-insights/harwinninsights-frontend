import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Projects from '../src/admin/Projects.jsx';
import Router from '../src/Router.jsx';

const company={id:'11111111-1111-4111-8111-111111111111',code:'ALPHA',name:'Alpha Research'};
const other={id:'22222222-2222-4222-8222-222222222222',code:'BETA',name:'Beta Research'};
const project={id:'33333333-3333-4333-8333-333333333333',companyId:company.id,company,pid:'EXTERNAL-1',name:'Alpha study',active:true,assignments:[]};
const admin={id:'admin',role:'ADMIN'};
const statuses=['COMPLETE','TERMINATE','QUOTAFUL','DISQUALIFY'];
const links={links:Object.fromEntries(statuses.map(s=>[s,`/redirect/company/${company.id}/${s}`])),projectParameter:'projectId',paramMap:{uid:'respondent',transactionId:'attempt',username:'name',inTime:'started'}};
function mockApi() {
  return vi.fn(async(path,options)=>{
    if(options?.method)return {id:'synthetic-result'};
    if(path==='/api/companies')return {companies:[company,other]};
    if(path==='/api/users')return {users:[]};
    if(path.endsWith('/links'))return links;
    if(path.startsWith('/api/projects?'))return {projects:[project]};
    throw new Error('Unexpected synthetic API path');
  });
}
const formValue=(label,value)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});

it('company landing searches locally by name or company ID and has no project mutation form',async()=>{
  const api=mockApi();render(<Projects api={api} user={admin}/>);
  await screen.findByRole('link',{name:'Manage Alpha Research'});
  expect(screen.queryByLabelText('Project ID')).toBeNull();
  formValue('Search companies',' beta ');
  expect(screen.queryByRole('link',{name:'Manage Alpha Research'})).toBeNull();
  expect(screen.getByRole('link',{name:'Manage Beta Research'}).getAttribute('href')).toBe(`/admin/projects/companies/${other.id}`);
  formValue('Search by','code');formValue('Search companies','Research');
  expect(screen.getByText('No companies match your search.')).toBeTruthy();
  expect(api.mock.calls.every(([path])=>path==='/api/companies')).toBe(true);
});

it('company landing supports empty, loading and recoverable error states',async()=>{
  const api=vi.fn().mockRejectedValueOnce(new Error('Synthetic unavailable')).mockResolvedValue({companies:[]});
  render(<Projects api={api} user={admin}/>);
  expect(screen.getByRole('status').textContent).toContain('Loading');
  await screen.findByText('Synthetic unavailable');fireEvent.click(screen.getByRole('button',{name:'Retry'}));
  await screen.findByText(/No companies yet/);
});

it('Add Company uses existing company fields and retains input on rejected saves',async()=>{
  const base=mockApi();let saves=0;
  const api=vi.fn((path,options)=>options?.method==='POST'?(++saves===1?Promise.reject(new Error('Company already exists')):Promise.resolve(company)):base(path,options));
  render(<Projects api={api} user={admin}/>);
  fireEvent.click(screen.getByRole('button',{name:'Add Company'}));
  formValue('Company ID','NEW');formValue('Company Name','New company');
  fireEvent.submit(screen.getByRole('button',{name:'Save company'}).closest('form'));
  await screen.findByText('Company already exists');expect(screen.getByLabelText('Company Name').value).toBe('New company');
  fireEvent.submit(screen.getByRole('button',{name:'Save company'}).closest('form'));
  await screen.findByText('Company created.');
  expect(api).toHaveBeenCalledWith('/api/companies',{method:'POST',body:{code:'NEW',name:'New company'}});
});

it('dedicated company page loads scoped projects and all four links, with mapped copy actions',async()=>{
  const api=mockApi(),writeText=vi.fn(async()=>{});
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText}});
  render(<Projects api={api} user={admin} companyId={company.id}/>);
  await screen.findByText(project.name);
  expect(screen.queryByText('Survey launch')).toBeNull();
  expect(screen.queryByLabelText('Provider initial URL')).toBeNull();
  expect(api).toHaveBeenCalledWith(`/api/projects?page=1&pageSize=25&companyId=${company.id}`,expect.anything());
  for(const status of statuses){
    fireEvent.click(screen.getByRole('button',{name:`Copy ${status} link`}));
    await screen.findByText(`${status} link copied.`);
    const url=new URL(writeText.mock.calls.at(-1)[0]);
    expect(url.pathname).toBe(links.links[status]);
    expect(Object.fromEntries(url.searchParams)).toEqual({projectId:'{PID}',respondent:'{UID}'});
    expect(url.href).not.toContain(project.pid);
    expect(screen.getByText(new URL(links.links[status],window.location.origin).href)).toBeTruthy();
    expect(screen.getByRole('link',{name:`Preview ${status}`}).getAttribute('href')).toBe(`/tracking/${status.toLowerCase()}`);
  }
});

it('retired legacy UI path is not routed and company landing has no legacy navigation',async()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  window.history.replaceState({},'','/admin/projects/legacy');
  const view=render(<Router/>);
  expect(screen.getByRole('heading',{name:'Page not found'})).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
  view.unmount();render(<Projects api={mockApi()} user={admin}/>);
  await screen.findByRole('heading',{name:'Companies'});
  expect(screen.queryByRole('link',{name:/legacy/i})).toBeNull();
});

it('project creation fixes ownership to loaded company even if form data is tampered',async()=>{
  const api=mockApi();render(<Projects api={api} user={admin} companyId={company.id}/>);
  fireEvent.click(await screen.findByRole('button',{name:'Add Project'}));
  expect(screen.getByLabelText('Company').readOnly).toBe(true);
  formValue('Project Name','New study');formValue('Project ID','CLIENT-PID');
  const form=screen.getByRole('button',{name:'Add project'}).closest('form');
  const hidden=document.createElement('input');hidden.name='companyId';hidden.value=other.id;form.appendChild(hidden);
  fireEvent.submit(form);await screen.findByText('Project created.');
  expect(api).toHaveBeenCalledWith('/api/projects',{method:'POST',body:{name:'New study',pid:'CLIENT-PID',companyId:company.id}});
});

it('project editing never submits companyId and preserves internal UUID',async()=>{
  const api=mockApi();render(<Projects api={api} user={admin} companyId={company.id}/>);
  fireEvent.click(await screen.findByRole('button',{name:'Edit'}));
  expect(screen.getByLabelText('Company').readOnly).toBe(true);
  formValue('Project Name','Updated');formValue('Project ID','UPDATED-PID');
  fireEvent.submit(screen.getByRole('button',{name:'Save changes'}).closest('form'));
  await screen.findByText('Project updated.');
  expect(api).toHaveBeenCalledWith(`/api/projects/${project.id}`,{method:'PATCH',body:{name:'Updated',pid:'UPDATED-PID',active:true}});
});

it('company edit keeps write-only callback on blank and sends null only on explicit removal',async()=>{
  const api=mockApi();render(<Projects api={api} user={admin} companyId={company.id}/>);
  fireEvent.click(await screen.findByRole('button',{name:'Edit company'}));
  formValue('Company Name','Renamed');fireEvent.submit(screen.getByRole('button',{name:'Save company'}).closest('form'));
  await screen.findByText('Company updated.');
  expect(api).toHaveBeenCalledWith(`/api/companies/${company.id}`,{method:'PATCH',body:{code:company.code,name:'Renamed'}});
  fireEvent.click(await screen.findByRole('button',{name:'Edit company'}));
  fireEvent.click(screen.getByLabelText('Remove configured callback'));
  fireEvent.submit(screen.getByRole('button',{name:'Save company'}).closest('form'));
  await waitFor(()=>expect(api).toHaveBeenCalledWith(`/api/companies/${company.id}`,{method:'PATCH',body:{code:company.code,name:company.name,callbackUrl:null}}));
});

it('does not expose another company projects or mutation controls on unknown company',async()=>{
  const api=mockApi();const view=render(<Projects api={api} user={admin} companyId={other.id}/>);
  await screen.findByRole('heading',{name:other.name});expect(screen.queryByText(project.name)).toBeNull();
  view.rerender(<Projects api={api} user={admin} companyId="44444444-4444-4444-8444-444444444444"/>);
  await screen.findByText(/Company not found/);expect(screen.queryByRole('button',{name:'Add Project'})).toBeNull();
});

it('restricted users keep assigned projects and cannot open company management',async()=>{
  const api=mockApi();const user={id:'restricted',role:'USER'};
  const view=render(<Projects api={api} user={user}/>);await screen.findByText(project.name);
  expect(api.mock.calls.every(([p])=>p.startsWith('/api/projects?'))).toBe(true);
  expect(screen.queryByRole('button',{name:'Edit'})).toBeNull();
  api.mockClear();view.rerender(<Projects api={api} user={user} companyId={company.id}/>);
  await screen.findByText('Administrator access required.');expect(api).not.toHaveBeenCalled();
});

it('company pagination retains server company filter and resets page on size changes',async()=>{
  const base=mockApi();const api=vi.fn((path,options)=>path.startsWith('/api/projects?')?Promise.resolve({projects:Array.from({length:25},(_,i)=>({...project,id:`synthetic-${i}`}))}):base(path,options));
  render(<Projects api={api} user={admin} companyId={company.id}/>);
  await screen.findAllByText(project.name);fireEvent.click(screen.getByRole('button',{name:'Next'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith(`/api/projects?page=2&pageSize=25&companyId=${company.id}`,expect.anything()));
  formValue('Rows','10');
  await waitFor(()=>expect(api).toHaveBeenCalledWith(`/api/projects?page=1&pageSize=10&companyId=${company.id}`,expect.anything()));
});

it('router supports direct company links, Projects sidebar state, breadcrumbs and browser back',async()=>{
  sessionStorage.setItem('harwinn-session',JSON.stringify({token:'s'.repeat(43),expiresAt:new Date(Date.now()+600000).toISOString(),admin:{email:'synthetic@example.test'}}));
  const api=mockApi();
  vi.stubGlobal('fetch',vi.fn(async url=>{
    const parsed=new URL(url,'https://synthetic.invalid');
    const value=parsed.pathname==='/api/auth/me'?admin:await api(parsed.pathname+parsed.search);
    return new Response(JSON.stringify(value),{status:200});
  }));
  window.history.replaceState({},'',`/admin/projects/companies/${company.id}`);render(<Router/>);
  await screen.findByRole('heading',{name:company.name});
  const navigation=screen.getByRole('navigation',{name:'Admin navigation'});
  expect(within(navigation).getAllByRole('link').map(a=>[a.textContent,a.getAttribute('href')])).toEqual([['Overview','/admin/dashboard'],['Tracking Records','/admin/records'],['Admin','/admin/projects']]);
  expect(within(navigation).getByRole('link',{name:'Admin'}).getAttribute('aria-current')).toBe('page');
  fireEvent.click(within(screen.getByRole('navigation',{name:'Breadcrumb'})).getByRole('link'));
  await screen.findByRole('heading',{name:'Companies'});
  window.history.replaceState({},'',`/admin/projects/companies/${company.id}`);fireEvent.popState(window);
  await screen.findByRole('heading',{name:company.name});
});
