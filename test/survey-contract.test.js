// @vitest-environment node
import { it, expect, vi } from 'vitest';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { request } from '../src/lib/api.js';

it.skipIf(!process.env.HARWINN_BACKEND_PATH)('company launch and multiple attempts integrate through the real frontend API client and Express routes',async()=>{
  const {fakeDb,appFor,adminToken}=await import(/* @vite-ignore */ pathToFileURL(join(process.env.HARWINN_BACKEND_PATH,'test/helpers.js')).href);
  const db=fakeDb(),token=await adminToken(db),server=appFor(db).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const fetch=globalThis.fetch;
  vi.stubGlobal('fetch',(path,options)=>fetch(`http://127.0.0.1:${server.address().port}${path}`,options));
  try {
    const company=await request('/api/companies',{token,method:'POST',body:{code:'CONTRACT',name:'Contract company'}});
    const projects=[];
    for(const pid of ['26073041','SECOND'])projects.push(await request('/api/projects',{token,method:'POST',body:{companyId:company.id,pid,name:'Study'}}));
    const list=await request(`/api/projects?companyId=${company.id}&pageSize=1&page=2`,{token});
    expect(list.projects).toHaveLength(1);expect(list.projects[0].companyId).toBe(company.id);
    const launch=await request(`/api/projects/${projects[0].id}/launch`,{token,method:'POST',body:{pid:'26073041',uid:'RAHU1001',providerUrl:'https://globalmatrixsurvey.com/initial-process?gid=NTY1NTE2LTE1OTc1MTk=&pid='}});
    expect(new URL(launch.launchUrl).searchParams.get('gid')).toBe('NTY1NTE2LTE1OTc1MTk=');
    expect(launch.integrationVerified).toBe(false);
    const {links}=await request(`/api/companies/${company.id}/links`,{token});
    const outcomes=['TERMINATE','DISQUALIFY','COMPLETE','TERMINATE'];
    for(const [i,status] of outcomes.entries()){
      const body={projectId:'26073041',uid:`synthetic-${i}`,transactionId:`attempt-${i}`};
      const first=await request(links[status],{method:'POST',body});expect(first.duplicate).toBe(false);
      const retry=await request(links[status],{method:'POST',body});expect(retry.duplicate).toBe(true);
      expect(first).toEqual({success:true,duplicate:false});expect(retry).toEqual({success:true,duplicate:true});
    }
    const records=await request('/api/records?pid=26073041&pageSize=2&page=2',{token});
    expect(records.total).toBe(4);expect(records.records).toHaveLength(2);
    expect(new Set(db.records.map(r=>r.serial)).size).toBe(4);
    await expect(request(links.COMPLETE,{method:'POST',body:{projectId:'26073041',uid:'RAHU1001',transactionId:'attempt-0'}})).rejects.toMatchObject({status:409});
  } finally {vi.unstubAllGlobals();await new Promise(resolve=>server.close(resolve));}
},15000);
