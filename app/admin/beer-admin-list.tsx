'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';

import {
  deleteBeerAction,
  moveBeerAction,
  updateBeerAction,
  type ActionState,
} from '@/app/admin/actions';
import { BeerFields } from '@/app/admin/beer-fields';
import { Button } from '@/components/ui/button';
import type { Beer } from '@/lib/beers/schema';

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="sm" disabled={pending}>
      {pending ? 'Mentés…' : 'Mentés'}
    </Button>
  );
}

/**
 * Delete is a two-step confirm rather than a `window.confirm`: destructive
 * actions must be confirmed and styled as destructive (D-053), and a native
 * dialog is neither styleable nor reliably announced.
 */
/** Must be a child of the <form> for useFormStatus to see the submission. */
function ConfirmDeleteButton({ name }: { name: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 bg-danger px-3 text-xs font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-50"
    >
      {pending ? 'Törlés…' : 'Igen, törlöm'}
      <span className="sr-only"> — {name}</span>
    </button>
  );
}

function DeleteControl({ beer }: { beer: Beer }) {
  const [state, formAction] = useActionState<ActionState, FormData>(deleteBeerAction, {});
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="h-11 px-3 text-xs font-semibold uppercase tracking-[0.1em] text-danger underline-offset-4 hover:underline"
      >
        Törlés
        <span className="sr-only"> — {beer.name}</span>
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={beer.id} />
      <span className="text-xs text-muted">Biztos?</span>
      <ConfirmDeleteButton name={beer.name} />
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="h-11 px-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted"
      >
        Mégse
      </button>
      <span aria-live="polite" className="sr-only">
        {state.error ?? state.success ?? ''}
      </span>
    </form>
  );
}

function BeerRow({ beer, index, total }: { beer: Beer; index: number; total: number }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateBeerAction, {});
  const [editing, setEditing] = useState(false);

  return (
    <li className="border-b border-border bg-background last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-6">
        {/* Reorder */}
        <div className="flex flex-col">
          <form action={moveBeerAction}>
            <input type="hidden" name="id" value={beer.id} />
            <input type="hidden" name="direction" value="up" />
            <button
              type="submit"
              disabled={index === 0}
              className="flex h-6 w-8 items-center justify-center text-muted hover:text-foreground disabled:opacity-25"
            >
              <ChevronUp aria-hidden className="h-4 w-4" />
              <span className="sr-only">{beer.name} feljebb</span>
            </button>
          </form>
          <form action={moveBeerAction}>
            <input type="hidden" name="id" value={beer.id} />
            <input type="hidden" name="direction" value="down" />
            <button
              type="submit"
              disabled={index === total - 1}
              className="flex h-6 w-8 items-center justify-center text-muted hover:text-foreground disabled:opacity-25"
            >
              <ChevronDown aria-hidden className="h-4 w-4" />
              <span className="sr-only">{beer.name} lejjebb</span>
            </button>
          </form>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-display text-lg">{beer.name}</h3>
            {beer.abv !== null ? (
              <span className="text-sm tabular-nums text-muted">{beer.abv}%</span>
            ) : null}
            {beer.seasonal ? (
              <span className="border border-border px-1.5 py-0.5 text-[0.6875rem] uppercase tracking-wider text-muted">
                Szezonális
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted">{beer.style}</p>
        </div>

        {/* Status — text plus colour, never colour alone (D-038). */}
        <span
          className={
            beer.onTap
              ? 'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-success'
              : 'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted'
          }
        >
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${beer.onTap ? 'bg-success' : 'bg-muted/50'}`}
          />
          {beer.onTap ? 'Csapon' : 'Pihen'}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            aria-expanded={editing}
            className="inline-flex h-11 items-center gap-2 px-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted hover:text-foreground"
          >
            <Pencil aria-hidden className="h-3.5 w-3.5" />
            {editing ? 'Bezár' : 'Szerkeszt'}
            <span className="sr-only"> — {beer.name}</span>
          </button>
          <DeleteControl beer={beer} />
        </div>
      </div>

      {editing ? (
        <div className="border-t border-border bg-surface px-4 py-6 sm:px-6">
          <form action={formAction}>
            <input type="hidden" name="id" value={beer.id} />
            <BeerFields beer={beer} idPrefix={beer.id} />
            <div aria-live="polite">
              {state.error ? (
                <p className="mt-5 border-l-2 border-danger bg-background px-4 py-3 text-sm">
                  {state.error}
                </p>
              ) : null}
              {state.success ? (
                <p className="mt-5 border-l-2 border-success bg-background px-4 py-3 text-sm">
                  {state.success}
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <SaveButton />
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="h-11 px-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted"
              >
                Mégse
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </li>
  );
}

export function BeerAdminList({ beers }: { beers: readonly Beer[] }) {
  if (beers.length === 0) {
    return (
      <div className="mt-6 border border-dashed border-border bg-background px-6 py-14 text-center">
        <p className="font-display text-xl">Még nincs egy sör sem</p>
        <p className="mx-auto mt-2 max-w-[40ch] text-sm text-muted">
          Add hozzá az elsőt a fenti űrlappal, és azonnal megjelenik az oldalon.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-6 border border-border">
      {beers.map((beer, index) => (
        <BeerRow key={beer.id} beer={beer} index={index} total={beers.length} />
      ))}
    </ul>
  );
}
