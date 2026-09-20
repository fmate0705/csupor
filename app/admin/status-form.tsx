'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { updateStatusAction, type ActionState } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import type { Status, StatusMode } from '@/lib/status/schema';

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="md" disabled={pending}>
      {pending ? 'Mentés…' : 'Állapot mentése'}
    </Button>
  );
}

const MODES: ReadonlyArray<{ value: StatusMode; label: string; hint: string }> = [
  { value: 'open', label: 'Nyitva', hint: 'A kezdőlapon „Most nyitva” jelenik meg.' },
  { value: 'closed', label: 'Zárva', hint: 'A kezdőlapon „Most zárva” jelenik meg.' },
  {
    value: 'hidden',
    label: 'Nem jelenik meg',
    hint: 'Semmilyen állapot nem látszik az oldalon.',
  },
];

/** Formats the last-saved time in Hungarian, and flags it when it looks stale. */
function lastSaved(updatedAt: string): { text: string; stale: boolean } | null {
  const then = new Date(updatedAt).getTime();
  if (!Number.isFinite(then) || then <= 0) return null;

  const hours = (Date.now() - then) / 3_600_000;
  const text = new Intl.DateTimeFormat('hu-HU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(then);

  return { text, stale: hours > 24 };
}

/**
 * Sets the open/closed card in the hero.
 *
 * Sits at the top of the panel because it is the only thing here that goes out
 * of date by the hour — the beer list changes weekly, this changes daily.
 *
 * The note field stays enabled in every state so a message typed before picking
 * "Zárva" is not lost; the store discards it when the card is hidden.
 */
export function StatusForm({ status }: { status: Status }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateStatusAction, {});
  const [mode, setMode] = useState<StatusMode>(status.mode);

  const saved = lastSaved(status.updatedAt);

  return (
    <section className="border border-border bg-background">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-display text-xl">Nyitva vagyunk?</h2>
          {saved ? (
            <p className={`text-xs ${saved.stale ? 'text-warning' : 'text-muted'}`}>
              Utoljára mentve: {saved.text}
              {saved.stale ? ' — érdemes frissíteni' : ''}
            </p>
          ) : null}
        </div>
        <p className="mt-2 max-w-[62ch] text-sm text-muted">
          Ez a kis kártya a kezdőlap tetején jelenik meg. Ha zárva vagytok, írd mellé az okát —
          például hogy épp egy fesztiválon csapoltok.
        </p>
      </div>

      <form action={formAction} className="px-5 py-6 sm:px-6">
        <fieldset>
          <legend className="text-sm font-medium">Állapot</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {MODES.map((option) => {
              const active = mode === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer flex-col gap-1 border px-4 py-3 transition-colors duration-fast ${
                    active
                      ? 'border-foreground bg-surface'
                      : 'border-border hover:border-foreground/40'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="mode"
                      value={option.value}
                      checked={active}
                      onChange={() => setMode(option.value)}
                      className="h-4 w-4 accent-[rgb(var(--gold))]"
                    />
                    <span className="font-medium">{option.label}</span>
                  </span>
                  <span className="pl-[26px] text-xs text-muted">{option.hint}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6">
          <label htmlFor="status-note" className="text-sm font-medium">
            Megjegyzés <span className="font-normal text-muted">(nem kötelező)</span>
          </label>
          <input
            id="status-note"
            name="note"
            type="text"
            maxLength={160}
            defaultValue={status.note}
            placeholder="Ma 23:00-ig csapolunk · A Főzdefeszten vagyunk Egerben"
            aria-describedby="status-note-help"
            className="mt-1.5 h-11 w-full border border-border bg-background px-3 text-foreground placeholder:text-muted/60"
          />
          <p id="status-note-help" className="mt-1.5 text-xs text-muted">
            Egy rövid mondat, legfeljebb 160 karakter. „Nem jelenik meg” állapotban nem mentjük el.
          </p>
        </div>

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
          <SaveButton />
        </div>
      </form>
    </section>
  );
}
