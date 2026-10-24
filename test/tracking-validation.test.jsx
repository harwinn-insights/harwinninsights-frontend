import { StrictMode } from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Router from '../src/Router.jsx';
import Outcome from '../src/admin/Outcome.jsx';
import { validatedTrackingPath } from '../src/lib/api.js';

const paramMap = { uid: 'respondent', transactionId: 'attempt', username: 'name', inTime: 'started' };
const json = value => new Response(JSON.stringify(value), { status: 200 });

it('preserves mapped identifiers, original encoding and optional fields on the legacy intake route', async () => {
  const query = 'respondent=synthetic%40user&attempt=stable%3Aattempt&name=Synthetic%20QA&started=2026-01-01T00%3A00%3A00Z';
  const fetch = vi.fn(path => Promise.resolve(json(path === '/api/tracking/config' ? { paramMap } : { success: true, duplicate: false })));
  vi.stubGlobal('fetch', fetch);
  render(<StrictMode><Outcome pid="HW-DEMO-001" status="COMPLETE" search={'?' + query} /></StrictMode>);
  await screen.findByText(/Your response has been recorded/);
  expect(fetch.mock.calls.map(([path]) => path)).toEqual(['/api/tracking/config', '/redirect/HW-DEMO-001/COMPLETE?' + query]);
  expect(fetch.mock.calls[1][1].method).toBe('GET');
  expect(fetch.mock.calls[1][1].body).toBeUndefined();
});

for (const query of ['', '?respondent=synthetic', '?attempt=stable', '?respondent=&attempt=stable', '?respondent=bad%20id&attempt=stable', '?respondent=synthetic&attempt=bad%20id', '?respondent=synthetic&attempt=one&attempt=two', '?uid=synthetic&transactionId=stable']) {
  it(`blocks missing/invalid mapped identifiers without a tracking request: ${query}`, async () => {
    const fetch = vi.fn(() => Promise.resolve(json({ paramMap })));
    vi.stubGlobal('fetch', fetch);
    render(<Outcome pid="HW-DEMO-001" status="COMPLETE" search={query} />);
    await screen.findByText(/No outcome was submitted/);
    expect(fetch.mock.calls.map(([path]) => path)).toEqual(['/api/tracking/config']);
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
}

it('blocks the exact bare live route with default mapping', async () => {
  const fetch = vi.fn(() => Promise.resolve(json({ paramMap: { uid: 'uid', transactionId: 'transactionId', username: 'username', inTime: 'inTime' } })));
  vi.stubGlobal('fetch', fetch);
  window.history.replaceState({}, '', '/tracking/HW-DEMO-001/COMPLETE');
  render(<Router />);
  await screen.findByText(/A single valid uid is required/);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe('/api/tracking/config');
});

it('does not guess company ownership from a PID or accept company routing parameters on the legacy route', () => {
  expect(() => validatedTrackingPath('HW-DEMO-001', 'COMPLETE', 'respondent=synthetic&attempt=stable&projectId=HW-DEMO-001', paramMap)).toThrow(/permanent company intake link/);
  expect(() => validatedTrackingPath('HW-DEMO-001', 'COMPLETE', 'respondent=synthetic&attempt=stable&companyId=synthetic', paramMap)).toThrow(/permanent company intake link/);
});

it('fails closed if mapping metadata is unavailable', async () => {
  const fetch = vi.fn(() => Promise.resolve(json({})));
  vi.stubGlobal('fetch', fetch);
  render(<Outcome pid="HW-DEMO-001" status="COMPLETE" search="?respondent=synthetic&attempt=stable" />);
  await screen.findByText(/Tracking configuration is unavailable/);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('retries mapped intake with exactly the original attempt and encoding', async () => {
  let attempts = 0;
  const fetch = vi.fn(path => {
    if (path === '/api/tracking/config') return Promise.resolve(json({ paramMap }));
    if (++attempts === 1) return Promise.reject(new TypeError('synthetic offline'));
    return Promise.resolve(json({ success: true, duplicate: true }));
  });
  vi.stubGlobal('fetch', fetch);
  render(<Outcome pid="HW-DEMO-001" status="COMPLETE" search="?respondent=synthetic%40user&attempt=stable%3Aattempt" />);
  const retry = await screen.findByRole('button', { name: 'Try again' });
  fireEvent.click(retry);
  await screen.findByText(/already recorded/);
  const paths = fetch.mock.calls.map(([path]) => path).filter(path => path.startsWith('/redirect/'));
  expect(paths).toEqual(Array(2).fill('/redirect/HW-DEMO-001/COMPLETE?respondent=synthetic%40user&attempt=stable%3Aattempt'));
});

it('renders a minimal duplicate acknowledgement without expecting historical record details',async()=>{
  const fetch=vi.fn(path=>Promise.resolve(json(path==='/api/tracking/config'?{paramMap}:{success:true,duplicate:true})));
  vi.stubGlobal('fetch',fetch);
  render(<Outcome pid="HW-DEMO-001" status="COMPLETE" search="?respondent=synthetic&attempt=stable"/>);
  await screen.findByText(/Your response was already recorded/);
  expect(screen.queryByText(/Reference:/)).toBeNull();
  expect(fetch).toHaveBeenCalledTimes(2);
});
