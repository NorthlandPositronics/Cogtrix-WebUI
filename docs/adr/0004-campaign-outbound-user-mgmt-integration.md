# 0004 — Campaigns, Outbound Messaging, and User Management Integration

**Date**: 2026-03-08
**Status**: Accepted

---

## Context

Three new backend feature groups are being added to the WebUI:

1. **Outbound Messaging** — admin-only action to send an ad-hoc outbound message to a phonebook contact (`POST /api/v1/assistant/outbound`).
2. **Campaigns** — full CRUD plus launch/pause/cancel/complete lifecycle for broadcast campaigns, each containing a nested list of `CampaignTargetOut` (`/api/v1/assistant/campaigns`, 6 endpoints).
3. **User Management** — admin-only CRUD on user accounts (`/api/v1/users`, 4 endpoints).

Additionally, four type/API gaps must be patched before implementation:

- `ConfigOut` is missing `system_prompt` and `guardrails` fields.
- `WorkflowBindingOut` does not exist in the WebUI types.
- `WorkflowDocumentOut` fields diverge from the backend (`doc_id`, `filename`, `size_bytes`, `content_type` vs current `name`, `size`, `uploaded_at`).
- `api.put` does not exist on the `api` helper object.

The assistant page already has 6 tabs. The admin page has two stacked card sections with no tab structure.

---

## Options Considered

### Q1 — Where do campaigns live: new tab on the assistant page, or a separate `/campaigns` page?

**Option A — New tab on `AssistantPage`**
Pros: consistent with how all other assistant-domain features are surfaced; no new route, no nav item; campaigns share the assistant-domain query key namespace already established.
Cons: assistant tab bar grows to 7 tabs, which is at the upper edge of comfortable horizontal tab navigation; the campaign feature set (table, create dialog, detail drawer, status transitions) is significantly larger than the existing tabs.

**Option B — Separate `/campaigns` route**
Pros: unlimited vertical space; clearly scoped route-level data fetching; no effect on existing tabs; sidebar link gives equal status to a first-class feature.
Cons: new route, new sidebar entry, more navigation distance from the assistant status panel that operators typically consult alongside campaign data.

**Option C — New tab on `AssistantPage`, lazy-loaded**
Pros: same domain locality as Option A; lazy import keeps the initial page bundle identical to today; the `SettingsPage` already uses this pattern for all 5 of its tabs via `React.lazy` + `Suspense`. The horizontal overflow is already handled by `overflow-x-auto` on the `TabsList` wrapper.
Cons: same conceptual crowding as Option A, mitigated by lazy loading.

**Decision for Q1**: Option C — add a "Campaigns" tab to `AssistantPage`, lazy-loaded via `React.lazy`. The assistant page already owns the `overflow-x-auto` tab wrapper specifically to handle overflow, the query key hierarchy (`keys.assistant.*`) is the right home for campaign keys, and the pattern is established in `settings.tsx`.

---

### Q2 — Where does outbound messaging live: dialog from contacts tab, or standalone button?

**Option A — Button in the `ContactList` tab toolbar**
Pros: outbound messaging is targeted at a contact; spatial proximity makes the flow obvious; no new tab or route.
Cons: the contacts tab currently has no toolbar — adding one introduces structural change to `ContactList`.

**Option B — Standalone "Send Outbound" button in the `ServiceControlPanel` header area**
Pros: visible regardless of which tab is active; outbound is an operational action analogous to start/stop.
Cons: mixes two different interaction patterns (service control vs. message dispatch) in the same surface.

**Option C — Button within the Contacts tab, but owned by the tab content wrapper in `AssistantPage` rather than inside `ContactList`**
Pros: contact-domain locality without burdening `ContactList` with mutation logic; the button triggers a dialog that is a sibling of `ContactList` in the JSX tree; `ContactList` remains a pure display component.
Cons: slightly unusual pattern where the tab wrapper owns a toolbar.

**Decision for Q2**: Option C. The "Send Outbound" action belongs in the contacts domain. `AssistantPage` adds a `ContactList` tab wrapper that includes a toolbar `<div>` with the trigger button. The actual form lives in `src/pages/assistant/OutboundDialog.tsx`. The mutation hook lives in `src/hooks/useOutboundMutation.ts`. `ContactList` itself is not modified.

---

### Q3 — Where does user management live: new section in `admin.tsx`, or sub-tab?

**Option A — Additional `<Card>` stacked below `LiveLogViewer` in `admin.tsx`**
Pros: simplest change; consistent with the current two-card layout.
Cons: the admin page has no natural scroll depth limit; user management is a distinct operational domain (CRUD table, create/edit/delete dialogs) that will add significant vertical length, pushing the log viewer far down the page.

**Option B — Convert `admin.tsx` to a tab-based layout**
Pros: clean separation; the `SystemInfoCard` stays always-visible above the tabs; tabs follow the exact same pattern as `settings.tsx` and `assistant.tsx`; each panel is independently lazy-loaded.
Cons: structural change to `admin.tsx` that affects `SystemInfoCard` and `LiveLogViewer` placement.

**Decision for Q3**: Option B. The admin page should adopt a tab layout with `SystemInfoCard` remaining above the tab bar (it is a status summary, not a managed resource). The three tabs are: "Live Logs" (existing `LiveLogViewer`), "Users" (new `UserManagementPanel`), and any future admin-only panels. This is a non-breaking visual refactor — existing content moves into tabs rather than being replaced.

---

## Decision

| Feature | Location | Pattern |
|---|---|---|
| Campaigns | New "Campaigns" tab in `AssistantPage` | Lazy `React.lazy` sub-component in `src/pages/assistant/CampaignsPanel.tsx` |
| Outbound messaging | Contacts tab toolbar in `AssistantPage` | Dialog trigger in tab wrapper; form in `src/pages/assistant/OutboundDialog.tsx` |
| User management | New "Users" tab in `AdminPage` | Lazy sub-component in `src/pages/admin/UserManagementPanel.tsx`; `AdminPage` converts to tab layout |
| `api.put` | Add `put` method to `api` object in `src/lib/api/client.ts` | Mirrors existing `patch` method |
| Type fixes | Patch affected interfaces in `src/lib/api/types/` | In-place edits; no file renames |

---

## Consequences

- `AssistantPage` grows from 6 to 7 tabs. The `overflow-x-auto` wrapper already handles this.
- `AdminPage` gains a `Tabs` wrapper. The `SystemInfoCard` stays above the tab bar as a persistent status summary. `LiveLogViewer` moves into a tab.
- No new Zustand stores are required (see State Management section below).
- `src/lib/api/keys.ts` gains two new namespace entries: `keys.assistant.campaigns` and `keys.users`.
- `src/lib/api/types/user.ts` gains `UserOut`. `src/lib/api/types/assistant.ts` gains campaign and outbound types. `src/lib/api/types/config.ts` gains `system_prompt` and `guardrails` fields on `ConfigOut`. `src/lib/api/types/workflow.ts` gains `WorkflowBindingOut` and corrects `WorkflowDocumentOut`.
- Workflow mutations that use `PUT` now have a concrete method to call in `client.ts`.

