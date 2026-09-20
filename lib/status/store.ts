import 'server-only';

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { DEFAULT_STATUS, statusSchema, type Status, type StatusInput } from './schema';

/**
 * The open/closed state, stored beside the beer list on the same volume.
 *
 * Same shape as `lib/beers/store.ts` — one small JSON file, atomic writes (temp
 * file plus rename) so a crash cannot leave a truncated record, and a serialised
 * queue so two saves cannot interleave. A single row does not justify anything
 * more (CEF Principles 5 and 18).
 */

const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'status.json');

let writeQueue: Promise<unknown> = Promise.resolve();

/**
 * The stored status, or the default when nothing has been saved yet.
 *
 * Never throws: the hero renders this, and a malformed file must not take the
 * home page down. A bad read falls back to `hidden`, which shows no card —
 * failing to the state that claims nothing.
 */
export async function readStatus(): Promise<Status> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = statusSchema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      console.error('[status] stored data failed validation, hiding the card', parsed.error.issues);
      return DEFAULT_STATUS;
    }
    return parsed.data;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') console.error('[status] could not read store', error);
    return DEFAULT_STATUS;
  }
}

/** Saves the status and stamps the time, so the admin can see how stale it is. */
export async function writeStatus(input: StatusInput): Promise<Status> {
  const next = writeQueue.then(async () => {
    const status: Status = {
      ...input,
      // A note only belongs to a visible card; clearing it on hide stops a
      // stale festival message reappearing months later.
      note: input.mode === 'hidden' ? '' : input.note,
      updatedAt: new Date().toISOString(),
    };

    await mkdir(dirname(DATA_FILE), { recursive: true });
    const tmp = `${DATA_FILE}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(status, null, 2) + '\n', 'utf8');
    await rename(tmp, DATA_FILE);
    return status;
  });

  writeQueue = next.catch(() => undefined);
  return next;
}
