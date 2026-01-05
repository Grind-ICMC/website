## Purpose
Short, targeted instructions to help AI coding agents be immediately productive in this repository (a Vite + React + TypeScript site using Tailwind and shadcn-style UI primitives).

## Quick start (commands)
- Install dependencies: use your preferred manager (npm/pnpm/yarn/bun). The project contains a `bun.lockb` but npm scripts are available.
- Dev server: `npm run dev` — runs Vite (server configured to host on :: port 8080 in `vite.config.ts`).
- Build: `npm run build` (or `npm run build:dev` for a development build).
- Preview production build: `npm run preview`.
- Lint: `npm run lint` (ESLint configured at repo root).

## Big-picture architecture
- Vite + React + TypeScript single-page app. Entrypoint: `src/main.tsx` -> `src/App.tsx`.
- Routing: uses `react-router-dom`. Routes are declared in `src/App.tsx` and pages live under `src/pages/` (e.g. `Index.tsx`, `NotFound.tsx`). IMPORTANT: Add custom routes above the catch-all (`*`) route in `App.tsx`.
- Global state/data: uses `@tanstack/react-query` (see `QueryClientProvider` in `App.tsx`) for remote data.
- UI primitives: wrapped Radix + utility components live in `src/components/ui/`. These are small shadcn-like wrappers — prefer reusing them rather than adding heavy external UI code.
- Localized strings / language: `src/contexts/LanguageContext.tsx` exposes `useLanguage()` used across components for `t(...)` translation calls.

## Key project conventions and patterns
- Path alias: `@` maps to `./src` (defined in `vite.config.ts` and `tsconfig.json`). Use imports like `import X from "@/components/Whatever"`.
- File / export style: components use PascalCase filenames and default exports (e.g. `Header.tsx`, `Footer.tsx`). Follow that pattern for consistency.
- UI tokens & utilities: design tokens and utility classes are declared in `tailwind.config.ts` and `src/index.css` (CSS variables like `--primary`, utility classes like `.btn-primary`, `.section-container`, `.glass-card`). Prefer these classes for consistent design.
- Small component guidelines: put small, reusable UI controls in `src/components/ui/`. Larger page sections belong in `src/components/` (e.g. `HeroSection.tsx`, `TracksSection.tsx`).
- Route guidance: `App.tsx` contains a comment reminder — always place app-specific routes before the `*` catch-all route.

## Integration points & external deps
- Many Radix UI packages and small libs are used (see `package.json`). Prefer using the existing Radix wrappers under `src/components/ui/` instead of importing raw Radix primitives directly.
- Toasting: two toast systems are included — a custom `Toaster` and `sonner` wrapper. Both are wired in `App.tsx` (look at `src/components/ui/toaster` and `src/components/ui/sonner`).
- Icons: `lucide-react` and `react-icons` are present; icon components are imported directly (e.g. `lucide-react` in `Header.tsx`).

## Files to consult for common tasks (examples)
- Start / dev port: `vite.config.ts` (server.host, server.port = 8080).
- Path alias: `vite.config.ts` and `tsconfig.json` (see `paths` and `resolve.alias`).
- Styling tokens and utilities: `tailwind.config.ts` and `src/index.css` (search for `--primary`, `.btn-primary`, `.section-container`).
- Routing and pages: `src/App.tsx`, `src/pages/`.
- UI components and primitives: `src/components/` and `src/components/ui/`.
- Localization hook: `src/contexts/LanguageContext.tsx` (use `useLanguage()` to fetch `t()` translations).

## When making changes, prefer:
- Reuse `src/components/ui/*` wrappers for consistency and theming.
- Use the `@` alias for imports to avoid long relative paths.
- Keep components small and default-exported, with PascalCase filenames.
- Update `tailwind` tokens and `index.css` for global style changes rather than scattering inline styles.

## Short examples
- Add a route (insert above the catch-all in `src/App.tsx`):

- Import pattern example: `import Header from "@/components/Header"`.

## Gaps / things not present
- There are no unit tests or CI config in the repo. If adding tests, prefer small React Testing Library + Vitest setup and call out script entries in `package.json`.

## Final notes
- The dev server is configured to run on port 8080; if a PR or an agent changes the dev-server config, confirm the override in `vite.config.ts`.
- If you modify design tokens, update both `tailwind.config.ts` (color names) and `src/index.css` (CSS variables) to keep them in sync.

If any of the sections above look incomplete or you'd like more examples (route additions, sample component PR), tell me which area to expand and I will iterate.
