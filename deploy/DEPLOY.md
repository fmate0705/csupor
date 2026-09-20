# Deploying Csupor Craft Beer

Deploys to the **Klivo Docker hosting platform** (Traefik reverse proxy, one
container per site). No CI — the platform builds and runs this repository's
`docker-compose.yml` on deploy, after a security scan.

## The platform contract

`docker-compose.yml` is not free-form. The platform validates it
(`api/src/services/composeValidator.ts`) and **fails closed**, so anything it
cannot fully understand is rejected. The binding rules:

| Rule                                                    | This project                          |
| ------------------------------------------------------- | ------------------------------------- |
| Only the client's own network                           | `client_csupor_net`, `external: true` |
| Container reachable by name                             | `container_name: hosting_csupor_web`  |
| No host bind mounts                                     | named volume `csupor-data` only       |
| No Docker socket                                        | none                                  |
| No `privileged`, `cap_add`, `security_opt`, `devices`   | none                                  |
| No host namespaces (`network_mode: host`, `pid`, `ipc`) | none                                  |
| `env_file` / build context inside the site directory    | `.env`, `.`                           |
| No Docker labels                                        | none — Traefik uses its file provider |

The slug `csupor` comes from the site directory
(`/app/clients/csupor/sites/csupor`); the validator derives the allowed network
name from it. **If the client slug ever changes, both `container_name` and the
network name must change with it** or the deploy is rejected.

> Attaching to any other network — including the platform's own — is rejected by
> design: it is what keeps a site off the network hosting the API and database.

## Port

The app listens on **3000** (`Dockerfile`: `ENV PORT=3000`, `EXPOSE 3000`).

The platform's default `container_port` is **80**, so this site must be
configured with **`container_port = 3000`** in the panel. Without that, Traefik
routes to port 80 and gets nothing — the site would show a gateway error while
the container itself reports healthy.

If you would rather use the platform default, change `PORT`/`EXPOSE` to `80` in
the `Dockerfile`, `expose` and the `PORT` env in `docker-compose.yml`, and the
healthcheck URL in both — then leave `container_port` unset.

## First deploy

1. **Create the client and site in the panel** with the slug `csupor`. The
   platform provisions `client_csupor_net`.
2. **Set `container_port` to 3000** for the site.
3. **Set the environment** under Sites → site → Environment. The panel writes
   `.env`, which the compose loads via `env_file`; nothing is baked into the
   image.

   | Variable               | Notes                                                                                                                                          |
   | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
   | `ADMIN_USERNAME`       | Admin login                                                                                                                                    |
   | `ADMIN_PASSWORD`       | Minimum 12 characters                                                                                                                          |
   | `AUTH_SECRET`          | Minimum 32 characters — `openssl rand -base64 32`. The app refuses to authenticate without it rather than falling back to a guessable default. |
   | `NEXT_PUBLIC_SITE_URL` | Public origin; canonical URLs, OG tags and the sitemap derive from it                                                                          |
   | `DATA_DIR`             | `/data` — already set in the compose                                                                                                           |

4. **Point the site at the repository** (repo + branch) and deploy, or push to
   the configured branch if the webhook is set up.

## Local development

The production file publishes no host port and expects a platform-provisioned
network, so local runs use the explicit override:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

That publishes <http://localhost:3000> and swaps the external network for a
local bridge. It is deliberately **not** named `docker-compose.override.yml`,
because Compose merges that automatically — which would publish a host port on
the production VPS too.

## Data and backups

The beer list is a single JSON file on the `csupor-data` volume. It survives
rebuilds and redeploys — `scripts/verify-persistence.mjs` proves it by creating
a beer, restarting the container and asserting it is still published.

```bash
# backup
docker run --rm -v csupor-data:/data -v "$PWD:/backup" alpine \
  sh -c 'cp /data/beers.json /backup/beers-$(date +%F).json'
```

**Never run `docker compose down -v`** — `-v` deletes the volume and the beer
list with it.

## Rollback

Images are rebuilt from the repository, so a rollback is a checkout plus a
rebuild. The volume is untouched, so the beer list carries over.

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
