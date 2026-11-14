<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Planazo architecture
- Keep app-internal server logic in TanStack server functions; this project deploys to Workers, not Supabase Edge Functions.
- Keep map imports in a lazy-loaded component behind ClientOnly; Leaflet touches browser APIs at import time.
- Select itinerary places from the public catalog, then ask the AI only for explanations; catalog prices and constraints remain authoritative.
- Use OpenStreetMap France HOT raster tiles with Leaflet; the requested CARTO Voyager endpoint returns API-key-required images instead of maps.
- Keep anonymous drafts in sessionStorage only; signed-in saved plans and public share links live in Cloud with owner policies and slug-only public read RPC.

- Use the FOSSGIS routed-foot OSRM service for walking geometry and leg durations; the public project-osrm server runs a driving profile.
- Persist preference snapshots and scheduled durations with saved itineraries so reopening does not replace family settings with defaults.
- Store sourced hours and seasonal periods in places.opening_hours.published; use the shared PlaceHours view everywhere and never label legacy demo hours as verified, because source provenance must survive saved and shared plans.
- Weather comes from Open-Meteo in the browser (keyless) and only suggests adjustments; it never blocks plan generation.
- Keep one auth-state listener in PlanazoProvider, clear private UI/cache on identity changes, and use public account/recovery pages so email and OAuth callbacks can hydrate sessions.
- Restrict profile edits to display fields through column grants; never expose plan-tier writes, and validate ownership of linked preferences with restrictive RLS.
- Store administrator roles separately in user_roles, synchronize only verified designated accounts, and validate has_role with the caller's authenticated client inside every admin server handler; profile edits must never grant privileges.
