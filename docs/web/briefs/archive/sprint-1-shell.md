# Sprint 1 Design Brief — App Shell (Sidebar + Header)

**Status**: Ready for mockup
**Affected routes**: all authenticated routes (`/sessions`, `/sessions/:id`, `/settings`, `/admin`, `/assistant`, `/documents`)
**Design system version**: 1.0
**Brief author**: web_designer
**Date**: 2026-03-05

---

## Purpose

The App Shell is the persistent layout wrapper for every authenticated page. It provides navigation context and user identity without competing with the main content. On desktop it is always visible. On mobile it is hidden until the user explicitly opens it.

---

## Desktop Layout (lg and above, >= 1024px)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Sidebar (220px fixed, full height)  │  Main content area (flex-1)           │
│  bg-zinc-50                          │  bg-white                             │
│  border-r border-zinc-200            │  overflow-y-auto                      │
│                                      │  px-6 py-6                            │
│  ┌── Wordmark ───────────────────┐   │                                       │
│  │  px-4 py-4                    │   │  ┌── Page content ──────────────────┐ │
│  │  "Cogtrix"  text-lg semibold  │   │  │  max-w-5xl mx-auto               │ │
│  └───────────────────────────────┘   │  │                                  │ │
│                                      │  │  (route component renders here)  │ │
│  ── Separator ─────────────────────  │  │                                  │ │
│                                      │  └──────────────────────────────────┘ │
│  ┌── Nav section ────────────────┐   │                                       │
│  │  px-2  space-y-1              │   │                                       │
│  │  [Sessions link]              │   │                                       │
│  │  [Documents link]             │   │                                       │
│  │  [Assistant link]             │   │                                       │
│  │  [Settings link]              │   │                                       │
│  │  [Admin link — admin only]    │   │                                       │
│  └───────────────────────────────┘   │                                       │
│                                      │                                       │
│  (flex-1 spacer)                     │                                       │
│                                      │                                       │
│  ── Separator ─────────────────────  │                                       │
│                                      │                                       │
│  ┌── User section ───────────────┐   │                                       │
│  │  px-4 py-3                    │   │                                       │
│  │  [Avatar + username + role]   │   │                                       │
│  │  [Sign out button]            │   │                                       │
│  └───────────────────────────────┘   │                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Shell container

- Outer: `flex h-screen overflow-hidden`
- Sidebar: `hidden lg:flex w-[220px] flex-shrink-0 flex-col bg-zinc-50 border-r border-zinc-200`
- Main: `flex-1 overflow-y-auto bg-white`

---

## Mobile Layout (below lg, < 1024px)

```
┌──────────────────────────────────────────┐
│  Mobile top bar                          │
│  h-14  border-b border-zinc-200  bg-white│
│                                          │
│  [Hamburger btn]  [Cogtrix]  [Avatar]    │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│  Main content area                       │
│  px-4 py-4  overflow-y-auto              │
│  (fills remaining viewport height)       │
└──────────────────────────────────────────┘
```

The sidebar renders as a shadcn/ui `Sheet` sliding in from the left when the hamburger is tapped. The `Sheet` contains identical content to the desktop sidebar. The `Sheet` closes when a nav link is clicked (via `onOpenChange` or a `useEffect` on location change).

### Top bar

- Container: `flex lg:hidden items-center justify-between px-4 h-14 border-b border-zinc-200 bg-white`
- Left: hamburger `Button` with `variant="ghost"`, size `sm`, `aria-label="Open navigation"`, Lucide `Menu` icon `w-5 h-5`
- Center: `"Cogtrix"` wordmark, `text-base font-semibold text-zinc-900`
- Right: user `Avatar` (initial letter fallback), size 32px — no action on click in Sprint 1

---

## Sidebar Wordmark

- Container: `px-4 py-4`
- Text: `"Cogtrix"` — `text-lg font-semibold text-zinc-900`
- No additional subtitle or tagline.
- No logo mark in Sprint 1.

---

## Navigation Links

### Link order

1. Sessions — `MessageSquare` icon — `/sessions`
2. Documents — `FileText` icon — `/documents`
3. Assistant — `Bot` icon — `/assistant`
4. Settings — `Settings` icon — `/settings`
5. Admin — `Shield` icon — `/admin` — **visible only when `isAdmin === true`**

### Link anatomy

```
┌─ nav item (w-full) ──────────────────────────────────────────┐
│  px-3 py-2  rounded-md  flex items-center gap-3              │
│                                                              │
│  [Icon w-4 h-4]   [Label text-sm font-medium]               │
└──────────────────────────────────────────────────────────────┘
```

### State styles

