import { z } from 'zod';

/**
 * The taproom's current state, as shown on the hero.
 *
 * Three states rather than a boolean, and it starts `hidden`.
 *
 * The site deliberately publishes no opening hours, because none could be
 * verified and the taproom is seasonal (see `.cef/memory/decisions.md`). A
 * boolean defaulting to "open" would put that same unverified claim back on the
 * front page the moment the feature shipped. `hidden` means the card does not
 * render at all, so the brewery asserts nothing until someone actually flips it.
 */
export const STATUS_MODES = ['hidden', 'open', 'closed'] as const;
export type StatusMode = (typeof STATUS_MODES)[number];

export const statusSchema = z.object({
  mode: z.enum(STATUS_MODES).default('hidden'),
  /**
   * One short line under the state — "Ma 23:00-ig csapolunk", or the reason for
   * being closed: "A Főzdefeszten vagyunk Egerben". Capped because it renders
   * on one or two lines inside a small card in the hero.
   */
  note: z.string().trim().max(160).default(''),
  /** ISO timestamp of the last change. Shown in the admin so staleness is visible. */
  updatedAt: z.string(),
});

export type Status = z.infer<typeof statusSchema>;

/** What the admin form submits; the store stamps `updatedAt`. */
export const statusInputSchema = statusSchema.omit({ updatedAt: true });
export type StatusInput = z.infer<typeof statusInputSchema>;

/** Nothing is claimed until the brewery says so. */
export const DEFAULT_STATUS: Status = {
  mode: 'hidden',
  note: '',
  updatedAt: '1970-01-01T00:00:00.000Z',
};
