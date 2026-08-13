import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';

import { cn } from '@/lib/cn';

/**
 * The one button system for the whole site (CEF D-049..D-057).
 *
 * Corners are near-square and labels are uppercase with wide tracking — the
 * language of enamel signage and crate stencils rather than of an app. Every
 * variant reads off semantic tokens, so the same component works unchanged
 * inside a `.on-dark` band.
 */
export const buttonVariants = cva(
  [
    'group relative inline-flex items-center justify-center gap-2 rounded-md',
    // Labels are short by design and must never wrap inside a fixed-height
    // button; the containing row wraps instead.
    'whitespace-nowrap font-semibold uppercase tracking-[0.12em] leading-none',
    'transition-[background-color,color,border-color,transform] duration-fast ease-standard',
    'active:translate-y-px',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        /** Ink on light, gold on dark — always the single primary action. */
        primary: 'bg-primary text-primary-foreground hover:bg-primary/85',
        /** Quiet outline that fills on hover. */
        outline:
          'border border-foreground/25 text-foreground hover:border-foreground hover:bg-foreground hover:text-background',
        /** Text-level action; the underline is the affordance, not the colour. */
        ghost:
          'text-foreground underline decoration-gold decoration-2 underline-offset-[6px] hover:decoration-[3px]',
        /** Gold fill. Reserved for the one call-to-visit on a photographic band. */
        gold: 'bg-gold text-accent-foreground hover:bg-gold/85',
      },
      size: {
        // 44px minimum touch target (D-051, D-099).
        sm: 'h-11 px-4 text-xs',
        md: 'h-12 px-6 text-sm',
        lg: 'h-14 px-8 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

/** An action button. Use `ButtonLink` for navigation. */
export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

interface ButtonLinkProps extends VariantProps<typeof buttonVariants> {
  href: string;
  className?: string;
  children: React.ReactNode;
  /** Opens in a new tab with the correct rel and an accessible hint. */
  external?: boolean;
}

/** A link styled as a button, for navigation actions (D-056). */
export function ButtonLink({
  href,
  className,
  variant,
  size,
  children,
  external,
}: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (új lapon nyílik meg)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
