export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
}

/**
 * Empty until real, attributable testimonials are supplied (spec F8).
 * Anonymous testimonials do not convert, so the type forbids them:
 * every entry needs a name, a title, and a company.
 */
export const TESTIMONIALS: Testimonial[] = [];
