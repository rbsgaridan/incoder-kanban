# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-23

### Added
- Initial release
- `KanbanBoard` main component with full drag & drop support
- `KanbanColumn` component with WIP limits and customization
- `KanbanCard` component with rich metadata support
- Swimlanes support for horizontal grouping
- Comprehensive slot system for customization:
  - `toolbar` - Board toolbar
  - `column-header` - Custom column headers
  - `column-footer` - Custom column footers
  - `card` - Custom card rendering
  - `card-overlay` - Card overlays
  - `empty-column` - Empty state
- Full TypeScript support with exported types
- Accessibility features (ARIA roles, keyboard navigation)
- PrimeVue theme integration
- Event system:
  - `card-moved` - Card movement between columns
  - `column-moved` - Column reordering
  - `card-click` - Card interactions
  - `drag-start` / `drag-end` - Drag lifecycle
- Card features:
  - Priority levels (lowest to highest)
  - Tags with custom colors
  - Assignees with avatars
  - Due dates
  - Custom metadata
- Column features:
  - WIP limits with visual indicators
  - Custom colors and icons
  - Collapsible columns
  - Drag & drop control
- Board options:
  - Enable/disable drag & drop
  - Horizontal scrolling
  - Show/hide card counts
  - Show/hide WIP limits
  - Custom column widths
- Composables:
  - `useKanbanState` - State management
  - `useKanbanDrag` - Drag & drop logic
- Complete documentation and examples
- Playground demo application

### Dependencies
- Vue 3.3+
- PrimeVue 3.46+
- @vueuse/core 10.7+

[1.0.0]: https://github.com/rbsgaridan/incoder-kanban/releases/tag/v1.0.0
