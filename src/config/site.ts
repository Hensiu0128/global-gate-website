export interface Address {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface Phone {
  number: string;
  label: string;
}

export interface Hours {
  /** Schema.org openingHours format, e.g. "Mo-Fr 09:00-17:00". null until confirmed (spec F4). */
  schema: string | null;
  /** Human-readable form shown on the contact page. null until confirmed. */
  display: string | null;
  timezone: string;
}

export interface Credentials {
  fmcNumber: string | null;   // spec F1
  iataNumber: string | null;  // spec F2
  ctpatCertified: boolean;    // spec F3
  nvocc: boolean;
}

export interface Social {
  facebook: string | null;    // spec F7 — null until a real profile URL is supplied
  instagram: string | null;
  linkedin: string | null;
}

export interface SiteConfig {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phones: Phone[];
  address: Address;
  hours: Hours;
  credentials: Credentials;
  social: Social;
  founded: number | null;     // spec F6
  quoteTurnaroundHours: number;
}

export const SITE: SiteConfig = {
  name: 'Global Gate Logistics',
  legalName: 'Global Gate Logistics Inc',
  tagline: 'International Freight Forwarder · NVOCC · IATA Member',
  description:
    'Global Gate Logistics is a US international freight forwarder and NVOCC specializing in Asia–America cargo. Ocean FCL & LCL, air freight, customs clearance, JFK warehousing, and nationwide trucking handled in-house.',
  url: 'https://global-gate.us',
  email: 'Op01@global-gate.us',
  phones: [
    { number: '631-596-5591', label: 'Main' },
    { number: '631-596-5592', label: 'Alternate' },
  ],
  address: {
    street: '153-04 Rockaway Blvd',
    city: 'Queens',
    region: 'NY',
    postalCode: '11434',
    country: 'US',
  },
  hours: {
    schema: null,
    display: null,
    timezone: 'America/New_York',
  },
  credentials: {
    fmcNumber: null,
    iataNumber: null,
    ctpatCertified: true,
    nvocc: true,
  },
  social: {
    facebook: null,
    instagram: null,
    linkedin: null,
  },
  founded: null,
  quoteTurnaroundHours: 24,
};

export const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;