| State | Background | Text | Left border |
|---|---|---|---|
| Active (current route) | `bg-violet-50` | `text-violet-600` | `border-l-2 border-violet-600` (applied to the container, shifts padding to `pl-[10px]` to compensate for the 2px border) |
| Inactive default | none | `text-zinc-600` | none |
| Inactive hover | `bg-zinc-100` | `text-zinc-900` | none |
| Disabled (no access) | n/a | n/a | n/a — do not render links the user cannot access |

Icons on active links: `text-violet-600` (inherited from container).
Icons on inactive links: `text-zinc-400`.

### Nav container

- Wrapper: `px-2 space-y-1 flex-1`
- Each link: use React Router `NavLink`. Apply active class logic via `NavLink`'s `className` callback.

### Transition

`transition-colors duration-150` on the nav item container.

---

## User Section (Sidebar Bottom)

Positioned at the bottom of the sidebar using a `mt-auto` flex spacer above it.

```
┌─ user section ────────────────────────────────────────────────┐
│  px-4 py-3                                                    │
│  ── Separator above ──────────────────────────────────────────│
│                                                               │
│  ┌── identity row ──────────────────────────────────────────┐ │
│  │  flex items-center gap-3                                 │ │
│  │                                                          │ │
│  │  [Avatar 32px]  [username text-sm font-medium]           │ │
│  │                 [role badge below username]               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌── sign out button ───────────────────────────────────────┐ │
│  │  mt-2  w-full                                            │ │
│  │  variant="ghost"  size="sm"                              │ │
│  │  LogOut icon w-4 h-4  "Sign out"                        │ │
│  │  text-zinc-500 hover:text-zinc-900                       │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### Avatar

- shadcn/ui `Avatar` component (`AvatarImage` + `AvatarFallback`)
- Size: `w-8 h-8` (32px)
- Fallback: first letter of username, uppercase, `text-xs font-semibold`
- Background: `bg-violet-100 text-violet-700` (identifies the user with the application accent)
- No image source in Sprint 1 — fallback always renders.

### Username

- `text-sm font-medium text-zinc-900`
- Truncated with `truncate max-w-[120px]` to prevent overflow in a 220px sidebar.

### Role badge

- shadcn/ui `Badge` with `variant="outline"` for regular users
- Admin users: `className="border-violet-200 bg-violet-50 text-violet-700"` (no variant override, apply via className)
- Size classes: `text-xs px-1.5 py-0 rounded-full`
- Text: `"admin"` or `"user"` — lowercase
- Positioned below the username in the identity column

### Sign out button

- `Button` `variant="ghost"` `size="sm"` `className="w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"`
- Lucide `LogOut` icon: `w-4 h-4 mr-2`
- Label: `"Sign out"`
- Action: calls `logout()` from auth store, which calls `POST /api/v1/auth/logout` and redirects to `/login`

---

## PageHeader Component (Optional, Per-Page)

Not part of the shell itself — rendered inside the main content area by individual pages that need a title + action area.

```
┌─ PageHeader ────────────────────────────────────────────────────┐
│  flex items-center justify-between  mb-6                        │
│                                                                 │
│  [Page title  text-2xl font-semibold text-zinc-900]             │
│                                    [Action area (slot)]         │
└─────────────────────────────────────────────────────────────────┘
```

- Component: `PageHeader`
- Props: `title: string`, `children?: ReactNode` (action area, rendered on the right)
- The `children` slot is for page-level actions like a "New session" button. It is optional.
- No background, no border — it sits directly inside the `max-w-5xl` content container.

---

## Component Boundaries

| Component | File path | Props | Responsibility |
|---|---|---|---|
| `AppShell` | `src/components/AppShell.tsx` | `children: ReactNode` | Outer layout: sidebar (desktop) + top bar (mobile) + main area. Renders `children` inside the main area. |
| `Sidebar` | `src/components/Sidebar.tsx` | `onNavigate?: () => void` | Nav links, wordmark, user section. The `onNavigate` callback is called after a link click — used by the mobile Sheet to close itself. |
| `PageHeader` | `src/components/PageHeader.tsx` | `title: string`, `children?: ReactNode` | Per-page title row with optional right-side action slot. |

`AppShell` wraps every authenticated route. The route components (`SessionsPage`, `SettingsPage`, etc.) are rendered as `children` of `AppShell`. `AppShell` owns the `Sheet` open/close state for mobile.

`Sidebar` is stateless — it reads auth state from `useAuthStore` to determine the current user and whether to render the Admin link.

---

## State Ownership

| State | Owner | Notes |
|---|---|---|
| `isMobileMenuOpen: boolean` | `AppShell` | Drives the `Sheet` open/close state. Reset to `false` on route change. |
| `user: UserOut` | `useAuthStore` | Read by `Sidebar` to display username, role, and Admin link visibility. |
| `isAdmin: boolean` | `useAuthStore` | Derived from `user.role`. Read by `Sidebar` for Admin link guard. |

---

## Active Route Detection

Use React Router `NavLink` for all nav items. The `className` callback receives `{ isActive }` — apply the active styles when `isActive` is true.

```tsx
// Example pattern for web_coder — exact class application:
<NavLink
  to="/sessions"
  className={({ isActive }) =>
    cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
      isActive
        ? "bg-violet-50 text-violet-600 border-l-2 border-violet-600 pl-[10px]"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    )
  }
