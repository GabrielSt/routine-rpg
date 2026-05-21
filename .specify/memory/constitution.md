<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.0
Added sections:
  - Project Overview (new section)
Modified principles: none
Removed sections: none
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — no changes needed
  ✅ .specify/templates/spec-template.md — no changes needed
  ✅ .specify/templates/tasks-template.md — no changes needed
Deferred TODOs: none
-->

# Routine RPG Constitution

## Project Overview

**Routine RPG** is a personal habit-tracking app gamified as a cyberpunk RPG,
built for single-user daily use on mobile-first web. The core loop is:

1. **Daily habits** — the user logs boolean (done/not done) or quantity-based
   habits each day across four stats: `strength`, `health`, `discipline`, `mind`.
2. **XP & levelling** — completing habits earns XP; reaching an XP threshold
   levels the character up, awarding Creds and unlocking the next rank.
3. **Ranks** — progression ladder from `Flatline` → `Street Kid` → `Netrunner`
   → `Corpo` → `Legend`, each reflecting increasing mastery.
4. **Creds shop** — earned Creds are spent on real-world rewards (e.g. a meal
   out, a new game) defined by the user in the Shop.

**Audience**: Single user (the developer themselves). No multi-tenancy, no
social features, no accounts required for core use.

**Platform**: Mobile-first progressive web app (PWA-ready). Desktop usable
but not the primary target.

**Persistence**: localStorage is the primary store; Supabase provides async
cloud backup and is entirely optional for functionality.

**Aesthetic**: Cyberpunk / neon-noir UI — dark backgrounds, neon accent colours,
monospace typography, cyberpunk terminology throughout.

## Core Principles

### I. Offline-First (NON-NEGOTIABLE)

localStorage is the canonical source of truth. The app MUST be fully functional
without a network connection. Supabase sync is fire-and-forget: it MUST never
throw, never block UI, and MUST degrade gracefully to `console.warn` on error.
All features added in the future MUST continue to degrade gracefully offline.
No feature may make online connectivity a prerequisite for core functionality.

### II. Single Global Store

All application state MUST be managed exclusively through `GameContext`
(React `useReducer`). External state libraries (Redux, Zustand, Jotai, MobX,
etc.) MUST NOT be introduced. Components MUST consume state only via the
`useGame()` hook. All dispatches MUST originate inside `GameContext` no
direct `dispatch` calls from outside the store.

### III. Strict Layer Boundaries

Three layer rules are absolute and MUST NOT be violated:

- All `localStorage` access lives exclusively in `src/lib/storage.ts`.
- All Supabase calls live exclusively in `src/lib/db.ts`.
- All state mutations (dispatches) live exclusively in `src/store/GameContext.tsx`.
  Any code outside these files that directly calls `localStorage`, Supabase
  client methods, or dispatches actions MUST be treated as a blocking defect.

### IV. Type Safety (NON-NEGOTIABLE)

No `any` types are permitted anywhere in the codebase. All component props
MUST use named interfaces (never inline types). Domain entities (`Character`,
`Habit`, `AppState`, `DailyLog`, `ShopItem`, etc.) MUST be used as the type
vocabulary `unknown` is the only acceptable escape hatch. All files MUST
use `.tsx` or `.ts` extensions; `.js` or `.jsx` are forbidden.

### V. Gamification Integrity

Domain rules are invariants, not suggestions. They MUST be implemented exactly:

- A daily is complete when 70% of habits are done.
- XP per level: `floor(100  1.4^(level-1))`.
- Creds per level-up: `floor(50  1.2^(level-1))`.
- Habit IDs are stable text slugs (e.g. `"gym"`, `"water"`), never UUIDs.
- Onboarding: 3 steps (name theme habits); MUST require 7 habits.
- Themes: `balanced`, `athlete`, `hacker`, `monk` each ships exactly 7
  default habits.
- Stats: `strength`, `health`, `discipline`, `mind`; each habit maps to
  exactly one stat.
  Any change to these values constitutes a MAJOR constitution amendment.

## Domain Validation Constraints

All data written to state or storage MUST satisfy these invariants:

- `habit.xp > 0`; `habit.creds  0`
- A habit with `kind === "quantity"` MUST define `targetValue`
- `character.level  1`; `character.xp  0`; `character.creds  0`
- `AppState.onboardingDone === true` implies `habits.length  7`
- Shop items MUST have `cost > 0`
- Daily log values: `true` for boolean habits; `number  0` for quantity habits
- `userId` format: `"usr_"` + 16 hex chars, generated once via
  `crypto.randomUUID()` never regenerated after onboarding

Reducer cases MUST return new state objects; mutation of existing state is
a blocking defect.

## Development Discipline

**File & naming conventions**:

- PascalCase for all component and page files.
- camelCase for all lib and utility files.
- `.tsx` / `.ts` extensions only.

**Routing**: New pages MUST be registered in `App.tsx` before merging.

**Supabase functions**: MUST never throw always return `null` or `false` on
error with `console.warn`. Realtime and Auth MUST NOT be used until explicitly
planned.

**Dev-only artifacts**: `DevCredInjector` and `SupabaseDiag` MUST remain in
code during development. Mark with `// TODO: remove before production`.

**Pending (do not implement unless explicitly requested)**:

- Google OAuth (RLS policies are ready)
- Real streak calculation from `daily_summary`
- Cooldown enforcement for `every3days`/`weekly` habits
- Automatic achievement unlocking
- Removal of `DevCredInjector` and `SupabaseDiag` before production deploy

## Governance

This constitution supersedes all other development guidelines for Routine RPG.
Amendments require:

1. A clear rationale documenting which principle is being changed and why.
2. A version bump following semantic versioning:
   - **MAJOR**: Backward-incompatible principle removal or redefinition
     (e.g., changing domain rule constants, removing a layer boundary).
   - **MINOR**: New principle or section added, or material guidance expansion.
   - **PATCH**: Clarifications, wording fixes, typo corrections.
3. Propagation of changes to all dependent templates in `.specify/templates/`.
4. A Sync Impact Report embedded as an HTML comment at the top of this file.

All implementation plans and specifications MUST include a Constitution Check
gate that verifies adherence to Principles IV before work begins.

**Version**: 1.1.0 | **Ratified**: 2026-05-21 | **Last Amended**: 2026-05-21
