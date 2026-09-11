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
    metaTitle: 'Overseas Agent Partnership — US Destination Partner',
    metaDescription:
      'A US destination partner for overseas freight forwarders: in-house ocean, air, customs, and warehousing, WCA membership, and 24-hour rate turnaround.',
  },
];

export function getPartnerAudience(slug: string): PartnerAudience | undefined {
  return PARTNER_AUDIENCES.find((p) => p.slug === slug);
}
