import { StrictMode } from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Router from '../src/Router.jsx';

for(const status of ['COMPLETE','TERMINATE','QUOTAFUL','DISQUALIFY']) it(`renders only verified ${status} and removes receipt`,async()=>{
  window.history.replaceState(null,'',`/${status.toLowerCase()}#receipt=synthetic-proof`);
  const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({status,uid:'synthetic-uid',pid:'synthetic-pid'}),{status:200}));
  vi.stubGlobal('fetch',fetch);
  render(<StrictMode><Router /></StrictMode>);
  await screen.findByText(/Your response has been recorded/);
  expect(screen.getByRole('heading', {name:'Thank you!'})).toBeTruthy();
  const label={COMPLETE:'COMPLETED',TERMINATE:'TERMINATED',QUOTAFUL:'QUOTA FULL',DISQUALIFY:'DISQUALIFIED'}[status];
  expect(screen.getAllByText(label)).toHaveLength(2);
  expect(screen.getByText('synthetic-uid')).toBeTruthy();
  expect(screen.getByText('synthetic-pid')).toBeTruthy();
  expect(screen.getByText(status)).toBeTruthy();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.queryByText(/Outcome preview/)).toBeNull();
  expect(window.location.hash).toBe('');
  expect(fetch.mock.calls[0][0]).toBe('/api/tracking/outcome');
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({receipt:'synthetic-proof',expectedStatus:status});
});
for(const respondentIp of ['192.0.2.10','2001:db8::10',null]) it(`displays verified respondent IP or Unavailable: ${respondentIp}`,async()=>{
  window.history.replaceState(null,'','/complete#receipt=synthetic');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({status:'COMPLETE',uid:'synthetic-user',pid:'synthetic-project',respondentIp}),{status:200})));
  render(<Router />);await screen.findByText('synthetic-user');
  expect(screen.getByText('Respondent IP Address')).toBeTruthy();
  expect(screen.getByText(respondentIp || 'Unavailable')).toBeTruthy();
});
for(const mode of ['network','server','incomplete']) it(`never shows success on ${mode} failure`,async()=>{
  window.history.replaceState(null,'','/complete#receipt=synthetic');
  const fetch=mode==='network'?vi.fn().mockRejectedValue(new Error('synthetic')):
    vi.fn().mockResolvedValue(new Response(JSON.stringify(mode==='server'?{error:{message:'Unable to verify'}}:{status:'COMPLETE'}),{status:mode==='server'?503:200}));
  vi.stubGlobal('fetch',fetch);render(<Router />);
  await screen.findByText('Unable to verify outcome');
  expect(screen.queryByRole('heading',{name:'Thank you!'})).toBeNull();
  expect(screen.queryByText('Recorded response details')).toBeNull();
});
it('renders only permitted fields even if an API response contains extra fields',async()=>{
  window.history.replaceState(null,'','/complete#receipt=synthetic');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({status:'COMPLETE',uid:'synthetic-user',pid:'synthetic-project',ipAddress:'192.0.2.1',projectId:'private-internal',transactionId:'private-transaction'}),{status:200})));
  render(<Router />);await screen.findByText('synthetic-user');
  for(const value of ['192.0.2.1','private-internal','private-transaction']) expect(screen.queryByText(value)).toBeNull();
});
it('direct unverified route never displays a recorded result',async()=>{
  window.history.replaceState(null,'','/complete?status=COMPLETE');
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);render(<Router />);
  await screen.findByText('Unable to verify outcome');
  expect(fetch).not.toHaveBeenCalled();expect(screen.queryByText(/Your response has been recorded/)).toBeNull();
});
for(const response of [{status:'TERMINATE'},{error:{message:'Expired receipt'}}]) it(`rejects mismatch or invalid receipt ${JSON.stringify(response)}`,async()=>{
  window.history.replaceState(null,'','/complete#receipt=synthetic');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify(response),{status:response.error?400:200})));
  render(<Router />);
  await waitFor(()=>expect(screen.getByText('Unable to verify outcome')).toBeTruthy());
  expect(screen.queryByText(/Your response has been recorded/)).toBeNull();
});