>
```

The `pl-[10px]` on active links compensates for the 2px left border so the icon does not jump horizontally when switching active states.

---

## Responsive Behavior Summary

| Breakpoint | Sidebar | Top bar | Main padding |
|---|---|---|---|
| `< lg` (< 1024px) | Hidden; opens as Sheet on hamburger tap | Visible | `px-4 py-4` |
| `lg+` (>= 1024px) | Fixed, always visible, `w-[220px]` | Hidden | `px-6 py-6` |

---

## shadcn/ui Components Required

Install before implementation begins:

```bash
pnpm dlx shadcn@latest add button badge separator sheet avatar
```

---

## Mockup Request for graphic_designer

Produce three SVG mockups in `docs/web/mockups/`:

### 1. `shell-desktop.svg` — Desktop app shell

Canvas: 1440 × 900px.

Show the full shell with a placeholder main content area. The Sessions page is the active route (Sessions nav link is active). The logged-in user is a regular user (username: `alice`, role: `user`).

Sidebar contents from top to bottom:
- Wordmark: "Cogtrix"
- Separator
- Nav links: Sessions (active, violet-50 bg, violet-600 text, left border), Documents, Assistant, Settings (no Admin — regular user)
- Spacer
- Separator
- User section: Avatar with fallback "A" in violet-100/violet-700, username "alice", badge "user" (outline), Sign out button

Main content area: white, `px-6 py-6`. Show a `PageHeader` with title "Sessions" and a "New session" button on the right (Button variant default). Below that, show a 2-column grid of placeholder `SessionCard` skeletons (3 cards, skeleton shimmer indicated with zinc-100 fill).

### 2. `shell-admin-desktop.svg` — Desktop shell for admin user

Canvas: 1440 × 900px.

Same as above but user is `admin_user` with role `admin`. Admin nav link is visible (Shield icon). Role badge on the user section shows `"admin"` with violet-50 background and violet-700 text. Active route is Admin.

### 3. `shell-mobile.svg` — Mobile layout with Sheet open

Canvas: 390 × 844px (iPhone 14 viewport approximation).

Show two states side by side if canvas allows, or as two separate frames:

**Frame A — Top bar (sheet closed):**
- Mobile top bar: hamburger (Menu icon), "Cogtrix" wordmark, Avatar
- Main area: placeholder content (skeleton cards)

**Frame B — Sheet open:**
- Left side: Sheet overlay sliding in from the left, containing identical Sidebar content to the desktop mockup (Sessions active, regular user "alice")
- Right side: main content dimmed behind backdrop (`bg-black/40`)
- Sheet width: approximately 260px (shadcn/ui Sheet default for mobile)

**Typography** (for SVG approximation):
- Wordmark: 18px, weight 600, `#18181b`
- Mobile top bar wordmark: 16px, weight 600, `#18181b`
- Nav item label: 14px, weight 500
  - Active: `#7c3aed` (violet-600)
  - Inactive: `#52525b` (zinc-600)
- Username: 14px, weight 500, `#18181b`
- Role badge: 12px, weight 500
- Sign out: 14px, weight 400, `#71717a`
- PageHeader title: 24px, weight 600, `#18181b`

**Colors**:
- Sidebar background: `#fafafa` (zinc-50)
- Sidebar border (right): `#e4e4e7` (zinc-200)
- Active nav background: `#f5f3ff` (violet-50)
- Active nav left border: `#7c3aed` (violet-600)
- Inactive nav hover (show as annotation): `#f4f4f5` (zinc-100)
- Avatar fallback background: `#ede9fe` (violet-100)
- Avatar fallback text: `#6d28d9` (violet-700)
- Admin badge background: `#f5f3ff` (violet-50)
- Admin badge text: `#6d28d9` (violet-700)
- User badge: outline, `#e4e4e7` border, `#52525b` text

**Annotation required on mockup**: label each zone (wordmark, nav section, active link anatomy, user section, PageHeader, main content area) with callouts for web_coder.
