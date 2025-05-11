# Twitter CLone Mono Repo
## Postgres
- just a DB
- for larger scale manageability and DX - it may be useful to use Supabase
### `npm i`
### `npm run dev:db-up`
### `npm run dev:db-down`

## Zero-Cache
- a standalone server running the Zero-Cache service
### `npm i`
### `npm run dev:zero-cache`

## Auth Client (for testing)
- Vite/Hono
### `npm i`
### `npm run dev:ui`

## Angular Client
- a proof of concept Client UI running a "Twitter Like" application
### `npm i`
### `ng serve`