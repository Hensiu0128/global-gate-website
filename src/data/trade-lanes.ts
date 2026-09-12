import type { FAQ } from './services';

export interface TradeLane {
  slug: string;
  name: string;
  country: string;
  tagline: string;
  heroCopy: string;
  bullets: string[];
  faqs: FAQ[];
  metaTitle: string;
  metaDescription: string;
}

export const TRADE_LANES: TradeLane[] = [
  {
    slug: 'china-to-usa',
    name: 'China to USA Freight',
    country: 'China',
    tagline: 'Ocean FCL & LCL, Air Freight',
    heroCopy:
      'China is a lane Global Gate Logistics handles well: direct carrier service contracts, in-house customs filing, and warehousing minutes from JFK and the Port of NY/NJ, alongside every other origin the company ships FCL and air cargo from.',
    bullets: [
      'FCL and LCL ocean freight from Shanghai, Ningbo-Zhoushan, Shenzhen (Yantian), and Qingdao',
      'Air freight from Shanghai Pudong and Hong Kong gateways',
      'ISF (10+2) filing handled in-house, ahead of the 24-hour-before-loading deadline',
      'Customs entry, HTS classification, and duty estimation filed by the same team booking the freight',
      'Warehousing and drayage near JFK and the Port of NY/NJ for final delivery',
    ],
    faqs: [
      {
        question: 'How long does ocean freight from China to the US take?',
        answer:
          'Ocean transit from major Chinese ports to the US West Coast typically runs 14 to 20 days, and to the US East Coast, including the Port of NY/NJ, 28 to 38 days. LCL shipments add 3 to 7 days for consolidation and deconsolidation.',
      },
      {
        question: 'Which Chinese ports does this lane typically move through?',
        answer:
          'Most FCL and LCL bookings out of China move through Shanghai, Ningbo-Zhoushan, Shenzhen (Yantian), or Qingdao — the busiest container ports in the country.',
      },
      {
        question: 'What documents are needed to import from China?',
        answer:
          'A standard entry requires the commercial invoice, packing list, and bill of lading, plus a customs bond. For ocean shipments, an ISF (Importer Security Filing) is also required at least 24 hours before the cargo is loaded at the Chinese port.',
      },
      {
        question: 'Is air freight from China faster than ocean?',
        answer:
          'Air freight from major Chinese gateways such as Shanghai Pudong or Hong Kong typically takes 3 to 7 days door to door, versus 14 to 38 days by ocean depending on the US coast. Air becomes cost-competitive for shipments under roughly 500 kilograms or when a delay would cost more than the freight itself.',
      },
    ],
    metaTitle: 'China to USA Freight Forwarding',
    metaDescription:
      'Ocean FCL & LCL and air freight from China to the USA: direct carrier contracts, in-house customs and ISF filing, and JFK-area warehousing.',
  },
  {
    slug: 'vietnam-to-usa',
    name: 'Vietnam to USA Freight',
    country: 'Vietnam',
    tagline: 'Ocean FCL & LCL, Air Freight',
    heroCopy:
      'Vietnam has become one of the fastest-growing origins for US imports as manufacturers diversify beyond China, and it is a lane Global Gate Logistics ships well — the same in-house customs, warehousing, and carrier relationships apply here as on every other origin.',
    bullets: [
      'FCL and LCL ocean freight from Cat Lai and Cai Mep-Thi Vai (Ho Chi Minh City area) and Hai Phong (north)',
      'Air freight from Tan Son Nhat (Ho Chi Minh City) and Noi Bai (Hanoi)',
      'ISF (10+2) filing handled in-house, ahead of the 24-hour-before-loading deadline',
      'Customs entry, HTS classification, and duty estimation filed by the same team booking the freight',
      'Warehousing and drayage near JFK and the Port of NY/NJ for final delivery',
    ],
    faqs: [
      {
        question: 'How long does shipping from Vietnam to the US take?',
        answer:
          'Transit times from major Vietnamese ports fall within the same range as other major Asian origins: roughly 14 to 20 days to the US West Coast and 28 to 38 days to the US East Coast by ocean, or 3 to 7 days door to door by air.',
      },
      {
        question: 'Why are more importers sourcing from Vietnam?',
        answer:
          'Vietnam has become one of the fastest-growing origins for US imports as manufacturers diversify production beyond China. Its container ports, led by Cat Lai and Cai Mep-Thi Vai near Ho Chi Minh City, now handle a large share of Southeast Asia export volume.',
      },
      {
        question: 'What documents are needed to import from Vietnam?',
        answer:
          'The same standard entry documents apply as any origin: commercial invoice, packing list, bill of lading, and a customs bond, plus an ISF filing at least 24 hours before ocean cargo is loaded.',
      },
      {
        question: 'Is FCL or LCL cheaper for a Vietnam shipment?',
        answer:
          'FCL usually becomes cheaper per cubic meter once a shipment exceeds roughly 15 CBM. Below that volume, LCL consolidation is typically the lower-cost option.',
      },
    ],
    metaTitle: 'Vietnam to USA Freight Forwarding',
    metaDescription:
      'Ocean FCL & LCL and air freight from Vietnam to the USA: in-house customs and ISF filing, direct carrier contracts, and JFK-area warehousing.',
  },
];

export function getTradeLane(slug: string): TradeLane | undefined {
  return TRADE_LANES.find((l) => l.slug === slug);
}
