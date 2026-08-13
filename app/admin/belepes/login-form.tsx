'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { loginAction, type ActionState } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gold" size="lg" className="mt-8 w-full" disabled={pending}>
      {pending ? 'Belépés…' : 'Belépés'}
    </Button>
  );
}

const fieldClass =
  'mt-2 h-12 w-full border border-border bg-surface px-4 text-foreground placeholder:text-muted/70 focus-visible:border-gold';

export function LoginForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="mt-8">
      {/* Announced to screen readers the moment it appears (D-088). */}
      <div aria-live="polite">
        {state.error ? (
          <p className="mb-6 border-l-2 border-danger bg-surface px-4 py-3 text-sm text-foreground">
            {state.error}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="username" className="text-sm font-medium">
          Felhasználónév
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          className={fieldClass}
        />
      </div>

      <div className="mt-6">
        <label htmlFor="password" className="text-sm font-medium">
          Jelszó
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </div>

      <SubmitButton />
    </form>
  );
}
