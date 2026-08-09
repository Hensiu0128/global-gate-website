export const SHIPPING_MODES = [
  'Ocean FCL',
  'Ocean LCL',
  'Air Freight',
  'Not sure yet',
] as const;

export type ShippingMode = (typeof SHIPPING_MODES)[number];

export interface QuoteSubmission {
  mode: string;
  origin: string;
  destination: string;
  cargo: string;
  readyDate: string;
  commodity: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
}

export type ValidationResult =
  | { ok: true; data: QuoteSubmission }
  | { ok: false; errors: Record<string, string> };

const MAX_LENGTH = 2000;
// Domain labels cannot be empty (rejects "a@b..com") and the TLD must be at
// least 2 alphabetic characters (rejects "a@b.c"); each dot-separated label
// is anchored so backtracking cannot smuggle an empty label past it.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

// Control characters in a single-line field are almost always an injection
// attempt — a CRLF reaching an email subject header is the specific risk.
// `notes` is a textarea rendered into a body, so tab and newline are fine
// there; every other C0 control character (including the null byte) and DEL
// are still rejected.
const CONTROL_CHARS = /[\x00-\x1F\x7F]/;
const NOTES_CONTROL_CHARS = /[\x00-\x08\x0B-\x1F\x7F]/;

const REQUIRED: (keyof QuoteSubmission)[] = [
  'mode', 'origin', 'destination', 'cargo', 'name', 'company', 'email', 'phone',
];

const LABELS: Record<string, string> = {
  mode: 'Shipping mode',
  origin: 'Origin',
  destination: 'Destination',
  cargo: 'Cargo details',
  name: 'Name',
  company: 'Company',
  email: 'Email',
  phone: 'Phone',
};

export function validateQuote(input: unknown): ValidationResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, errors: { form: 'Invalid submission.' } };
  }

  const raw = input as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const str = (key: string): string => (typeof raw[key] === 'string' ? (raw[key] as string).trim() : '');

  const data: QuoteSubmission = {
    mode: str('mode'),
    origin: str('origin'),
    destination: str('destination'),
    cargo: str('cargo'),
    readyDate: str('readyDate'),
    commodity: str('commodity'),
    name: str('name'),
    company: str('company'),
    email: str('email'),
    phone: str('phone'),
    notes: str('notes'),
  };

  for (const field of REQUIRED) {
    if (data[field] === '') errors[field] = `${LABELS[field]} is required.`;
  }

  if (data.email !== '' && !EMAIL_RE.test(data.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (data.mode !== '' && !SHIPPING_MODES.includes(data.mode as ShippingMode)) {
    errors.mode = 'Select a shipping mode from the list.';
  }

  for (const [key, value] of Object.entries(data)) {
    if (value.length > MAX_LENGTH) errors[key] = 'This field is too long.';
  }

  for (const [key, value] of Object.entries(data)) {
    const pattern = key === 'notes' ? NOTES_CONTROL_CHARS : CONTROL_CHARS;
    if (pattern.test(value)) {
      errors[key] = 'This field contains invalid characters.';
    }
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, data };
}

/** Subject line front-loads route and mode so operations can triage without opening the email. */
export function formatQuoteSubject(data: QuoteSubmission): string {
  return `[QUOTE] ${data.mode} · ${data.origin} → ${data.destination} · ${data.company}`;
}
