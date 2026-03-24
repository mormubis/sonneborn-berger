# Changelog

## 0.2.1 — 2026-03-23

- Release with Game[][] breaking change

## 0.2.0 — 2026-03-23

### Changed

- **BREAKING:** `Game` type no longer has a `round` field. Round is determined
  by array position: `games[n]` = round n+1.
- **BREAKING:** All functions accept `Game[][]` instead of `Game[]`.

## 0.1.1 — 2026-03-23

- First npm release

## 0.1.0 — 2026-03-22

- Initial implementation
