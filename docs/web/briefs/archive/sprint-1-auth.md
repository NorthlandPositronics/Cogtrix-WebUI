# Sprint 1 Design Brief — Login / Register Page

**Status**: Ready for mockup
**Target routes**: `/login`, `/register`
**Design system version**: 1.0
**Brief author**: web_designer
**Date**: 2026-03-05

---

## Purpose

Single-purpose unauthenticated entry point. The user either logs in or creates an account. No other information competes for attention. The API contract is in `docs/api/webui-development-guide.md` section 3.1.

---

## Page-Level Layout

```
┌────────────────────────────── viewport (100vw × 100vh) ───────────────────────────────┐
│  bg-zinc-50                                                                            │
│                                                                                        │
│                     ┌──────────── Card (max-w-sm = 384px) ────────────────┐            │
│                     │  bg-white  border border-zinc-200  shadow-sm        │            │
│                     │  rounded-lg  p-6                                    │            │
│                     │                                                     │            │
│                     │  [Wordmark]                                         │            │
│                     │  [Tabs or toggle]                                   │            │
│                     │  [Form fields]                                      │            │
│                     │  [Submit button]                                    │            │
│                     │  [Footer link]                                      │            │
│                     └─────────────────────────────────────────────────────┘            │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Container rules

- Page wrapper: `min-h-screen flex items-center justify-center bg-zinc-50`
- Card: `w-full max-w-sm bg-white border border-zinc-200 rounded-lg shadow-sm p-6`
- The card is vertically centered in the viewport. No additional vertical offset.
- On viewports narrower than `max-w-sm`, the card fills the width with `mx-4` horizontal margin.

---

## Card Internal Layout

All elements stack vertically with the following sequence and spacing:

```
[Wordmark block]          — mb-6
[General error alert]     — mb-4  (conditional, only visible when a general error exists)
[Form]                    — internal space-y-4
[Submit button]           — mt-6  (inside form, full-width)
[Footer link]             — mt-4  text-center
```

---

## Wordmark Block

```
Cogtrix
```

- Element: `<h1>` or `<div>`
- Classes: `text-2xl font-bold text-zinc-900 leading-tight`
- Rationale: `text-2xl` (24px) is the largest heading defined for authenticated pages. The auth page is allowed `text-3xl` (30px bold) per the typography scale if the space benefits from more visual weight — use `text-3xl font-bold` here since there are no competing headings on the page.
- Below the wordmark, add a subtitle: `"Sign in to your account"` (login) or `"Create your account"` (register)
  - Classes: `text-sm text-zinc-500 mt-1`
- No logo mark in Sprint 1 — text only.

---

## Mode Toggle (Login vs Register)

### Implementation approach

The page renders as a single `AuthPage` component that accepts an `isRegister` boolean prop (as per `App.tsx`). The mode toggle is a footer link — not tabs — because the two forms have different field counts and tab UI implies the content is always present. A footer link is lighter.

### Footer link (see Footer section below)

Do not use shadcn/ui `Tabs` for mode switching. Navigation between `/login` and `/register` is a route change via `<Link>`.

---

## General Error Alert

Shown when the API returns a non-field error (network failure, `UNAUTHORIZED`, `500`). Positioned above the form, below the wordmark.

- Use shadcn/ui `Alert` with `variant="destructive"`
- Icon: `AlertCircle` from Lucide, `w-4 h-4`
- Message text: `text-sm`
- Hidden by default. Rendered conditionally when a general error string is present.
- Classes on the alert container: `mb-4`

---

## Login Form

### Fields

```
┌─ Field group (space-y-4) ─────────────────────────────────────────────┐
│                                                                        │
│  Label: "Username"       text-sm font-medium text-zinc-700            │
│  Input: type="text"      id="username"  autoComplete="username"       │
│  Error: "..."            text-sm text-red-600  (conditional)          │
│                                                                        │
│  Label: "Password"       text-sm font-medium text-zinc-700            │
│  Input: type="password"  id="password"  autoComplete="current-password│
│  Error: "..."            text-sm text-red-600  (conditional)          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Field group pattern

Each field is a `<div className="space-y-1.5">` wrapping Label + Input + optional error paragraph. This matches the design system form pattern exactly.

### Input states

| State | Visual |
|---|---|
| Default | `border-zinc-200` (shadcn/ui default) |
| Focus | `ring-2 ring-offset-2 ring-zinc-400` |
| Error | `border-red-500` on the Input, error message paragraph below |
| Disabled | `opacity-50 cursor-not-allowed` (applied while submitting) |

### Field-level error display

- Element: `<p className="text-sm text-red-600">`
- Content: message from the API `details` field on 422, or client-side validation message
- Rendered directly below the affected Input, inside the field group div
- Hidden when no error for that field

---

## Register Form

### Fields

