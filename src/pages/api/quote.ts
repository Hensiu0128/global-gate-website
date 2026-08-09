import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { validateQuote, formatQuoteSubject, type QuoteSubmission } from '../../lib/quote-validation';
import { SITE } from '../../config/site';

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** Native form posts get a 303 so the browser lands on a real page, not raw JSON. */
function seeOther(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildEmailBody(data: QuoteSubmission): string {
  const rows: [string, string][] = [
    ['Mode', data.mode],
    ['Origin', data.origin],
    ['Destination', data.destination],
    ['Cargo', data.cargo],
    ['Ready date', data.readyDate || '—'],
    ['Commodity', data.commodity || '—'],
    ['Name', data.name],
    ['Company', data.company],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Notes', data.notes || '—'],
  ];
  const cells = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;background:#f1f5f9">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 12px">${escapeHtml(value)}</td></tr>`
    )
    .join('');
  return `<h2 style="font-family:sans-serif">New quote request</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${cells}</table>`;
}

export const POST: APIRoute = async ({ request }) => {
  // Content negotiation: QuoteForm posts natively as x-www-form-urlencoded
  // when JavaScript is unavailable, and as JSON via fetch when it is. A
  // browser following a native form POST must land on a real page — not a
  // JSON blob — so every exit point below branches on `isFormPost` between
  // a JSON response and a 303 redirect to a dedicated static confirmation
  // page (/quote/sent, /quote/invalid, /quote/error). A query string on
  // /quote would be silent for the no-JS visitor it's meant for, since a
  // statically built page can't read one without JavaScript.
  const contentType = request.headers.get('content-type') ?? '';
  const isFormPost =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');

  let payload: unknown;
  try {
    payload = isFormPost
      ? Object.fromEntries((await request.formData()).entries())
      : await request.json();
  } catch {
    return isFormPost
      ? seeOther('/quote/error')
      : json({ ok: false, errors: { form: 'Invalid request body.' } }, 400);
  }

  // Honeypot: a real browser leaves this hidden field empty. Bots fill everything.
  // Respond success so the bot believes it succeeded and does not retry — but do NOT
  // send an email. This is the one deliberate case where a success response does not
  // mean delivery happened; every other path in this file must never do that (see D1).
  const honeypot = (payload as Record<string, unknown>)?.company_website;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return isFormPost ? seeOther('/quote/sent') : json({ ok: true }, 200);
  }

  const result = validateQuote(payload);
  if (!result.ok) {
    return isFormPost
      ? seeOther('/quote/invalid')
      : json({ ok: false, errors: result.errors }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.QUOTE_FROM_EMAIL;
  const to = process.env.QUOTE_TO_EMAIL ?? SITE.email;

  const failure = () =>
    isFormPost
      ? seeOther('/quote/error')
      : json(
          {
            ok: false,
            message:
              'We could not send your request automatically. Please email or call us and we will respond right away.',
            fallback: { email: SITE.email, phone: SITE.phones[0].number },
          },
          502
        );

  // Missing configuration (e.g. a fresh deploy before env vars are set) must fail
  // the same way a delivery error does — never fall through to a false success.
  if (!apiKey || !from) return failure();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: result.data.email,
      subject: formatQuoteSubject(result.data),
      html: buildEmailBody(result.data),
    });
    if (error) return failure();
    return isFormPost ? seeOther('/quote/sent') : json({ ok: true }, 200);
  } catch {
    return failure();
  }
};
