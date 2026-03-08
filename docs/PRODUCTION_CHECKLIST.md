# Production Checklist

## Code and Build

- `npm run compile` passes with zero errors.
- No TypeScript `any` regressions introduced unintentionally.
- No debug logs left in production code.

## Functional Validation

- Save Snippet flow works.
- Insert Snippet QuickPick flow works.
- Ghost text appears for valid key prefixes.
- `Tab` commits VSnippet inline suggestion.
- Overlap-aware insertion avoids text duplication.
- Live reload works after snippet file changes.
- Interference behavior validated with other extensions enabled.

## UX and Docs

- README reflects current behavior/settings.
- GIF demos in `assets/demo/` are up to date.
- Usage guide matches current keybindings and command names.
- Changelog includes latest released behavior.

## Packaging

- `package.json` metadata validated:
  - `name`
  - `displayName`
  - `publisher`
  - `version`
  - `repository.url`
  - `homepage`
  - `bugs.url`
- `icon` exists and renders correctly.
- Package builds: `npm run package`.

## Release

- Version bumped according to semantic impact.
- `CHANGELOG.md` updated for release version.
- Tag/release notes prepared.
- Publish command verified:
  - `npm run publish:patch` or
  - `npm run publish:minor`
