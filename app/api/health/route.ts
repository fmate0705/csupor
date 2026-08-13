import { NextResponse } from 'next/server';

/**
 * Liveness endpoint for the Docker healthcheck (ODK-05).
 *
 * Deliberately shallow: it proves the Node server is up and routing. It does
 * not touch the beer store, because a transient read error should not cause
 * the orchestrator to restart a container that is otherwise serving the site
 * fine from its prerendered pages.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ status: 'ok', uptime: Math.round(process.uptime()) });
}
