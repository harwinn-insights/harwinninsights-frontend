import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Records from '../src/admin/Records.jsx';
import { recordQuery } from '../src/lib/api.js';
// Pure backend query/schema functions only: no dotenv, Prisma or database access.
import { filters } from '../../Backend/src/lib/validation.js';
import { listRecords } from '../../Backend/src/services/tracking.js';

it('Record ID remains an exact bigint and invalid/out-of-range identifiers fail validation',()=>{
  expect(filters.parse({recordId:'9007199254740993'}).recordId).toBe(9007199254740993n);
  expect(filters.parse({recordId:'9223372036854775807'}).recordId).toBe(9223372036854775807n);
  for(const value of ['','0','-1','1.5','bad','01','9223372036854775808','1e5'])expect(filters.safeParse({recordId:value}).success).toBe(false);
  expect(filters.safeParse({companyName:'   '}).success).toBe(false);
  expect(filters.safeParse({companyCode:'bad id'}).success).toBe(false);
});

it('company search remains ANDed with USER assignments and the same filter supplies page and total',async()=>{
  let pageQuery,countQuery;
  const db={trackingRecord:{findMany:vi.fn(async args=>{pageQuery=args;return [];}),count:vi.fn(async args=>{countQuery=args;return 0;})},$transaction:vi.fn(async (queries,options)=>{expect(options.isolationLevel).toBe('RepeatableRead');return Promise.all(queries);})};
  const query=filters.parse({recordId:'9007199254740993',companyName:' Research ',companyCode:'CLIENT',pid:'PID-1',uid:'UID-1',page:'2',pageSize:'10'});
  const result=await listRecords(db,query,{id:'synthetic-user',role:'USER'});
  const expected={uid:'UID-1',serial:9007199254740993n,project:{assignments:{some:{adminId:'synthetic-user'}},pid:'PID-1',company:{code:'CLIENT',name:{contains:'Research',mode:'insensitive'}}}};
  expect(pageQuery.where).toEqual(expected);expect(countQuery.where).toEqual(expected);
  expect(pageQuery.skip).toBe(10);expect(pageQuery.take).toBe(10);expect(result.total).toBe(0);
});

it('Admin company filter does not create a company API dependency or change historical reporting visibility',async()=>{
  const findMany=vi.fn(async()=>[]),count=vi.fn(async()=>0);
  const db={trackingRecord:{findMany,count},$transaction:async q=>Promise.all(q)};
  await listRecords(db,filters.parse({companyCode:'CLIENT'}),{role:'ADMIN'});
  expect(findMany.mock.calls[0][0].where).toEqual({project:{company:{code:'CLIENT'}}});
  await listRecords(db,filters.parse({}),{role:'ADMIN'});
  expect(findMany.mock.calls[1][0].where).toEqual({});
});

it('record search encodes supported fields, resets page and filters, and preserves server totals',async()=>{
  const api=vi.fn(async()=>({records:[],total:17}));render(<Records api={api}/>);
  await screen.findByText('No records found');
  fireEvent.change(screen.getByLabelText('Record ID'),{target:{value:'9007199254740993'}});
  fireEvent.change(screen.getByLabelText('Company Name'),{target:{value:'Research & Co'}});
  fireEvent.change(screen.getByLabelText('Company ID'),{target:{value:'CLIENT'}});
  fireEvent.click(screen.getByRole('button',{name:'Apply filters'}));
  await waitFor(()=>expect(api.mock.calls.at(-1)[0]).toContain('companyName=Research+%26+Co'));
  const params=new URL(api.mock.calls.at(-1)[0],'https://synthetic.invalid').searchParams;
  expect(params.get('recordId')).toBe('9007199254740993');expect(params.get('companyCode')).toBe('CLIENT');expect(params.get('page')).toBe('1');
  await screen.findByText(/17 records/);
  fireEvent.click(screen.getByRole('button',{name:'Reset'}));
  await waitFor(()=>expect(api.mock.calls.at(-1)[0]).not.toContain('companyCode'));
  expect(screen.getByLabelText('Record ID').value).toBe('');
  expect(new URLSearchParams(recordQuery({recordId:'7',companyCode:'C',companyName:'Acme',unsupported:'x'})).has('unsupported')).toBe(false);
});
