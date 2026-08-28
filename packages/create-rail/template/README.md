# Rail

One command. Clean repo. Agent on rails.

Rail creates a ready-to-code Vite or Next.js React app with strict TypeScript,
linting, formatting, pre-commit checks, and dependency age gates already wired.
Coding agents can move fast without turning the repository into a mess.

## What Rail sets up

- Vite or Next.js App Router SPA export
- React 19 and TypeScript 6
- ESLint with `eslint-config-complete`
- Prettier with sorted imports
- Husky and lint-staged checks for generated Git repositories
- Package-age gating for supply-chain security
- VS Code linting and formatting settings
- Styled or minimal starter CSS
- Lucide React by default
- Optional TanStack React Query

## Create an app

### npm

```bash
npm create rail@latest
```

### yarn

```bash
yarn create rail
```

### pnpm

```bash
pnpm create rail@latest
```

### bun

```bash
bun create rail@latest
```

Full CLI usage, flags, and repository behavior are documented in
[`docs/CLI.md`](./docs/CLI.md).
