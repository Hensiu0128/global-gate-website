import { describe, it, expect } from 'vitest';
import { validateQuote, formatQuoteSubject, SHIPPING_MODES } from '../../src/lib/quote-validation';

const valid = {
  mode: 'Ocean LCL',
  origin: 'Ningbo, China',
  destination: 'Chicago, IL 60601',
  cargo: '12 CBM, 3200 kg',
  readyDate: '2026-09-02',
  commodity: 'Furniture',
  name: 'Jane Doe',
  company: 'Doe Imports',
  email: 'jane@doeimports.com',
  phone: '312-555-0100',
  notes: '',
};

describe('validateQuote', () => {
  it('accepts a complete submission', () => {
    const result = validateQuote(valid);
    expect(result.ok).toBe(true);
  });

  it('requires the fields the sales team needs to actually quote', () => {
    const result = validateQuote({ ...valid, origin: '', destination: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.origin).toBeDefined();
      expect(result.errors.destination).toBeDefined();
    }
  });

  it('rejects a malformed email', () => {
    const result = validateQuote({ ...valid, email: 'not-an-email' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });

  it('rejects an unknown shipping mode', () => {
    const result = validateQuote({ ...valid, mode: 'Teleportation' });
    expect(result.ok).toBe(false);
  });

  it('accepts every offered shipping mode', () => {
    for (const mode of SHIPPING_MODES) {
      expect(validateQuote({ ...valid, mode }).ok, mode).toBe(true);
    }
  });

  it('trims whitespace so " " does not pass as a name', () => {
    const result = validateQuote({ ...valid, name: '   ' });
    expect(result.ok).toBe(false);
  });

  it('rejects non-object input without throwing', () => {
    expect(validateQuote(null).ok).toBe(false);
    expect(validateQuote('string').ok).toBe(false);
  });

  it('caps field length to prevent abuse', () => {
    const result = validateQuote({ ...valid, notes: 'x'.repeat(6000) });
    expect(result.ok).toBe(false);
  });

  it('treats notes and commodity as genuinely optional', () => {
    const result = validateQuote({ ...valid, notes: '', commodity: '' });
    expect(result.ok).toBe(true);
  });

  it('rejects a CRLF injection attempt in origin', () => {
    const result = validateQuote({ ...valid, origin: 'Ningbo\r\nBcc: attacker@evil.com' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.origin).toBeDefined();
  });

  it('rejects a CRLF injection attempt in company', () => {
    const result = validateQuote({ ...valid, company: 'Doe Imports\r\nBcc: attacker@evil.com' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.company).toBeDefined();
  });

  it('accepts a plain newline in notes, since it is a textarea rendered into a body', () => {
    const result = validateQuote({ ...valid, notes: 'Line one\nLine two' });
    expect(result.ok).toBe(true);
  });

  it('rejects a null byte in notes', () => {
    const result = validateQuote({ ...valid, notes: 'Line one\x00Line two' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.notes).toBeDefined();
  });

  it('rejects a double-dot domain in the email address', () => {
    const result = validateQuote({ ...valid, email: 'a@b..com' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });
});

describe('formatQuoteSubject', () => {
  it('front-loads route and mode so the inbox is triageable at a glance', () => {
    expect(formatQuoteSubject(valid)).toBe(
      '[QUOTE] Ocean LCL · Ningbo, China → Chicago, IL 60601 · Doe Imports'
    );
  });
});
