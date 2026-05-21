# ROUTINE RPG

> *Your habits are your stats. Your discipline is your build. Your life is the game.*

A personal habit tracker disguised as a cyberpunk RPG. Every glass of water, every workout, every hour of sleep feeds your character. Skip the grind and your stats decay. Show up every day and you become a Legend.

No subscriptions. No ads. No gamification dark patterns. Just you, your habits, and a very honest XP counter.

---

## The Loop

```
Complete habits → earn XP → level up → earn Creds → buy real rewards
```

You define what counts. You define what the rewards are. The system just keeps score — ruthlessly.

- **Boolean habits** — did you do it or not? (gym, sleep 7h+, journaling)
- **Quantity habits** — track progress toward a target (8 glasses of water, 60 min deep work, 20 min reading)
- **Daily is ≥70%** — you don't need to be perfect. You need to be consistent. A day counts when 70% or more of your habits are done.
- **Streak** — consecutive days with a completed daily. Miss one and it resets.

---

## The RPG System

### Stats

Every habit maps to one of four stats. Completing habits grows them.

| Stat | Represents | Example habits |
|---|---|---|
| `strength` | Physical capacity | Gym, cardio, protein |
| `health` | Body maintenance | Water, sleep, supplements |
| `discipline` | Consistency and order | Wake up early, laundry, no phone |
| `mind` | Mental output | Reading, deep work, meditation |

### XP & Levelling

XP required to level up scales progressively — early levels are fast, later levels demand sustained discipline.

```
XP to next level = floor(100 × 1.4^(level - 1))
```

| Level | XP needed |
|---|---|
| 1 | 100 |
| 5 | 538 |
| 10 | 2 893 |
| 20 | 83 667 |

### Creds

Earned on every level-up. Spent in the shop on real-world rewards you define.

```
Creds per level-up = floor(50 × 1.2^(level - 1))
```

### Ranks

| Rank | Levels | Color |
|---|---|---|
| Flatline | 1–4 | Gray |
| Street Rat | 5–9 | Green |
| Runner | 10–14 | Cyan |
| Merc | 15–19 | Yellow |
| Edgerunner | 20–29 | Orange |
| Netrunner | 30–49 | Magenta |
| Legend | 50–99 | White |

### Onboarding Themes

Pick a theme at start — it pre-loads 7 habits tuned to that lifestyle. You can customize before finishing.

| Theme | Focus |
|---|---|
| **Balanced** | Health, discipline, mind — solid all-rounder |
| **Athlete** | Training, nutrition, recovery, hydration |
| **Hacker** | Deep work, learning, digital hygiene |
| **Monk** | Meditation, journaling, slow living |

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│                                                         │
│  ┌──────────────┐    dispatch    ┌──────────────────┐   │
│  │   Pages &    │ ─────────────► │  GameContext     │   │
│  │  Components  │ ◄───────────── │  (useReducer)    │   │
│  └──────────────┘     state      └────────┬─────────┘   │
│                                           │             │
│                              save (sync)  │  pull (async, boot)
│                                           ▼             │
│                               ┌───────────────────┐     │
│                               │   localStorage    │     │
│                               │  (source of truth)│     │
│                               └───────────────────┘     │
│                                           │             │
│                           fire-and-forget │  merge on boot
│                                           ▼             │
└─────────────────────────────────────────────────────────┘
                                 ┌───────────────────┐
                                 │     Supabase      │
                                 │  (async mirror)   │
                                 └───────────────────┘
