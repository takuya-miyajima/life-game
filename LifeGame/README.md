# LifeGame

Conway's Game of Life built with Angular 22.2.2 and Angular Material 22.2.2.

## Requirements

The project's Node.js engine range accepts all 22.x and 24.x versions (tested with
24.21.0). `.nvmrc` selects the latest available Node.js 24 release rather
than pinning a specific minor or patch version.
Angular 22 and some dependencies still require Node.js 22.22.3 or newer
within 22.x, or 24.15.0 or newer within 24.x. Earlier minor versions may
produce engine warnings or fail to build. Use these supported ranges
for development and CI environments.
TypeScript stays on 6.0.x because Angular 22 requires `>=6.0 <6.1`;
TypeScript 7 is not yet compatible.

## Setup and development

From this directory:

```sh
npm ci
npm start
```

Open http://localhost:4200/. Changes reload automatically.
Click cells to toggle them, Tick to advance one generation, or Start / Stop
to run continuously. Apply changes the interval; Resize clears the board
and stops a running simulation. The interval must be at least 100 ms and
each board dimension must be an integer between 10 and 500.

## Build and checks

```sh
npm run lint
npm test
npm run build
```

Builds default to production and write deployable files directly into
`dist/LifeGame`, including `index.html`. For a development build use
`npm run build -- --configuration development`.

Unit tests use Angular's Vitest builder with jsdom. Use `npm run test:watch`
for watch mode.

## Browser tests

Install Playwright's Chromium once, then run the end-to-end test:

```sh
npx playwright install chromium
npm run e2e
```

On Linux CI use `npx playwright install --with-deps chromium`.
Playwright starts and stops its own development server on port 4200.
The test checks board interaction, validation, resizing, and automatic
rendering without Zone.js.

## Upgrade notes

The app now uses standalone components, built-in template control flow,
typed reactive forms, and Angular's default zoneless change detection.
Timer callbacks notify change detection and subscriptions are cleaned up
on component destruction. Angular animations, Zone.js, and the unused
router have been removed. Karma / Jasmine, Protractor, and TSLint /
Codelyzer have been replaced with Vitest, Playwright, and ESLint.

## AWS CodeBuild

The root `buildspec.yml` selects Node.js 24, installs the lockfile with
`npm ci`, and runs lint, unit tests, and the production build. Use a
current CodeBuild managed image supporting Node.js 24 (for example,
Ubuntu standard:7.0 or newer) with Node.js at least 24.15.0.
Old CodeBuild images may need to be updated in the AWS project settings.
The artifact path remains `LifeGame/dist/LifeGame`. The npm download cache
replaces the old archive of `node_modules`.
