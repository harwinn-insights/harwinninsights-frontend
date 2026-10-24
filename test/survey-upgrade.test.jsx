import { it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Projects from '../src/admin/Projects.jsx';

import { RecordTable } from '../src/admin/Records.jsx';

const company={id:'550e8400-e29b-41d4-a716-446655440001',code:'C',name:'Client'};
const project={id:'550e8400-e29b-41d4-a716-446655440002',companyId:company.id,company,pid:'26073041',name:'Study',active:true};

it('Manage Company scopes the project request and creates with readonly company and required PID',async()=>{
  const api=vi.fn(async(path,options)=>{
    if(path==='/api/companies')return {companies:[company]};
    if(path==='/api/users')return {users:[]};
    if(path.endsWith('/links'))return {links:{},paramMap:{uid:'uid',transactionId:'transactionId'},projectParameter:'projectId'};
    if(options?.method==='POST')return {...project,...options.body};
    return {projects:[project]};
  });
  render(<Projects api={api} user={{role:'ADMIN'}} companyId={company.id}/>);
  const user=userEvent.setup();
  await user.click(await screen.findByRole('button',{name:'Add Project'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith(expect.stringContaining('companyId='+company.id),expect.anything()));
  const companyField=screen.getByLabelText('Company');
  expect(companyField.tagName).toBe('INPUT'); expect(companyField.readOnly).toBe(true);
  expect(companyField.value).toContain('Client');
  expect(screen.getByLabelText('Project ID').required).toBe(true);
  await user.type(screen.getByLabelText('Project ID'),'NEW');
  await user.type(screen.getByLabelText('Project Name'),'New study');
  await user.click(screen.getByRole('button',{name:'Add project'}));
  await screen.findByText('Project created.');
  expect(api).toHaveBeenCalledWith('/api/projects',{method:'POST',body:{companyId:company.id,pid:'NEW',name:'New study'}});
});

it('tracking columns align and repeated UID/PID attempts stay separate with null metadata',()=>{
  const records=['TERMINATE','DISQUALIFY','COMPLETE','TERMINATE'].map((status,i)=>({serial:String(i+1),projectId:project.id,project,uid:'RAHU1001',status,transactionId:'t'+i}));
  render(<RecordTable records={records}/>);
  const rows=screen.getAllByRole('row'); expect(rows).toHaveLength(5);
  const cells=within(rows[1]).getAllByRole('cell');
  expect(cells).toHaveLength(within(rows[0]).getAllByRole('columnheader').length);
  expect(cells[1].textContent).toBe('C — Client'); expect(cells[2].textContent).toBe(project.id);
  expect(cells[3].textContent).toBe(project.pid); expect(cells[4].textContent).toBe('RAHU1001');
  expect(cells[6].textContent).toBe('TERMINATE'); expect(cells[9].textContent).toBe('—');
  expect(cells[12].textContent).toBe('t0');
});
