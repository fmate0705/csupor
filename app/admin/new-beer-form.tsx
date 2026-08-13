'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Plus } from 'lucide-react';

import { createBeerAction, type ActionState } from '@/app/admin/actions';
import { BeerFields } from '@/app/admin/beer-fields';
import { Button } from '@/components/ui/button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="md" disabled={pending}>
      {pending ? 'Mentés…' : 'Hozzáadás'}
    </Button>
  );
}

export function NewBeerForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createBeerAction, {});
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a successful save so the next beer starts blank.
  // On failure the form keeps what was typed (D-081).
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <section className="mt-10 border border-border bg-background">
      <h2 className="sr-only">Új sör hozzáadása</h2>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="new-beer-fields"
        className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold uppercase tracking-[0.1em] sm:px-6"
      >
        <Plus
          aria-hidden
          className={`h-4 w-4 text-gold-ink transition-transform duration-normal ${open ? 'rotate-45' : ''}`}
        />
        Új sör hozzáadása
      </button>

      <div id="new-beer-fields" hidden={!open} className="border-t border-border px-5 py-6 sm:px-6">
        <form ref={formRef} action={formAction}>
          <BeerFields idPrefix="new" />
          <div aria-live="polite">
            {state.error ? (
              <p className="mt-5 border-l-2 border-danger bg-surface px-4 py-3 text-sm">
                {state.error}
              </p>
            ) : null}
            {state.success ? (
              <p className="mt-5 border-l-2 border-success bg-surface px-4 py-3 text-sm">
                {state.success}
              </p>
            ) : null}
          </div>
          <div className="mt-6">
            <SubmitButton />
          </div>
        </form>
      </div>
    </section>
  );
}
