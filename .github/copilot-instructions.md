# Copilot Instructions for @incoder/kanban

## Project Overview

This is a **Vue 3 component library** (not an app) that exports a reusable Kanban board. It's built as an npm package with Vite in library mode, generates TypeScript declarations, and externalizes Vue/PrimeVue as peer dependencies.

**Current version**: 2.0.0 - Requires Vue ^3.5.0 and PrimeVue ^4.0.0

**Laravel Compatibility**: Fully compatible with Laravel + Inertia.js + Vue 3 projects.

**Key architectural principle**: Components are controlled via props with v-model bindings—state management lives in the consuming app, not the library.

## Architecture & Core Patterns

### Component Hierarchy

- **KanbanBoard.vue**: Orchestrator component that coordinates columns, swimlanes, drag-drop, and emits all events
- **KanbanColumn.vue**: Manages card rendering and drop zones for a single column
- **KanbanCard.vue**: Individual card with metadata display and drag handlers

All components use Vue 3 Composition API with `<script setup>` and full TypeScript.

### State Management Pattern

The library uses **composables over components** for business logic:

1. **useKanbanState**: Manages cards/columns/swimlanes, provides operations (`moveCard`, `getCardsForColumn`, `isColumnOverLimit`)
2. **useKanbanDrag**: Handles native HTML5 drag-drop state and events (no external libraries)

Components receive refs from props via `toRef()` and pass them to composables. This enables both controlled (parent manages state) and uncontrolled (internal fallback state) modes.

### Type System Philosophy

All types are exported from `src/types/kanban.ts` (40+ types total). The library is **fully typed**:

- Core entities: `KanbanCard`, `KanbanColumn`, `KanbanSwimlane`
- Events: `CardMoveEvent`, `ColumnMoveEvent`, `CardClickEvent`, etc.
- Slot scopes: `CardSlotScope`, `ColumnHeaderSlotScope`, etc.
- Config: `KanbanBoardOptions` with extensive optional flags

**Pattern**: When adding features, define types first, then implement.

## Development Workflows

### Running the Playground

```bash
npm run dev  # Opens http://localhost:5173
```

The playground (`playground/App.vue`) is the testing ground. It demonstrates all features with sample data and event logging.

### Building the Library

```bash
npm run build  # Runs vue-tsc for type checking, then vite build
```

Output in `dist/`:

- `incoder-kanban.js` (ESM)
- `incoder-kanban.cjs` (CommonJS)
- `style.css` (bundled styles)
- `index.d.ts` (rolled-up type declarations via vite-plugin-dts)

### Type Checking

```bash
npm run build  # vue-tsc runs as part of build (no separate test command exists)
```

## Project-Specific Conventions

### PrimeVue 4 Integration Pattern

The library **inherits** PrimeVue 4 themes from the consuming app using the new preset-based theming system (no bundled theme). The consuming app must configure PrimeVue with a preset (e.g., Aura, Lara). Use PrimeVue components sparingly—only for icons (`primeicons` classes) and card metadata display. This keeps the library lightweight and compatible with Laravel/Inertia projects.

### Drag & Drop Implementation

**Native HTML5 Drag API** (no vue-draggable or external libs):

- `dragstart`: Set `dataTransfer` with card/column data, add `.kanban-dragging` class
- `dragover`: Prevent default and set `.kanban-drag-over` on drop zones
- `drop`: Extract data from `dataTransfer`, call state mutations
- `dragend`: Clean up classes and reset drag state

See `useKanbanDrag.ts` for full implementation. When modifying drag behavior, always update `dragState` ref for visual feedback.

### Slot Naming Convention

Slots follow the pattern: `<component>-<section>` (e.g., `column-header`, `card-content`, `board-toolbar`). All slots receive typed scope objects for full IntelliSense support.

### CSS Class Naming

Uses BEM-style prefixes:

- `.kanban-board`, `.kanban-column`, `.kanban-card` (component roots)
- `.kanban-dragging`, `.kanban-drag-over` (state modifiers)
- Custom classes via `options.boardClass`/`columnClass`/`cardClass`

## Adding New Features Checklist

1. **Define types** in `src/types/kanban.ts` (interfaces, events, slot scopes)
2. **Update composable** (`useKanbanState` or `useKanbanDrag`) if state/logic needed
3. **Implement in component** (KanbanBoard/Column/Card)
4. **Export from `src/index.ts`** (types, components, composables)
5. **Document in README.md** (API reference section)
6. **Demo in `playground/App.vue`**

## Critical Files to Understand

- **src/index.ts**: Public API—everything exported here is part of the package
- **src/types/kanban.ts**: Single source of truth for all types
- **vite.config.ts**: Library build config (externals, output formats, type generation)
- **playground/App.vue**: Comprehensive usage example showing all features

## Common Gotchas

- **Never import from `.vue` files directly** in consuming apps—use the package exports
- **Order field is critical**: Cards and columns use `order: number` for sorting. When adding items, calculate order correctly
- **Event emission pattern**: Always emit both specific events (`card-moved`) AND generic `board-change` event
- **v-model:cards/columns**: Components expect arrays. Mutations should return new arrays (immutable pattern)

## Testing Approach

No automated tests exist yet. Current validation is manual via playground. When adding features:

1. Add example to `playground/App.vue`
2. Test drag-drop interactions
3. Verify event payloads in browser console
4. Check TypeScript compilation with `npm run build`
