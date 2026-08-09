import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: class { emails = { send: sendMock }; },
}));

const valid = {
  mode: 'Ocean FCL', origin: 'Shanghai', destination: 'Newark, NJ',
  cargo: '1x40HC', readyDate: '2026-09-10', commodity: 'Textiles',
  name: 'Jane Doe', company: 'Doe Imports', email: 'jane@doeimports.com',
  phone: '312-555-0100', notes: '',
};

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://global-gate.us/api/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = 'test-key';
  process.env.QUOTE_FROM_EMAIL = 'website@global-gate.us';
  process.env.QUOTE_TO_EMAIL = 'Op01@global-gate.us';
});

describe('POST /api/quote', () => {
  it('returns 200 only after the email is accepted', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post(valid) } as any);
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledOnce();
  });

  it('delivers to the configured operations address', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const { POST } = await import('../../src/pages/api/quote');
    await POST({ request: post(valid) } as any);
    expect(sendMock.mock.calls[0][0].to).toBe('Op01@global-gate.us');
  });

  it('sets a reply-to of the enquirer so staff can reply directly', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const { POST } = await import('../../src/pages/api/quote');
    await POST({ request: post(valid) } as any);
    expect(sendMock.mock.calls[0][0].replyTo).toBe('jane@doeimports.com');
  });

  it('rejects an invalid submission with 400 and never sends', async () => {
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post({ ...valid, email: 'bad' }) } as any);
    expect(res.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('NEVER reports success when delivery fails — this is defect D1', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'domain not verified' } });
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post(valid) } as any);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.fallback.email).toBe('Op01@global-gate.us');
    expect(body.fallback.phone).toBe('631-596-5591');
  });

  it('also reports failure when the mail client throws', async () => {
    sendMock.mockRejectedValue(new Error('network down'));
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post(valid) } as any);
    expect(res.status).toBe(502);
  });

  it('silently accepts and discards submissions that fill the honeypot', async () => {
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post({ ...valid, company_website: 'http://spam.example' }) } as any);
    expect(res.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('fails when RESEND_API_KEY is missing — an unconfigured deploy must not fake success', async () => {
    delete process.env.RESEND_API_KEY;
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post(valid) } as any);
    expect(res.status).toBe(502);
    expect(sendMock).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.fallback.email).toBe('Op01@global-gate.us');
  });

  it('fails when QUOTE_FROM_EMAIL is missing', async () => {
    delete process.env.QUOTE_FROM_EMAIL;
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post(valid) } as any);
    expect(res.status).toBe(502);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('fails when no email configuration is present at all', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.QUOTE_FROM_EMAIL;
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post(valid) } as any);
    expect(res.status).toBe(502);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
