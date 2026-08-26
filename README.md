# LALA Demo

LALA's evidence-first, visitor-accessible, and resilient local travel design
demo, packaged as a Google AI Studio full-stack project for Cloud Run.

## Experience included

- Three-step onboarding with five interface languages
- Nationwide manual region selection and honest no-coverage recovery
- Search, Map, Plan, and governed Local Signals tabs
- Evidence rows for source, freshness, and recommendation reason
- Four-slot plan intervention and undo
- Text-first docent fallback plus an explicit server-side Gemini action
- Responsive mobile and desktop layouts

## Truthfulness boundary

The bundled places, map, weather, freshness, and Local Signals are deterministic
design-demo data. They are not production LALA runtime evidence. Only Jongno-gu
has bundled place coverage; other regions show a recovery state instead of
substituting Seoul results. The Gemini docent is never called automatically.

## Server secret

`GEMINI_API_KEY` is read only by the Node.js server in `api-handler.ts`. The
browser calls `/api/docent` and never receives the key. Do not put the key in a
`VITE_*` variable, source file, GitHub secret committed as text, or client-side
configuration.

For AI Studio, add `GEMINI_API_KEY` in the Secrets panel. For Cloud Run, map a
Secret Manager secret to the `GEMINI_API_KEY` environment variable. The
optional `GEMINI_MODEL` server variable defaults to `gemini-3.7-flash`.

Without the secret, the complete UI and the default text docent still work.
`POST /api/docent` returns an honest `503 gemini_not_configured` response.

## Local development

```bash
bun install --frozen-lockfile
bun run dev
```

Open <http://localhost:3000>. A local `.env` can contain the server secret for
an explicitly authorized live test; it is ignored by Git.

## Production build and Cloud Run contract

```bash
bun run clean
bun run build
PORT=8080 bun run start
curl http://127.0.0.1:8080/api/health
```

The Express server listens on Cloud Run's injected `PORT`, binds to
`0.0.0.0`, serves only the Vite bundle from `dist/public`, and provides SPA
fallback routing. The Node server bundle remains outside the public static
root. The container should start with `bun run start` (or the equivalent
package start command selected by the AI Studio buildpack).

## AI Studio workflow

1. Import this GitHub repository in Google AI Studio.
2. Configure the server secret in AI Studio Secrets.
3. Run the preview and verify `/api/health` plus the travel flows.
4. Deploy to Cloud Run from AI Studio.
5. After deployment, verify the health endpoint and click the Gemini docent
   action once. Do not expose the secret in browser developer tools.
