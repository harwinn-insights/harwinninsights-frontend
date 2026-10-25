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

it('tracking columns show external PID and callback IP without substituting UUIDs or missing metadata',()=>{
  const records=['TERMINATE','DISQUALIFY','COMPLETE','QUOTAFUL'].map((status,i)=>({serial:String(i+1),projectId:project.id,project,uid:'RAHU1001',status,transactionId:'t'+i,ipAddress:i===0?'192.0.2.10':i===1?'2001:db8::10':null,loiSeconds:i===0?0:null}));
  records[2].project={...project,pid:null};
  records[3].project=null;
  render(<RecordTable records={records}/>);
  const rows=screen.getAllByRole('row'); expect(rows).toHaveLength(5);
  const headers=within(rows[0]).getAllByRole('columnheader').map(cell=>cell.textContent);
  expect(headers.slice(0,7)).toEqual(['Record ID','UID','PID (external)','Status / Outcome','IP','Company','Project UUID']);
  for(const [index,row] of rows.slice(1).entries()) {
    const cells=within(row).getAllByRole('cell');
    expect(cells).toHaveLength(headers.length);
    const value=heading=>cells[headers.indexOf(heading)].textContent;
    expect(value('UID')).toBe('RAHU1001');
    expect(value('PID (external)')).toBe(index<2?project.pid:'\u2014');
    expect(value('PID (external)')).not.toBe(project.id);
    expect(value('Project UUID')).toBe(project.id);
    expect(value('Status / Outcome')).toBe(records[index].status);
    expect(value('IP')).toBe(records[index].ipAddress || '\u2014');
    expect(value('LOI (seconds)')).toBe(index===0?'0':'\u2014');
    expect(value('Transaction ID')).toBe('t'+index);
    expect(value('Company')).toBe(index===3?'\u2014':'C \u2014 Client');
  }
  expect(screen.getByRole('region',{name:/Tracking records table/}).tabIndex).toBe(0);
  expect(screen.getByText(/not verified as the respondent/)).toBeTruthy();
});
