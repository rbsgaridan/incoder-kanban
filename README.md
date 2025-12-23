# @incoder/kanban

> Enterprise-grade Kanban Board component for Vue 3 with PrimeVue integration

[![NPM Version](https://img.shields.io/npm/v/@incoder/kanban.svg)](https://www.npmjs.com/package/@incoder/kanban)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **Vue 3 Composition API** - Built with modern Vue 3 and TypeScript
- 🎨 **PrimeVue Integration** - Inherits your app's PrimeVue theme automatically
- 🔄 **Drag & Drop** - Smooth card and column reordering
- 🏊 **Swimlanes Support** - Organize cards in horizontal swimlanes
- 🎪 **Flexible Slots** - Customize every part of the board
- 📦 **Fully Typed** - Complete TypeScript support with exported types
- 🪶 **Lightweight** - Tree-shakable with minimal dependencies
- ♿ **Accessible** - ARIA roles and keyboard navigation
- 🎭 **Controlled/Uncontrolled** - Works both ways

## 📦 Installation

```bash
npm install @incoder/kanban
# or
yarn add @incoder/kanban
# or
pnpm add @incoder/kanban
```

### Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "vue": "^3.3.0",
  "primevue": "^3.46.0"
}
```

## 🚀 Quick Start

### 1. Import the Component and Styles

```typescript
import { KanbanBoard } from '@incoder/kanban';
import '@incoder/kanban/style.css';
import type { KanbanColumn, KanbanCard } from '@incoder/kanban';
```

### 2. Setup Your Data

```typescript
import { ref } from 'vue';

const columns = ref<KanbanColumn[]>([
  { id: 'todo', title: 'To Do', order: 0 },
  { id: 'doing', title: 'In Progress', order: 1 },
  { id: 'done', title: 'Done', order: 2 }
]);

const cards = ref<KanbanCard[]>([
  {
    id: 1,
    columnId: 'todo',
    title: 'Implement authentication',
    description: 'Add JWT-based auth system',
    order: 0
  },
  {
    id: 2,
    columnId: 'doing',
    title: 'Design dashboard',
    order: 0
  }
]);
```

### 3. Use the Component

```vue
<template>
  <KanbanBoard
    v-model:columns="columns"
    v-model:cards="cards"
    @card-moved="handleCardMoved"
  />
</template>
```

## 📚 API Reference

### KanbanBoard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `KanbanColumn[]` | **required** | Array of column definitions |
| `cards` | `KanbanCard[]` | **required** | Array of card data |
| `swimlanes` | `KanbanSwimlane[]` | `[]` | Optional swimlane definitions |
| `options` | `KanbanBoardOptions` | `{}` | Board configuration options |
| `loading` | `boolean` | `false` | Show loading overlay |

### KanbanBoardOptions

```typescript
interface KanbanBoardOptions {
  // Drag & Drop
  enableDragDrop?: boolean;           // Default: true
  enableColumnDrag?: boolean;         // Default: false
  enableCardReordering?: boolean;     // Default: true
  
  // Swimlanes
  enableSwimlanes?: boolean;          // Default: false
  groupBy?: string;                   // Field to group by
  
  // UI Behavior
  horizontalScroll?: boolean;         // Default: true
  showEmptyColumns?: boolean;         // Default: true
  showCardCount?: boolean;            // Default: true
  showWipLimit?: boolean;             // Default: true
  
  // Styling
  columnWidth?: number | string;      // Default: '300px'
  boardClass?: string;
  columnClass?: string;
  cardClass?: string;
}
```

### KanbanColumn

```typescript
interface KanbanColumn {
  id: string | number;
  title: string;
  order: number;
  
  // Optional
  color?: string;                     // Header accent color
  icon?: string;                      // PrimeIcons class
  collapsed?: boolean;
  hidden?: boolean;
  wipLimit?: number;                  // Work-in-progress limit
  draggable?: boolean;
  acceptsCards?: boolean;
  metadata?: Record<string, any>;
}
```

### KanbanCard

```typescript
interface KanbanCard {
  id: string | number;
  columnId: string | number;
  title: string;
  order: number;
  
  // Optional
  description?: string;
  tags?: KanbanTag[];
  assignees?: KanbanUser[];
  priority?: CardPriority;
  dueDate?: Date | string;
  swimlaneId?: string | number;
  draggable?: boolean;
  metadata?: Record<string, any>;
}
```

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:columns` | `KanbanColumn[]` | Emitted when columns change |
| `update:cards` | `KanbanCard[]` | Emitted when cards change |
| `card-moved` | `CardMoveEvent` | Card moved between columns |
| `column-moved` | `ColumnMoveEvent` | Column reordered |
| `card-click` | `CardClickEvent` | Card clicked |
| `card-update` | `CardUpdateEvent` | Card data updated |
| `column-update` | `ColumnUpdateEvent` | Column data updated |
| `board-change` | `BoardChangeEvent` | Board state changed |
| `drag-start` | `DragStartEvent` | Drag operation started |
| `drag-end` | `DragEndEvent` | Drag operation ended |

### Slots

| Slot Name | Props | Description |
|-----------|-------|-------------|
| `toolbar` | `{ columns, cards, swimlanes }` | Board toolbar area |
| `column-header` | `{ column, cardCount, isOverLimit }` | Custom column header |
| `column-footer` | `{ column, cardCount }` | Custom column footer |
| `card` | `{ card, column, index, isDragging }` | Custom card rendering |
| `card-overlay` | `{ card, column }` | Overlay on card (e.g., actions) |
| `empty-column` | `{ column }` | Empty column placeholder |

## 🎨 Customization Examples

### Custom Card Rendering

```vue
<KanbanBoard
  v-model:columns="columns"
  v-model:cards="cards"
>
  <template #card="{ card, column }">
    <div class="custom-card">
      <h3>{{ card.title }}</h3>
      <p>{{ card.description }}</p>
      <button @click="editCard(card)">Edit</button>
    </div>
  </template>
</KanbanBoard>
```

### Custom Column Header

```vue
<KanbanBoard
  v-model:columns="columns"
  v-model:cards="cards"
>
  <template #column-header="{ column, cardCount, isOverLimit }">
    <div class="custom-header">
      <h3>{{ column.title }}</h3>
      <span :class="{ 'text-danger': isOverLimit }">
        {{ cardCount }} cards
      </span>
      <button @click="addCard(column.id)">+</button>
    </div>
  </template>
</KanbanBoard>
```

### Board Toolbar

```vue
<KanbanBoard
  v-model:columns="columns"
  v-model:cards="cards"
>
  <template #toolbar="{ columns, cards }">
    <div class="toolbar">
      <h2>Project Board</h2>
      <div>{{ cards.length }} total cards</div>
      <button @click="exportData">Export</button>
    </div>
  </template>
</KanbanBoard>
```

## 🏊 Swimlanes

Enable swimlanes to group cards horizontally:

```typescript
const swimlanes = ref<KanbanSwimlane[]>([
  { id: 'urgent', title: 'Urgent', order: 0 },
  { id: 'normal', title: 'Normal', order: 1 }
]);

const options = ref({
  enableSwimlanes: true
});

// Cards with swimlane assignment
const cards = ref<KanbanCard[]>([
  {
    id: 1,
    columnId: 'todo',
    swimlaneId: 'urgent',
    title: 'Critical bug fix',
    order: 0
  }
]);
```

```vue
<KanbanBoard
  v-model:columns="columns"
  v-model:cards="cards"
  v-model:swimlanes="swimlanes"
  :options="options"
/>
```

## 🎯 Advanced Features

### WIP Limits

Set work-in-progress limits on columns:

```typescript
const columns = ref<KanbanColumn[]>([
  {
    id: 'in-progress',
    title: 'In Progress',
    order: 1,
    wipLimit: 3  // Maximum 3 cards
  }
]);
```

The column header will highlight when over the limit.

### Card Priority

Use the `CardPriority` enum for priority indicators:

```typescript
import { CardPriority } from '@incoder/kanban';

const card: KanbanCard = {
  id: 1,
  columnId: 'todo',
  title: 'Fix critical bug',
  priority: CardPriority.HIGHEST,
  order: 0
};
```

### Tags and Assignees

```typescript
const card: KanbanCard = {
  id: 1,
  columnId: 'todo',
  title: 'Implement feature',
  tags: [
    { id: 1, label: 'Frontend', color: '#3b82f6' },
    { id: 2, label: 'Urgent', color: '#ef4444' }
  ],
  assignees: [
    { id: 1, name: 'John Doe', avatar: '/avatars/john.jpg' }
  ],
  order: 0
};
```

### Disable Drag for Specific Cards/Columns

```typescript
const card: KanbanCard = {
  id: 1,
  columnId: 'done',
  title: 'Locked card',
  draggable: false,  // This card cannot be dragged
  order: 0
};

const column: KanbanColumn = {
  id: 'done',
  title: 'Done',
  acceptsCards: false,  // Cannot drop cards here
  order: 2
};
```

## 🎭 Event Handling

### Handle Card Moves

```typescript
const handleCardMoved = (event: CardMoveEvent) => {
  console.log(`Card ${event.card.title} moved`);
  console.log(`From: ${event.fromColumnId} to ${event.toColumnId}`);
  
  // Make API call to persist the change
  await api.moveCard(event.card.id, event.toColumnId);
};
```

```vue
<KanbanBoard
  v-model:columns="columns"
  v-model:cards="cards"
  @card-moved="handleCardMoved"
/>
```

### Handle Card Clicks

```typescript
const handleCardClick = (event: CardClickEvent) => {
  // Open edit dialog
  openCardDialog(event.card);
};
```

## 🎨 Theming

The component automatically inherits your PrimeVue theme. No additional configuration needed!

### Using Custom PrimeVue Theme

```typescript
// main.ts
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/lara-dark-blue/theme.css';

app.use(PrimeVue);
```

The Kanban board will automatically use the theme's design tokens.

### Custom CSS Variables

Override specific styles if needed:

```css
.kanban-board {
  --kanban-column-width: 350px;
  --kanban-card-gap: 1rem;
}
```

## 📱 Responsive Design

The board automatically scrolls horizontally on smaller screens. You can control this:

```typescript
const options = ref({
  horizontalScroll: true,  // Enable horizontal scroll
  columnWidth: '280px'     // Adjust for mobile
});
```

## ♿ Accessibility

The component includes:

- ARIA roles for board, columns, and cards
- Keyboard navigation (Tab, Enter, Space)
- Focus management during drag operations
- Screen reader announcements

### Keyboard Shortcuts

- `Tab` - Navigate between cards
- `Enter` or `Space` - Activate card
- Arrow keys - Navigate cards (when focused)

## 🔧 TypeScript Support

All types are exported for your convenience:

```typescript
import type {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  KanbanSwimlane,
  KanbanBoardOptions,
  CardMoveEvent,
  CardClickEvent,
  BoardChangeEvent
} from '@incoder/kanban';
```

## 🏗️ Build & Development

```bash
# Install dependencies
npm install

# Run playground
npm run dev

# Build library
npm run build

# Type check
npm run type-check
```

## 📄 License

MIT © [Your Name]

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/yourusername/incoder-kanban/issues).

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

---

Made with ❤️ using Vue 3 and PrimeVue
