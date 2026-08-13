/**
 * Legal operator details for the imprint page.
 *
 * These are company-registry facts that only the owner holds, so they are left
 * `null` rather than guessed — a wrong tax number or company name on a public
 * imprint is a legal problem, not a cosmetic one. The imprint page renders a
 * visible "Kitöltendő" marker for every null and shows a notice until they are
 * all filled, so the gap cannot ship unnoticed.
 *
 * Fill these in before launch.
 */
export const operator = {
  /** Bejegyzett cégnév, pl. "Csupor Sörfőzde Kft." */
  companyName: null as string | null,
  /** Székhely, ha eltér a telephelytől. */
  registeredAddress: null as string | null,
  /** Cégjegyzékszám. */
  registrationNumber: null as string | null,
  /** Adószám. */
  taxNumber: null as string | null,
  /** Kapcsolattartó e-mail cím. */
  email: null as string | null,
  /** Tárhelyszolgáltató neve és elérhetősége. */
  hostingProvider: null as string | null,
} as const;
