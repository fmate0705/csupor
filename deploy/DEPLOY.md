# Deploying Csupor Craft Beer

Single container, single host, no CI required. The stack is defined entirely by
`docker-compose.yml`.

> This replaces the runbook `cef generate` emits by default, which targets a
> Traefik-fronted host on port 80 with `hosting_<slug>_web` naming. This project
> was specified to follow the CEF operations standard instead — port 3000,
> `<project>-<service>` naming. See `.cef/memory/decisions.md`.

## Contract

| Thing       | Value                   | Rule                         |
| ----------- | ----------------------- | ---------------------------- |
| Container   | `csupor-web`            | ODK-08 `<project>-<service>` |
| Network     | `csupor-network`        | ODK-09                       |
| Volume      | `csupor-data` → `/data` | ODK-10                       |
| Port        | `3000`                  | ODK-06                       |
| User        | `nextjs` (uid 1001)     | ODK-03 non-root              |
| Healthcheck | `GET /api/health`       | ODK-05                       |
| Limits      | 1.0 CPU / 512 MB        | ODK-12                       |

## First deploy

```bash
git clone <repo> csupor && cd csupor
cp .env.example .env
```

Fill in `.env` — the app refuses to start without a real `AUTH_SECRET`:

```bash
# generate a secret
openssl rand -base64 32
```

| Variable               | Notes                                                         |
| ---------------------- | ------------------------------------------------------------- |
| `ADMIN_USERNAME`       | Admin login                                                   |
| `ADMIN_PASSWORD`       | Minimum 12 characters                                         |
| `AUTH_SECRET`          | Minimum 32 characters; rotating it logs everyone out          |
| `NEXT_PUBLIC_SITE_URL` | Public origin — canonical URLs and the sitemap derive from it |
| `DATA_DIR`             | `/data` in Docker; leave as set in compose                    |

Then:

```bash
docker compose up -d --build
docker compose ps          # csupor-web should report (healthy)
curl localhost:3000/api/health
```

Put a TLS-terminating reverse proxy in front of `127.0.0.1:3000`. The app sets
HSTS, CSP, `X-Frame-Options` and `Referrer-Policy` itself, so the proxy only
needs to terminate TLS and forward `X-Forwarded-For` (the login rate limiter
reads it).

## Updating

```bash
git pull
docker compose up -d --build
```

The beer list lives on the `csupor-data` volume and survives rebuilds — this is
covered by `scripts/verify-persistence.mjs`, which creates a beer, restarts the
container and asserts it is still published.

**Do not** run `docker compose down -v`: `-v` deletes the volume and the beer
list with it.

## Backup

The entire mutable state is one small JSON file:

```bash
docker run --rm -v csupor-data:/data -v "$PWD:/backup" alpine \
  sh -c 'cp /data/beers.json /backup/beers-$(date +%F).json'
```

Restore by copying a file back into the volume and restarting the container.

## Rollback

Images are rebuilt from the repository, so rolling back is a git checkout plus
a rebuild:

```bash
git checkout <previous-tag>
docker compose up -d --build
```

The volume is untouched, so the beer list carries over.

## Post-deploy checks

```bash
node scripts/validate.mjs https://csuporcraftbeer.com
node scripts/verify-map.mjs https://csuporcraftbeer.com
```

## Before the first public launch

- Fill the six `null` fields in `content/operator.ts` (company name, registered
  address, registration number, tax number, e-mail, hosting provider). The
  imprint page shows a warning banner until they are set.
- Have the imprint and privacy text reviewed by a Hungarian lawyer.
- Add real opening hours to `content/business.ts` once confirmed with the
  brewery.