```

**Key principle:** the app works fully offline. Supabase is a background mirror — errors are silent, writes are fire-and-forget, and on boot the remote state is merged only if it's richer than local.

### Layer Responsibilities

| Layer | Location | Rules |
|---|---|---|
| **Domain logic** | `src/lib/rpg.ts` | Pure functions — XP math, rank lookup, stat mapping. No React, no side effects. |
| **State types & serialization** | `src/lib/storage.ts` | All `localStorage` access lives here. Defines `AppState`, `Habit`, `Character`. |
| **Database access** | `src/lib/db.ts` | All Supabase calls live here. Never throws — returns `null`/`false` on error. |
| **Supabase client** | `src/lib/supabase.ts` | Single client instance. |
| **Global store** | `src/store/GameContext.tsx` | `useReducer` + `Context`. The only place that dispatches state changes and triggers sync. |
| **Pages** | `src/pages/` | One file per route. Consume state via `useGame()` only. |
| **Components** | `src/components/` | Reusable UI. Never touch localStorage or Supabase directly. |

### Database Schema (Supabase)

11 tables — RLS enabled, policies open until Google OAuth is added.

```
users               — user identity (local UUID, future: auth.uid)
character           — level, XP, Creds, stats, streak, last_active
habits              — user's habit list (id is a text slug, not UUID)
daily_logs          — per-habit completion log per date
daily_summary       — aggregated daily completion (for streak calculation)
water_logs          — water intake per date
weight_logs         — body weight history
shop_items          — available reward items
purchases           — purchase history with receipt data
achievements        — achievement definitions
user_achievements   — which achievements each user has unlocked
```

`habits.id` is a stable text slug (`"gym"`, `"water"`, `"deepwork"`) — not a UUID. This keeps localStorage and Supabase in sync without ID translation.

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 19 |
| **Language** | TypeScript 6 |
| **Build** | Vite 8 |
| **Styling** | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| **Routing** | react-router-dom 7 |
| **Backend** | Supabase (REST only — no Realtime, no Auth yet) |
| **Icons** | lucide-react |
| **Receipt export** | html2canvas |
| **Fonts** | Orbitron · Rajdhani · Share Tech Mono (Google Fonts) |

---

## Project Structure

```
routine-rpg/
├── src/
│   ├── lib/
│   │   ├── rpg.ts          # Pure domain logic: XP, levels, ranks, stats
│   │   ├── storage.ts      # AppState types, themes, habits, localStorage I/O
│   │   ├── db.ts           # All Supabase functions (never throws)
│   │   └── supabase.ts     # Supabase client instance
│   ├── store/
│   │   └── GameContext.tsx # Global reducer, all actions, Supabase sync
│   ├── components/
│   │   ├── layout/
│   │   │   └── NavBar.tsx  # Sidebar (desktop) + BottomNav (mobile)
│   │   ├── CharacterPanel.tsx
│   │   ├── DailyQuests.tsx # Boolean + quantity habits, 70% progress bar
│   │   ├── LevelUpModal.tsx
│   │   ├── WaterTracker.tsx
│   │   └── WeightTracker.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Quests.tsx
│   │   ├── Stats.tsx
│   │   ├── Shop.tsx        # Reward shop + thermal receipt history
│   │   ├── Achievements.tsx
│   │   └── Onboarding.tsx  # 3-step: name → theme → habit customization
│   ├── App.tsx             # AppShell, route guard, router
│   ├── main.tsx
│   └── index.css           # Cyberpunk theme, scanlines, glow effects
├── supabase/
│   ├── schema.sql          # Full DB schema with enums, RLS, seed data
│   └── migration_001_habits_text_id.sql
├── .env                    # VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
└── .specify/
    └── memory/
        └── constitution.md # Spec Kit governing principles
```

---

## Running Locally

```bash
# Clone
git clone https://github.com/your-username/routine-rpg.git
cd routine-rpg

# Install
npm install

# Configure Supabase (create .env from this template)
echo "VITE_SUPABASE_URL=your_project_url" > .env
echo "VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key" >> .env

# Run the DB schema in Supabase SQL Editor
# → supabase/schema.sql
# → supabase/migration_001_habits_text_id.sql

# Start dev server
npm run dev
```

The app works without Supabase configured — it falls back to localStorage-only mode silently.

---

## Roadmap

- [ ] Google OAuth — swap local UUID for `auth.uid()`, RLS policies already prepared
- [ ] Real streak calculation — verify consecutive days from `daily_summary`
- [ ] Cooldown enforcement — `every3days`/`weekly` habits checked against actual log history
- [ ] Automatic achievement unlocking — criteria-based triggers
- [ ] Custom habit creation — add habits outside of the preset themes
- [ ] Habit reordering — drag-and-drop sort
- [ ] Stats history charts — progress over time per stat
- [ ] PWA — installable, works offline natively

---

## Design Language

Cyberpunk noir. Dark background (`#05050f`), neon accents (cyan, magenta, yellow, green), CRT scanlines, monospace terminals. The UI should feel like a hacked interface, not a wellness app.

Fonts loaded from Google Fonts:
- **Orbitron** — headings, ranks, level numbers
- **Rajdhani** — body text, labels
- **Share Tech Mono** — values, counters, IDs

---

## License

Personal use. No license file means all rights reserved.
