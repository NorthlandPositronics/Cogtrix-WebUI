# MCP Add Server Dialog — UX Brief

## Context

`McpServerList.tsx` currently shows MCP servers in a table with a per-row "Restart" button (admin only). There is no UI for adding or deleting servers. This brief covers both the Add Server dialog and the per-row Delete button.

## Add Server Dialog

### Trigger

An "Add Server" button appears above the table (top-right of the section header area), visible to admin users only. It uses `<Button variant="outline" size="sm">` consistent with other section-level action buttons in the settings page.

### Dialog structure

Standard `Dialog` with `DialogContent max-w-lg`, `DialogHeader` (title: "Add MCP Server"), `DialogDescription` (one-liner: "Connect a new Model Context Protocol server."), a form body, and `DialogFooter`.

### Field order and layout

All fields are stacked vertically with `space-y-4` in the form body.

1. **Name** — `<Input>` with `Label`. Required. Placeholder: `my-server`. Helper text below: "Lowercase letters, numbers, and hyphens only." Validation: non-empty, matches `/^[a-z0-9-]+$/`.

2. **Transport** — `<Select>` with `Label`. Options: `stdio` (label: "stdio — local process") and `sse` (label: "sse — HTTP stream"). Default: `stdio`.

3. **Command** — `<Input>` with `Label`. Visible only when transport = `stdio`. Required when visible. Placeholder: `npx my-mcp-server`.

4. **URL** — `<Input>` with `Label`. Visible only when transport = `sse`. Required when visible. Placeholder: `http://localhost:3000/sse`. Type: `url`.

5. **Args** — `<Input>` with `Label`. Visible only when transport = `stdio`. Optional. Placeholder: `--flag value another-arg`. Helper text: "Space-separated arguments."

6. **Requires confirmation** — `<Checkbox>` with inline `Label` to the right. Checked by default. Helper text below: "Prompt before executing tool calls from this server."

### Validation and submit state

- Submit button is disabled when: name is empty, name fails slug pattern, or the required transport-specific field (command/url) is empty.
- On submit: spinner replaces button text, all fields disabled.
- On success: dialog closes, `keys.mcpServers()` invalidated, `toast.success("MCP server added")`.
- On error: `toast.error(message)`.

### Button labels

Footer: `<Button variant="outline">Cancel</Button>` | `<Button>Add Server</Button>` (with `<Loader2>` when pending).

## Delete Server

### Trigger

A delete icon button (`<Trash2>`) added to the actions cell of each server row, after the restart button, visible to admin users only.

### Confirmation

Reuses `<ConfirmDialog>` (from `@/components/ConfirmDialog`) with:
- `title`: "Remove MCP server"
- `description`: `Remove "{name}" from the server list? This cannot be undone.`
- `confirmLabel`: "Remove"
- Destructive variant (red confirm button — ConfirmDialog already handles this via its standard destructive confirm button style)

On confirm: `DELETE /api/v1/mcp/servers/{name}`, invalidate `keys.mcpServers()`, `toast.success("MCP server removed")`.

## Extraction

The add dialog is extracted to `src/pages/settings/McpAddServerDialog.tsx` and imported into `McpServerList.tsx`. The delete confirmation stays inline in `McpServerList.tsx` using `ConfirmDialog`.
