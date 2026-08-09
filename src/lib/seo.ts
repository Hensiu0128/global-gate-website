import { SITE } from '../config/site';

const BRAND_TITLE = 'Global Gate Logistics | International Freight Forwarder';

/** Page title with brand suffix. Homepage gets the full descriptive brand title. */
export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return BRAND_TITLE;
  return `${pageTitle} | ${SITE.name}`;
}

/** Absolute canonical URL on the apex host, without a trailing slash. */
export function canonicalUrl(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '');
  return clean === '' ? SITE.url : `${SITE.url}${clean.startsWith('/') ? clean : `/${clean}`}`;
}
