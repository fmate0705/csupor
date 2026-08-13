import { cn } from '@/lib/cn';

const widths = {
  /** Default editorial measure — 1200px (D-005). */
  default: 'max-w-[1200px]',
  /** For long-form prose, keeps the measure near 70ch (D-025). */
  prose: 'max-w-[68ch]',
  /** Full-width bands that still need gutters. */
  wide: 'max-w-[1440px]',
} as const;

/** Centres content at one of three defined widths with consistent gutters. */
export function Container({
  width = 'default',
  className,
  children,
}: {
  width?: keyof typeof widths;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('mx-auto w-full px-5 sm:px-8 lg:px-10', widths[width], className)}>
      {children}
    </div>
  );
}
