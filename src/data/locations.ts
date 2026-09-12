import type { FAQ } from './services';
import { SITE } from '../config/site';

export interface LocationPage {
  slug: string;
  name: string;
  tagline: string;
  heroCopy: string;
  bullets: string[];
  faqs: FAQ[];
  metaTitle: string;
  metaDescription: string;
  crossLinks?: { text: string; href: string }[];
}

export const LOCATIONS: LocationPage[] = [
  {
    slug: 'jfk-freight-forwarder',
    name: 'JFK Freight Forwarder',
    tagline: 'Air & Ocean Cargo Near JFK',
    heroCopy: `Global Gate Logistics operates from ${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode} — minutes from JFK International Airport. Air cargo arriving at JFK is cleared, warehoused, and dispatched by one in-house team.`,
    bullets: [
      'C-TPAT certified customs clearance for air cargo arriving at JFK',
      'Warehousing and deconsolidation minutes from the airport',
      'Drayage and final-mile delivery dispatched from the same facility',
      'Ocean cargo arriving at the Port of NY/NJ handled by the same team',
    ],
    faqs: [
      {
        question: 'Do you have a warehouse near JFK?',
        answer:
          'Global Gate Logistics operates from 153-04 Rockaway Blvd in Queens, New York, minutes from JFK International Airport and within reach of the Port of New York and New Jersey.',
      },
      {
        question: 'Can you clear air cargo arriving at JFK?',
        answer:
          'Yes. Most US customs entries clear within 24 to 48 hours of arrival when documentation is complete, and clearance is filed in-house rather than subcontracted to a separate broker.',
      },
      {
        question: 'Do you offer drayage from JFK?',
        answer:
          'Yes. Port and airport drayage in the New York metro area is arranged alongside the ocean or air booking, so there is no gap where cargo waits for a separate carrier to be arranged.',
      },
      {
        question: 'What if my cargo arrives at a different New York-area gateway?',
        answer:
          'The same team also handles cargo through the Port of New York and New Jersey — see the New York freight forwarder page for the ocean-focused view of the same facility and services.',
      },
    ],
    metaTitle: 'JFK Freight Forwarder',
    metaDescription:
      'A JFK-area freight forwarder handling air and ocean cargo in-house: customs clearance, warehousing, and drayage minutes from the airport.',
    crossLinks: [
      { text: 'Warehousing & Distribution', href: '/services/warehousing-distribution' },
      { text: 'New York Freight Forwarder — ocean & air cargo, NY metro', href: '/locations/new-york-freight-forwarder' },
    ],
  },
  {
    slug: 'new-york-freight-forwarder',
    name: 'New York Freight Forwarder',
    tagline: 'Ocean & Air Cargo, NY Metro',
    heroCopy: `Global Gate Logistics is based in ${SITE.address.city}, ${SITE.address.region}, within reach of both the Port of New York and New Jersey and JFK International Airport. Importers and exporters across the New York metro area are served from the same in-house facility.`,
    bullets: [
      'Ocean cargo through the Port of New York and New Jersey, handled in-house end to end',
      'C-TPAT certified customs clearance and HTS classification',
      'Warehousing, deconsolidation, and pick/pack at the Queens facility',
      'Nationwide trucking dispatched directly from New York',
    ],
    faqs: [
      {
        question: 'Do you handle imports through the Port of NY/NJ?',
        answer:
          'Yes. Ocean freight through the Port of New York and New Jersey is booked, cleared through customs, and warehoused by the same in-house team, with no handoff to a separate broker or warehouse operator.',
      },
      {
        question: 'Do you serve businesses outside New York City?',
        answer:
          'Yes. Nationwide FTL and LTL delivery is arranged from the same New York facility, so businesses anywhere in the continental United States can be served from one origin point.',
      },
      {
        question: 'How close is your facility to the port?',
        answer:
          'The facility at 153-04 Rockaway Blvd in Queens is within reach of both the Port of New York and New Jersey and JFK International Airport, covering ocean and air cargo from one location.',
      },
      {
        question: 'What if my cargo moves by air instead of ocean?',
        answer:
          'The same team and facility handle air cargo through JFK — see the JFK freight forwarder page for the air-focused view of the same services.',
      },
    ],
    metaTitle: 'New York Freight Forwarder',
    metaDescription:
      'A New York freight forwarder serving the Port of NY/NJ and JFK: in-house customs clearance, warehousing, and nationwide trucking.',
    crossLinks: [
      { text: 'Domestic Trucking', href: '/services/domestic-trucking' },
      { text: 'JFK Freight Forwarder — air & ocean cargo near JFK', href: '/locations/jfk-freight-forwarder' },
    ],
  },
];

export function getLocation(slug: string): LocationPage | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
