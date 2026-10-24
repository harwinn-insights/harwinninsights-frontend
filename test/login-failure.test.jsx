import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Router from '../src/Router.jsx';

it('login database failure displays the support reference, saves no session and permits another attempt', async () => {
  const reference = 'abadcdc3-5545-4e90-a1aa-912cff8f0d10';
  const fetch = vi.fn(async () => new Response(JSON.stringify({
    error: { code: 'DATABASE_UNAVAILABLE', message: 'Database operation failed', requestId: reference },
  }), { status: 503, headers: { 'Content-Type': 'application/json', 'X-Request-Id': reference } }));
  vi.stubGlobal('fetch', fetch);
  window.history.replaceState({}, '', '/admin/login');
  render(<Router/>);
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'admin@example.test' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }).closest('form'));
  const alert = await screen.findByRole('alert');
  expect(alert.textContent).toContain('Database operation failed');
  expect(alert.textContent).toContain('Support reference: ' + reference);
  expect(sessionStorage.getItem('harwinn-session')).toBeNull();
  expect(window.location.pathname).toBe('/admin/login');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe('/api/auth/login');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Sign in' }).disabled).toBe(false));
});
