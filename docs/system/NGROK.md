# ngrok Tunnel: Start, Restart, and Verify

This guide explains how to start or restart the ngrok tunnel for the client dev server and how to verify that it’s working. We use a reserved ngrok domain for consistency:

Reserved domain: https://emily-app.ngrok.app

The client runs on Vite at `http://localhost:5173` and we expose it publicly via ngrok so it’s accessible on mobile devices or by external testers.

## Prerequisites

- ngrok v3 installed (`ngrok version`)
- Vite dev server available at port 5173 (client)
- Optional: Server API at `http://localhost:3000` if you need API functionality

## One-time configuration (already applied)

- `client/vite.config.ts` has `server.allowedHosts: ['emily-app.ngrok.app']` so that only the reserved domain is allowed in development.
- ngrok web UI runs on `http://127.0.0.1:4040` for request inspection.

## Start or Restart the tunnel

1) Ensure/Start the Vite dev server

```bash
# From repo root
cd client
npm run dev
# Vite should show: Local: http://localhost:5173/
```

2) Start ngrok for the client port (5173) using the reserved domain

```bash
# Start ngrok with the reserved domain and print logs to stdout
ngrok http --domain=emily-app.ngrok.app http://localhost:5173 --log=stdout
# The public URL will be: https://emily-app.ngrok.app
```

3) Verify locally and via ngrok

```bash
# Local dev server should return 200
curl -I http://localhost:5173 | head -n 5

# ngrok URL should return 200 as well
curl -I https://emily-app.ngrok.app | head -n 10
```

## Common issues

- "Blocked request. This host is not allowed":
  - Ensure `client/vite.config.ts` contains `server.allowedHosts: ['emily-app.ngrok.app']` and restart Vite.
- 403 from ngrok:
  - Ensure the local dev server is running and reachable on `http://localhost:5173`.
  - Restart Vite if you just changed `vite.config.ts`.
- Port conflicts on 5173:
  - Stop the old process: `lsof -ti :5173 | xargs kill`
  - Then restart `npm run dev` in `client/`.

## Quick commands

```bash
# Stop Vite on 5173 if stuck
lsof -ti :5173 | xargs kill

# Start Vite (in background in another terminal)
cd client
npm run dev

# Start ngrok with the reserved domain (shows the public URL in logs)
ngrok http --domain=emily-app.ngrok.app http://localhost:5173 --log=stdout

# Verify
curl -I http://localhost:5173 | head -n 5
curl -I https://emily-app.ngrok.app | head -n 10
```

## Notes

- ngrok dashboard: http://127.0.0.1:4040
- For security, keep `server.allowedHosts: true` only for local development. For production builds or exposed preview environments, restrict allowed hosts as needed.