```
┌─ Field group (space-y-4) ─────────────────────────────────────────────┐
│                                                                        │
│  Label: "Username"       text-sm font-medium text-zinc-700            │
│  Input: type="text"      id="username"  autoComplete="username"       │
│  Error: "..."            text-sm text-red-600  (conditional)          │
│                                                                        │
│  Label: "Email"          text-sm font-medium text-zinc-700            │
│  Input: type="email"     id="email"     autoComplete="email"          │
│  Error: "..."            text-sm text-red-600  (conditional)          │
│                                                                        │
│  Label: "Password"       text-sm font-medium text-zinc-700            │
│  Input: type="password"  id="password"  autoComplete="new-password"   │
│  Error: "..."            text-sm text-red-600  (conditional)          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

Same field group pattern and input states as Login Form above.

### First-user note (informational, not visible in UI)

The first registered user automatically receives admin role. No visual indication is needed — this is a backend concern only.

---

## Submit Button

- shadcn/ui `Button`
- Variant: `default` but with violet override via `className`
- Full-width: `w-full`
- Size: `lg` (this is the only CTA on the page — the larger size provides appropriate visual weight)
- Classes: `w-full bg-violet-600 hover:bg-violet-700 text-white`
- Label: `"Sign in"` (login) / `"Create account"` (register)
- Position: last element inside the `<form>`, after all field groups. `mt-6` gap from the last field group.

### Loading state

When the form is submitting:
- Button: replace label text with a `size-4` spinner (`animate-spin`, Lucide `Loader2` icon), apply `disabled` attribute
- All Input elements: `disabled` attribute applied
- Visual: button background stays `bg-violet-600`, spinner inherits `text-white`
- Do not show a skeleton — the form fields remain visible; only the submit button changes state

---

## Footer Link

Centered below the submit button. `mt-4 text-center text-sm text-zinc-500`

| Mode | Text |
|---|---|
| Login | `Don't have an account?` + space + `Register` (link) |
| Register | `Already have an account?` + space + `Sign in` (link) |

- The link text (`Register` / `Sign in`) uses shadcn/ui `Button` with `variant="link"` and `className="p-0 h-auto text-sm text-violet-600 hover:text-violet-700"`
- Alternatively: a plain `<Link>` with `className="text-violet-600 hover:text-violet-700 underline-offset-4 hover:underline"`
- The footer link is a route navigation (`<Link to="/register">` or `<Link to="/login">`) — not a state toggle.

---

## Component Boundaries

| Component | File path | Props | Responsibility |
|---|---|---|---|
| `AuthPage` | `src/pages/login.tsx` | `isRegister?: boolean` | Layout wrapper: centers card, renders wordmark, selects and renders LoginForm or RegisterForm |
| `LoginForm` | `src/pages/login.tsx` (internal) or `src/components/LoginForm.tsx` | none | Form state, submission, field errors, loading state |
| `RegisterForm` | `src/pages/login.tsx` (internal) or `src/components/RegisterForm.tsx` | none | Form state, submission, field errors, loading state |

Since both forms are only used on this one page, co-locating them in `src/pages/login.tsx` as named exports is acceptable. Extract only if reuse is needed.

---

## API Integration

### Login

```
POST /api/v1/auth/login
Body: { username: string, password: string }
Success (200): TokenPair → call setTokens(), navigate to /sessions
Error (401): show general error "Invalid username or password"
Error (422): map details fields to field-level errors
```

### Register

```
POST /api/v1/auth/register
Body: { username: string, email: string, password: string }
Success (201): TokenPair → call setTokens(), navigate to /sessions
Error (409): show general error "Username or email is already taken"
Error (422): map details fields to field-level errors
```

### Error mapping for 422

The `details` field on a 422 response is a `Record<string, string[]>`. Map each key to the corresponding field's error display. Keys match the request body field names (`username`, `email`, `password`). If a key does not match a known field, show it in the general error alert.

---

## shadcn/ui Components Required

Install before implementation begins:

```bash
pnpm dlx shadcn@latest add card input label button alert
```

---

## Mockup Request for graphic_designer

Produce two SVG mockups in `docs/web/mockups/`:

1. `auth-login.svg` — Login state: card with wordmark, subtitle, username field, password field, "Sign in" button, footer register link. No errors visible.
2. `auth-register.svg` — Register state: card with wordmark, subtitle, username field, email field, password field, "Create account" button, footer sign in link. Show a field error on the email field ("This email is already in use.") to demonstrate the error treatment.

**Canvas size**: 1280 × 800px, `bg-zinc-50` background.

**Card position**: horizontally and vertically centered in canvas.

**Typography** (for SVG approximation):
- Wordmark: 30px, weight 700, `#18181b`
- Subtitle: 14px, weight 400, `#71717a`
- Labels: 14px, weight 500, `#3f3f46`
- Input placeholder text: 14px, weight 400, `#a1a1aa`
- Button label: 14px, weight 500, `#ffffff`
- Footer muted text: 14px, weight 400, `#71717a`
- Footer link: 14px, weight 400, `#7c3aed` (violet-700)
- Field error: 14px, weight 400, `#dc2626`

**Colors**:
- Page background: `#fafafa` (zinc-50)
- Card background: `#ffffff`
- Card border: `#e4e4e7` (zinc-200)
- Input border default: `#e4e4e7`
- Input border error: `#ef4444` (red-500)
- Submit button: `#7c3aed` (violet-600)
- Submit button hover (show as second state or annotation): `#6d28d9` (violet-700)

**Card dimensions**: 384px wide, height determined by content. Approximate: 420px (login), 480px (register with error).

**Annotation required on mockup**: label each section (wordmark, subtitle, general error, field group, submit, footer) with a callout so web_coder can identify zones without reading this brief.
