export interface FAQ { question: string; answer: string; }

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  cardCopy: string;
  heroCopy: string;
  bullets: string[];
  faqs: FAQ[];
  image: string | null;
  metaTitle: string;
  metaDescription: string;
  crossLinks?: { text: string; href: string }[];
}

export const SERVICES: Service[] = [
  {
    slug: 'ocean-freight',
    name: 'Ocean Freight',
    shortName: 'Ocean',
    tagline: 'FCL & LCL',
    cardCopy:
      'Full container load (FCL) and less-than-container load (LCL) ocean freight with competitive rates on major trade lanes.',
    heroCopy:
      'Global Gate Logistics moves full and partial container loads between Asia and the United States as a licensed NVOCC. Because we hold service contracts directly with the major ocean carriers, we quote from our own rates rather than reselling someone else’s.',
    bullets: [
      'FCL in 20′, 40′, 40′HC and 45′ equipment',
      'Weekly LCL consolidations from major Asian ports',
      'Direct carrier service contracts as a licensed NVOCC',
      'Port-to-port, port-to-door, and full door-to-door routing',
      'Customs clearance and inland trucking arranged in-house',
    ],
    faqs: [
      {
        question: 'What is the difference between FCL and LCL?',
        answer:
          'FCL means your cargo occupies an entire container that nobody else shares, while LCL means your cargo is consolidated with other shippers’ goods in one container. FCL usually becomes cheaper per cubic meter once a shipment exceeds roughly 15 CBM.',
      },
      {
        question: 'How long does ocean freight take from Asia to the United States?',
        answer:
          'Transit time from major Asian ports to the US West Coast typically runs 14 to 20 days, and to the US East Coast 28 to 38 days depending on routing. LCL shipments add 3 to 7 days for consolidation and deconsolidation.',
      },
      {
        question: 'What information do you need to quote ocean freight?',
        answer:
          'A quote requires the origin port or city, the destination address or port, the cargo weight and volume, the commodity description, and the target ready date. Global Gate Logistics returns ocean quotes within 24 business hours.',
      },
      {
        question: 'Do you handle customs clearance for ocean shipments?',
        answer:
          'Yes. Customs clearance is handled in-house alongside the ocean booking, so a single team owns the shipment from origin port through delivery.',
      },
    ],
    image: '/images/service-ocean.webp',
    metaTitle: 'Ocean Freight FCL & LCL Shipping',
    metaDescription:
      'Licensed NVOCC ocean freight from Asia to the USA. FCL and LCL container shipping with direct carrier contracts, in-house customs clearance, and 24-hour quotes.',
  },
  {
    slug: 'air-freight',
    name: 'Air Freight',
    shortName: 'Air',
    tagline: 'Import & Export',
    cardCopy:
      'Fast, reliable air freight for time-sensitive cargo. Import and export services via major airlines worldwide.',
    heroCopy:
      'Global Gate Logistics is an IATA member handling air import and export through JFK and every major US gateway. Air freight suits cargo where the cost of waiting exceeds the cost of shipping — high-value goods, production-critical parts, and perishables.',
    bullets: [
      'IATA member with direct airline relationships',
      'Airport-to-airport and full door-to-door service',
      'Consolidated and direct services for urgent cargo',
      'Dangerous goods handling by certified staff',
      'Customs clearance at JFK and all major US gateways',
    ],
    faqs: [
      {
        question: 'How long does air freight take from Asia to the United States?',
        answer:
          'Air freight from major Asian airports to the United States typically takes 3 to 7 days door to door, including pickup, flight, customs clearance, and final delivery. Direct services can move urgent cargo in 2 to 3 days.',
      },
      {
        question: 'When is air freight cheaper than ocean freight?',
        answer:
          'Air freight becomes competitive when a shipment is light relative to its value, generally under about 500 kilograms, or when delayed arrival would cost more than the freight itself. Ocean freight is almost always cheaper per kilogram for heavy cargo.',
      },
      {
        question: 'How is air freight priced?',
        answer:
          'Airlines charge on chargeable weight, which is the greater of actual gross weight and volumetric weight. Volumetric weight is calculated by dividing the shipment volume in cubic centimeters by 6,000.',
      },
      {
        question: 'Can you handle dangerous goods by air?',
        answer:
          'Yes. Certified staff prepare dangerous goods declarations and packaging in line with IATA regulations. Provide the material safety data sheet when requesting a quote.',
      },
    ],
    image: '/images/service-air.webp',
    metaTitle: 'Air Freight Import & Export Services',
    metaDescription:
      'IATA member air freight forwarding for time-sensitive cargo. Import and export via JFK and major US gateways, with dangerous goods handling and 24-hour quotes.',
  },
  {
    slug: 'warehousing-distribution',
    name: 'Warehousing & Distribution',
    shortName: 'Warehouse',
    tagline: 'Storage & Fulfillment',
    cardCopy:
      'Secure warehousing and distribution with real-time inventory management and flexible storage.',
    heroCopy:
      'Global Gate Logistics operates warehousing near JFK for cargo that needs to be received, stored, deconsolidated, or redistributed. Storage sits alongside our freight and customs operations, so cargo does not change hands between companies on arrival.',
    bullets: [
      'Short-term and long-term storage near JFK',
      'Container deconsolidation and cargo redistribution',
      'Pick, pack, and palletizing',
      'Real-time inventory visibility',
      'Direct connection to our trucking and customs operations',
    ],
    faqs: [
      {
        question: 'Where is your warehouse located?',
        answer:
          'Global Gate Logistics operates from 153-04 Rockaway Blvd in Queens, New York, minutes from JFK International Airport and within reach of the Port of New York and New Jersey.',
      },
      {
        question: 'What is container deconsolidation?',
        answer:
          'Deconsolidation is the process of unloading a shared container and separating cargo by consignee for onward delivery. LCL shipments require deconsolidation before final delivery can begin.',
      },
      {
        question: 'How is warehouse storage priced?',
        answer:
          'Storage is typically priced per pallet position per week or per square foot per month, depending on how cargo is stored. Handling charges for receiving and dispatch are quoted separately.',
      },
      {
        question: 'Can you store cargo before customs clearance?',
        answer:
          'Arrangements for cargo awaiting clearance can be made as part of a combined customs and warehousing booking. Contact the team with your entry details to confirm what applies to your shipment.',
      },
    ],
    image: '/images/service-warehouse.webp',
    metaTitle: 'Warehousing & Distribution Near JFK',
    metaDescription:
      'Secure warehousing and distribution in Queens, NY, minutes from JFK. Deconsolidation, pick and pack, real-time inventory, and links to customs and trucking.',
  },
  {
    slug: 'customs-clearance',
    name: 'Customs Clearance',
    shortName: 'Customs',
    tagline: 'Brokerage & Compliance',
    cardCopy:
      'Expert customs brokerage ensuring smooth, compliant clearance through U.S. and international customs.',
    heroCopy:
      'Customs clearance is handled in-house rather than subcontracted, which means the team booking your freight is the team filing your entry. Global Gate Logistics is C-TPAT certified and files entries electronically with U.S. Customs and Border Protection.',
    bullets: [
      'C-TPAT certified customs operations',
      'Electronic entry filing with U.S. CBP',
      'HTS classification and duty estimation',
      'ISF (10+2) filing for ocean imports',
      'Partner government agency filings including FDA and USDA',
    ],
    faqs: [
      {
        question: 'How long does customs clearance take in the United States?',
        answer:
          'Most US customs entries clear within 24 to 48 hours of arrival when documentation is complete and correct. Shipments selected for examination can take an additional 3 to 7 days.',
      },
      {
        question: 'What documents are needed to clear US customs?',
        answer:
          'A standard import entry requires the commercial invoice, the packing list, the bill of lading or air waybill, and a customs bond. Regulated commodities require additional partner government agency filings.',
      },
      {
        question: 'What is an ISF filing and when is it due?',
        answer:
          'ISF, also called Importer Security Filing or 10+2, is a data submission required for US ocean imports. The filing must reach CBP at least 24 hours before the cargo is loaded at the origin port, and late filings carry penalties.',
      },
      {
        question: 'Do I need my own customs bond?',
        answer:
          'Importers need either a single-entry bond covering one shipment or a continuous bond covering a year of entries. A continuous bond usually costs less once an importer exceeds roughly four entries per year.',
      },
    ],
    image: null,
    metaTitle: 'US Customs Clearance & Brokerage',
    metaDescription:
      'C-TPAT certified customs brokerage with in-house entry filing, HTS classification, ISF filing, and FDA and USDA submissions. Clear US customs, handoff-free.',
  },
  {
    slug: 'domestic-trucking',
    name: 'Domestic Trucking',
    shortName: 'Trucking',
    tagline: 'Drayage & Delivery',
    cardCopy:
      'Comprehensive domestic trucking connecting ports and airports to your final destination across the United States.',
    heroCopy:
      'Global Gate Logistics arranges drayage from the port and airport plus onward delivery anywhere in the United States. Because trucking is booked alongside the ocean or air leg, there is no gap where cargo sits waiting for a separate carrier to be arranged.',
    bullets: [
      'Port and airport drayage in the New York metro area',
      'Nationwide FTL and LTL delivery',
      'Container drayage to and from our JFK-area warehouse',
      'Delivery appointment scheduling with receivers',
      'Coordinated with the ocean, air, and customs legs',
    ],
    faqs: [
      {
        question: 'What is drayage?',
        answer:
          'Drayage is the short-haul trucking move that takes a container from a port or airport to a nearby warehouse or delivery point. Drayage is billed separately from ocean or air freight and is a common source of surprise charges.',
      },
      {
        question: 'Do you deliver outside the New York area?',
        answer:
          'Yes. Global Gate Logistics arranges delivery to any address in the continental United States, using full truckload for larger shipments and less-than-truckload for smaller consignments.',
      },
      {
        question: 'What are demurrage and detention charges?',
        answer:
          'Demurrage is charged when a container stays at the terminal beyond its free time, and detention is charged when the container stays outside the terminal too long before being returned. Booking drayage early is the most reliable way to avoid both.',
      },
      {
        question: 'Can you schedule a delivery appointment with my warehouse?',
        answer:
          'Yes. Delivery appointments are booked directly with the receiving facility, which most large distribution centers require before a truck will be accepted.',
      },
    ],
    image: null,
    metaTitle: 'Domestic Trucking & Port Drayage',
    metaDescription:
      'Port and airport drayage plus nationwide FTL and LTL delivery, booked alongside your ocean or air freight, with appointment scheduling and no coverage gaps.',
  },
  {
    slug: 'overseas-agent-network',
    name: 'Overseas Agent Network',
    shortName: 'Agents',
    tagline: 'Global Partnerships',
    cardCopy:
      'An extensive network of overseas cargo agents providing seamless logistics regardless of origin or destination.',
    heroCopy:
      'Global Gate Logistics acts as the United States partner for freight forwarders and cargo agents abroad. Overseas agents get a single US counterpart handling ocean, air, customs, warehousing, and final delivery, instead of coordinating four separate vendors across time zones.',
    bullets: [
      'Established agent relationships across Asia, Europe, and the Americas',
      'One US partner for freight, customs, warehousing, and delivery',
      'Competitive net rates for agent-routed cargo',
      'Prompt quote turnaround across time zones',
      'Full destination handling for your clients’ cargo',
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
        question: 'How do overseas agents request rates?',
        answer:
          'Agents can email the operations team directly or submit the quote form on this website. Rate requests are answered within 24 business hours.',
      },
      {
        question: 'Which trade lanes do you specialize in?',
        answer:
          'Global Gate Logistics specializes in Asia to America routing, with particular depth on shipments moving into the New York and New Jersey gateway through JFK and the Port of New York and New Jersey.',
      },
    ],
    image: null,
    metaTitle: 'Overseas Agent Network & US Partner',
    metaDescription:
      'Global Gate Logistics is your US destination partner for ocean, air, customs, and warehousing, with 24-hour rate turnaround for overseas forwarders.',
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
