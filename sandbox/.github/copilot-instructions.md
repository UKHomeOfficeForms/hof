# Copilot Instructions for HOF Sandbox App

## Project Overview
- This is a developer sandbox for the Home Office Forms (HOF) framework, used to test and prototype form components and workflows.
- The main entry point is `apps/sandbox/index.js`. Supporting files are in `apps/sandbox/fields.js`, `apps/sandbox/sections/`, and `apps/sandbox/behaviours/`.
- Views are in `apps/sandbox/views/`, translations in `apps/sandbox/translations/`, and static assets in `assets/` and `public/`.

## Developer Workflows
- **Node version:** Use Node.js 14.15.0 (see README for nvm setup).
- **Install dependencies:** Use `yarn` (not npm) in the project root and in any example app subfolder.
- **Run development server:** `yarn start:dev` (serves at http://localhost:8082/).
- **Tests:**
  - Feature tests: `test/_features/` (CodeceptJS, Gherkin syntax)
  - Unit tests: `test/_unit/` (Jest or Mocha style)
  - Step definitions: `test/_features/step_definitions/steps.js`
  - Setup: `test/_features/test.setup.js`
- **Debugging:**
  - For server-side debugging, use Node.js inspector (`node --inspect server.js` or similar).
  - For feature tests, use CodeceptJS debug mode (`DEBUG=* yarn codeceptjs run --steps`).

## Project-Specific Conventions
- **Form fields and behaviours:** Defined in `apps/sandbox/fields.js` and `apps/sandbox/behaviours/`. Each behaviour is a separate JS file for modularity.
- **Translations:** English translations are in `apps/sandbox/translations/en/default.json` and `apps/sandbox/translations/src/en/*.json`.
- **Sections:** Data summary and other sections are in `apps/sandbox/sections/`.
- **Views:** Use Nunjucks templates in `apps/sandbox/views/`.
- **Assets:** Static files (images, JS, CSS) are in `assets/` and `public/`.

## Integration Points
- **Framework integration:** This sandbox is designed to integrate with the broader HOF framework. External dependencies are managed via `package.json`.
- **No database:** All data is in-memory or mocked for testing purposes.
- **Session and state:** Session management and state clearing are handled via behaviours (see `apps/sandbox/behaviours/clear-session.js`).

## Patterns and Examples
- **Adding a new behaviour:** Create a new JS file in `apps/sandbox/behaviours/` and reference it in `fields.js` or `index.js`.
- **Adding a new field:** Update `fields.js` and provide translations in the relevant JSON files.
- **Adding a new view:** Place Nunjucks template in `views/` and reference it in the route/controller.

## Key Files
- `apps/sandbox/index.js`: Main app entry
- `apps/sandbox/fields.js`: Form field definitions
- `apps/sandbox/behaviours/`: Modular behaviours
- `apps/sandbox/sections/`: Data sections
- `apps/sandbox/views/`: Templates
- `test/_features/`: Feature tests
- `test/_unit/`: Unit tests

---
For more details, see the [README.md](../README.md). If any conventions or workflows are unclear, please ask for clarification or provide feedback to improve these instructions.
