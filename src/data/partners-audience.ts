import type { FAQ } from './services';

export interface PartnerAudience {
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

export const PARTNER_AUDIENCES: PartnerAudience[] = [
  {
    slug: 'agents',
    name: 'Overseas Agent Partnership',
    tagline: 'For Freight Forwarders & Cargo Agents Abroad',
    heroCopy:
      'Global Gate Logistics is a US destination partner for overseas freight forwarders and cargo agents. One team handles ocean, air, customs, warehousing, and final delivery on your behalf — instead of your client\'s cargo passing through four separate US vendors.',
    bullets: [
      'WCA member — an independent, verifiable network credential',
      'Licensed NVOCC and IATA member, quoting from direct carrier contracts',
      'C-TPAT certified customs operations, filed in-house',
      'Rate requests answered within 24 business hours',
      'Warehousing and drayage minutes from JFK and the Port of NY/NJ',
    ],
    faqs: [
      {
        question: 'Do you work with overseas freight forwarders as agents?',
        answer:
          'Yes. Global Gate Logistics acts as the United States destination partner for forwarders and cargo agents worldwide, handling ocean, air, customs, warehousing, and final delivery on their behalf.',
      },
      {
        question: 'What does Global Gate Logistics handle for an overseas agent?',
        answer:
          'A destination agent handles arrival notice, customs entry, deconsolidation, warehousing, and final delivery. Global Gate Logistics performs all of these in-house rather than subcontracting them out.',
      },
      {
        question: 'Are you a member of any forwarder network?',
        answer:
          'Yes — Global Gate Logistics is a member of WCA (World Cargo Alliance), in addition to handling agent-routed cargo directly through existing partner relationships.',
      },
      {
        question: 'How do overseas agents request rates?',
        answer:
          'Agents can email the operations team directly or submit the quote form on this website. Rate requests are answered within 24 business hours.',
      },
    ],
    metaTitle: 'Overseas Agent Partnership',
    metaDescription:
      'A US destination partner for overseas freight forwarders: in-house ocean, air, customs, and warehousing, WCA membership, and 24-hour rate turnaround.',
    crossLinks: [
      { text: 'How to choose a US freight forwarding partner', href: '/blog/choosing-a-us-freight-forwarding-partner' },
    ],
  },
  {
    slug: 'brokers',
    name: 'Broker & 3PL Partnership',
    tagline: 'Subcontract a Leg, Not the Whole Shipment',
    heroCopy:
      'Global Gate Logistics handles ocean, air, customs, warehousing, and trucking in-house for freight brokers and 3PLs who need one leg of a shipment covered without losing visibility to a third company.',
    bullets: [
      'In-house customs clearance — no separate broker relationship to manage',
      'Warehousing and deconsolidation minutes from JFK and the Port of NY/NJ',
      'Nationwide FTL and LTL delivery with appointment scheduling',
      'Rate requests answered within 24 business hours',
      'C-TPAT certified operations, filed and dispatched by one team',
    ],
    faqs: [
      {
        question: 'Can you handle a single leg of a multi-leg shipment for us?',
        answer:
          'Yes. Ocean or air freight, customs clearance, warehousing, and trucking can each be booked independently, so a broker or 3PL can hand off exactly the leg that needs covering.',
      },
      {
        question: 'What information do you need to quote a broker-referred shipment?',
        answer:
          'The same information any quote requires: the origin port or city, the destination address or port, the cargo weight and volume, the commodity description, and the target ready date. Rates are returned within 24 business hours.',
      },
      {
        question: 'Can you handle drayage and warehousing together?',
        answer:
          'Yes. Drayage from the port or airport and warehousing at the Queens facility are coordinated by the same team, so cargo does not sit waiting for a separate vendor to be arranged.',
      },
      {
        question: 'Do you offer appointment scheduling for final delivery?',
        answer:
          'Yes. Delivery appointments are booked directly with the receiving facility, which most large distribution centers require before a truck will be accepted.',
      },
    ],
    metaTitle: 'Broker & 3PL Partnership',
    metaDescription:
      'Subcontract ocean, air, customs, warehousing, or trucking to an in-house team. 24-hour rate turnaround for broker and 3PL referred shipments.',
    crossLinks: [{ text: 'See our domestic trucking capabilities', href: '/services/domestic-trucking' }],
  },
];

export function getPartnerAudience(slug: string): PartnerAudience | undefined {
  return PARTNER_AUDIENCES.find((p) => p.slug === slug);
}
