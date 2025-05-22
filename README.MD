# Twitter CLone Mono Repo

## App Overview

- Twitter-Like
- Tweet, Retweet, Like, Reply
- Topics with #
- Follow & Followers
- Auth

## Stack Overview (ZAP stack)

- Supabase Db (with auth to be implemented)
  - Postgres (for now as proof of concept)
  - postgres-migrations - see: npm postgres-migrations: [https://www.npmjs.com/package/postgres-migrations]
- Zero-Cache
- Test Vite Auth Server
- Angular Front End

## Features of Note

- Postgres DB Function Generates '#Topics' from Message Text
- FSM used on Modal Form for loading/managing EntityView State
- Bootstrap Style system with Dark/Light mode detection

## Add these features

### Integrate Reweet, Reply and Like functions (with updated DB structure)

### User's Pages

### Auth

### Querying

- Filter Messages by Topic
- Filter Topics by Trending
- Filter Users by Popular Content

### TODO

- Implement EntityView State onto a 'View/Form Component' with API examples
- Implement Data layer with a Sync solution such as Zero/Electric/PowerSync
- Integrate States with a Form State (Schema & Field Settings)
  - Schema is the DB Schema (fields, types, nullables, keys, etc)
  - Field Settings is the custom configuration layer on the schema (Visibility, Validation, Disabled, Readonly, and other Meta data)

- Build Prototype with Two different List views and entity views
  - test how re-useable the Machine is, and how we would handle specific Entity Commands needs
    - if this is simply spawing an child actor or just a new actor or just use gneric api calls for the specific use cases, while the generic use cases are completely re-useable.
- Note: the big challenge here is to Refine the DB Migration process

## Postgres

- just a DB
- for larger scale manageability and DX - it may be useful to use Supabase

### `npm i`

### `npm run dev:db-up`

### `npm run dev:db-down`

### Migrations

- generate your own migration files and run them against the PostgresDB using the admin tools
- use npm command on project root: `npm run migrations`
  - see docs for details: [https://www.npmjs.com/package/postgres-migrations]

## Zero-Cache

- a standalone server running the Zero-Cache service
- `npm i`
- `npm run dev:zero-cache`

### Schema Changes

- todo: test and verify the schema migration process according to Zero's reccomoendations

## Auth Client (for testing)

- Vite/Hono http server for generating login cookies
- `npm i`
- `npm run dev:ui`

## Angular Client

- a proof of concept Client UI running a "Twitter Like" application
- `npm i`
- `ng serve`

### Tech of Note

- Xstate for EntityView State management
- Zero Client for Data Sync
- Angular-Zero wrapper for convenience
- Bootstrap for UI Classes/Styles
- NgBootstrap for Angular Bootstrap Components

## Schema Migrations

- Expand/Migrate/Contract method

### 1. DB Migration

- peform DB schema migration first
- should be back-compatible with running clients

### 2. Cache Migration

- run `zero-deploy-permissions`

### 3. Client Migration

- update and deploy code using the new schema

### 4. 'Contract'

- after some grace period, run the 'contract' migration to remove obsolete tables/columns

## Links

### Db Func Debugging

- <https://avilpage.com/2019/04/how-to-debug-postgres-triggers.html>

### Bootstrap Icons

- <https://icons.getbootstrap.com/>

## Setup

Gudie for setting up a VPS with Docker Stack: [https://www.youtube.com/watch?v=fuZoxuBiL9o]

### VPS with docker stack

- generate docker images for all relevant services
- use the images in your stack file (actions will trigger a stack deploy)

## CI/Testing

- see: pipeline.yml for example test stage

- GH Actions
  - on PR: run tests
  - ng test on the web image

## CD/Deploying

- see: pipeline.yml for example build stage

- GH Actions
  - on push to main
  - BUILD step
  - trigger angular client image build and tag
  - Run Docker Stack command to deploy the Services on the Remote VPS
    - trigger zero-cache-permissions deploy
      - needs access to the 'private' schema file
    - Run DB Migrations

### Issue

- schema file needs to be accessible on the zero-cache container
  - we dont want to rebuild the cache server with a possibly unchangned schema file
    - copy the schema file into the Zero-cache container (build script)
  - QUESTION: can we run a command on each docker stack deploy?
    - pass in the commit hash and fetch the file from GIT via api key?
    - run zero-cache-permissions against this new file with the custom bash script (using env params)?

## CODE Layout

### Local Dev (Docker Compose)

- Angular Client uses dev server to watach and rebuild
- zero-cache permissions must be run manually (npm run ...)
- postgres db migration must be run manually (npm run migrations)

#### Process

1. Update Client
2. Migrate DB (expand,migrate,contract)
3. Deploy Cache permissions

### CI/CD

- OnPush to Master: Github Actions Test/Build/Deploy
  - alternate: on Create Release