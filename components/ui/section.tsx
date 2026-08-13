import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/cn';

/**
 * A page band.
 *
 * The site's rhythm comes from alternating tones rather than from stacking
 * cards (brief §7, §14). `tone="dark"` applies the `.on-dark` class, which
 * re-points the semantic colour tokens — so anything rendered inside adapts
 * with no dark-specific variants of its own.
 */

const tones = {
  paper: 'bg-background text-foreground',
  warm: 'bg-surface text-foreground',
  dark: 'on-dark bg-background text-foreground',
} as const;

const spacing = {
  sm: 'py-14 sm:py-16',
  md: 'py-16 sm:py-24 lg:py-28',
  lg: 'py-20 sm:py-28 lg:py-36',
} as const;

interface SectionProps {
  tone?: keyof typeof tones;
  space?: keyof typeof spacing;
  width?: 'default' | 'prose' | 'wide';
  /** Renders without the Container, for full-bleed bands. */
  bleed?: boolean;
  className?: string;
  id?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export function Section({
  tone = 'paper',
  space = 'md',
  width = 'default',
  bleed = false,
  className,
  id,
  children,
  ...rest
}: SectionProps) {
  return (
    <section id={id} className={cn(tones[tone], spacing[space], className)} {...rest}>
      {bleed ? children : <Container width={width}>{children}</Container>}
    </section>
  );
}

/**
 * The standard section opening: a small tracked label, the heading, and an
 * optional lead paragraph. Using one component for this is what keeps the
 * hierarchy identical on every page (CEF Principle 2).
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  as: Heading = 'h2',
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  id?: string;
  as?: 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <Reveal
      className={cn('flex flex-col', align === 'center' && 'items-center text-center', className)}
    >
      {eyebrow ? (
        <span className="eyebrow flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-gold" />
          {eyebrow}
        </span>
      ) : null}
      <Heading
        id={id}
        className={cn(
          // Fluid rather than a fixed step: at 320px a 36px Archivo Black word
          // like "RAKLAPASZTAL," is wider than the screen.
          'font-display text-[clamp(1.75rem,6.5vw,3rem)]',
          eyebrow ? 'mt-5' : undefined,
          align === 'center' && 'max-w-3xl',
        )}
      >
        {title}
      </Heading>
      {lead ? (
        <p
          className={cn(
            'mt-5 max-w-[58ch] text-lg text-muted',
            align === 'center' && 'text-balance',
          )}
        >
          {lead}
        </p>
      ) : null}
    </Reveal>
  );
}
