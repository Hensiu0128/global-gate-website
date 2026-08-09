import type { Address } from '../config/site';

/** Strips formatting and returns an E.164 tel: URI. Assumes US (+1) when no country code is present. */
export function telHref(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const withCountry = digits.length === 10 ? `1${digits}` : digits;
  return `tel:+${withCountry}`;
}

/** Renders a US 10-digit number as (AAA) BBB-CCCC. Returns the input unchanged if it is not 10 digits. */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 10) return raw;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Single-line address used in the footer and in JSON-LD. Must match the Google Business Profile byte for byte. */
export function formatAddressOneLine(a: Address): string {
  return `${a.street}, ${a.city}, ${a.region} ${a.postalCode}`;
}
