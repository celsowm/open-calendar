# Open Calendar Parity Roadmap

Goal: ship a fully open-source alternative to FullCalendar React with premium-equivalent features, excluding Angular and Vue wrappers.

## Current Status

- Completed in scaffold: React component, TypeScript support, toolbar, month view, timegrid day/week, date navigation, date clicking, event model, basic recurring events, background events, business hours, now indicator, web component wrapper.
- Next: feature parity expansion listed below.

## Phase 1: Core Display + Views

- [x] Toolbar
- [x] Theme foundation
- [x] Sizing foundation
- [x] Month View
- [x] List View
- [x] DayGrid View
- [x] Multi-Month Stack
- [x] Multi-Month Grid
- [x] Timeline View
- [x] Vertical Resource View
- [x] Custom Views
- [ ] View API extensions

## Phase 2: Date + Time

- [x] Date & time display
- [x] Date navigation
- [x] Date nav links
- [x] Week numbers
- [x] Date clicking
- [x] Date range selecting
- [x] Now indicator
- [x] Business hours

## Phase 3: Events

- [x] Event model
- [x] Event sources adapters (HTTP, function, cache, lazy range fetch)
- [x] Event display variants (compact, dot, list item)
- [x] Event clicking and hover hooks
- [x] Event dragging and resizing
- [x] Event popover
- [x] Background events

## Phase 4: Resources + Timeline

- [x] Resource data model and API
- [x] Resource display (grouping, columns)
- [x] Timeline view with horizontal virtualization
- [x] Vertical resource timegrid

## Phase 5: International + Platform

- [x] Locale expansion and translation packs
- [ ] Time zone conversion strategy
- [x] TypeScript support
- [x] React component
- [x] Web component

## Phase 6: Accessibility + Touch + Print

- [ ] Keyboard drag/resizing parity
- [ ] Screen reader semantics for all views
- [ ] Touch-optimized interactions
- [x] Print styles and print-specific rendering optimization

## Phase 7: API / Plugin Parity

- [ ] Plugin registry
- [ ] Premium-plugin-equivalent modules in OSS
- [ ] Date library adapters
- [ ] Full migration guide from FullCalendar React
