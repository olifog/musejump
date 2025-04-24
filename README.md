$ musejump.com

webapp that lets you skip and loop bits of songs on spotify, email me with your spotify account email to get added to the whitelist :-)

you can run it yourself by:

1. creating a .env file in apps/web with the following:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=
DATABASE_URL=
```

filling in the values will require setting up a clerk app, spotify app, and a postgres db. you can use `pnpm drizzle-kit push` from within `apps/web` to push the schema to the db.\

2. creating a .env file in apps/worker with the following:

```
SPOTIFY_CLIENT_ID=
CLERK_API_KEY=
DATABASE_URL=
```

3. to run the frontend, do `pnpm run dev` in the root
4. to run the backend, do `make build && make run` in the root -- this requires Go to be installed

