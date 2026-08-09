import { SITE } from '../config/site';
import { canonicalUrl } from './seo';

/** Removes undefined values so unknown facts are omitted rather than emitted as null. */
function compact<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)) as T;
}

function e164(raw: string): string {
  const d = raw.replace(/\D/g, '');
  return `+${d.length === 10 ? `1${d}` : d}`;
}

function sameAs(): string[] | undefined {
  const links = [SITE.social.facebook, SITE.social.instagram, SITE.social.linkedin].filter(
    (v): v is string => typeof v === 'string' && v.length > 0
  );
  return links.length > 0 ? links : undefined;
}

function postalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  };
}

export function organizationSchema() {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    telephone: e164(SITE.phones[0].number),
    address: postalAddress(),
    foundingDate: SITE.founded ? String(SITE.founded) : undefined,
    sameAs: sameAs(),
    identifier: SITE.credentials.fmcNumber
      ? { '@type': 'PropertyValue', name: 'FMC License', value: SITE.credentials.fmcNumber }
      : undefined,
  });
}

export function localBusinessSchema() {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#localbusiness`,
    name: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    telephone: e164(SITE.phones[0].number),
    address: postalAddress(),
    openingHours: SITE.hours.schema ?? undefined,
    priceRange: '$$',
  });
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE.url,
    name: SITE.name,
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export function serviceSchema(input: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    serviceType: input.name,
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    areaServed: { '@type': 'Country', name: 'United States' },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: canonicalUrl(t.href),
    })),
  };
}
