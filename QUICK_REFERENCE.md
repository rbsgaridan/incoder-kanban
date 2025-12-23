# Quick Reference

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Playground (Development)
```bash
npm run dev
```
Then open http://localhost:5173

### Build Library
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

## 📦 Package Structure

```
dist/
├── incoder-kanban.js      # ESM bundle
├── incoder-kanban.cjs     # CommonJS bundle
├── style.css              # Component styles
└── index.d.ts             # Type declarations
```

## 🎯 Import Usage

```typescript
// Import component
import { KanbanBoard } from '@incoder/kanban';
import '@incoder/kanban/style.css';

// Import types
import type { KanbanColumn, KanbanCard } from '@incoder/kanban';

// Import composables (advanced)
import { useKanbanState, useKanbanDrag } from '@incoder/kanban';

// Import enum
import { CardPriority } from '@incoder/kanban';
```

## 🔧 Key Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build library for production |
| `npm run preview` | Preview production build |
| `npm run type-check` | Type check TypeScript |

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Main library entry point |
| `src/components/KanbanBoard.vue` | Main board component |
| `src/types/kanban.ts` | TypeScript definitions |
| `vite.config.ts` | Build configuration |
| `package.json` | Package metadata |

## 🎨 Customization Points

### Slots
- `toolbar` - Board toolbar
- `column-header` - Column header
- `column-footer` - Column footer
- `card` - Card content
- `card-overlay` - Card overlay
- `empty-column` - Empty state

### Events
- `card-moved` - Card moved
- `card-click` - Card clicked
- `drag-start` - Drag started
- `drag-end` - Drag ended
- `board-change` - Board changed

### Props
- `columns` - Column definitions
- `cards` - Card data
- `swimlanes` - Swimlane definitions
- `options` - Board options
- `loading` - Loading state

## 📚 Documentation

- **README.md** - Main documentation
- **GETTING_STARTED.md** - Setup guide
- **EXAMPLES.md** - Usage examples
- **PROJECT_SUMMARY.md** - Architecture overview
- **CHANGELOG.md** - Version history

## 🐛 Common Issues

### Issue: Styles not appearing
**Solution**: Import the CSS file
```typescript
import '@incoder/kanban/style.css';
```

### Issue: TypeScript errors
**Solution**: Import types
```typescript
import type { KanbanColumn, KanbanCard } from '@incoder/kanban';
```

### Issue: Drag not working
**Solution**: Enable drag & drop
```vue
<KanbanBoard :options="{ enableDragDrop: true }" />
```

## 📊 Component API Quick Reference

### KanbanColumn Type
```typescript
{
  id: string | number;
  title: string;
  order: number;
  color?: string;
  icon?: string;
  wipLimit?: number;
  draggable?: boolean;
}
```

### KanbanCard Type
```typescript
{
  id: string | number;
  columnId: string | number;
  title: string;
  order: number;
  description?: string;
  priority?: CardPriority;
  tags?: KanbanTag[];
  assignees?: KanbanUser[];
  dueDate?: Date | string;
}
```

### KanbanBoardOptions Type
```typescript
{
  enableDragDrop?: boolean;
  enableSwimlanes?: boolean;
  showCardCount?: boolean;
  showWipLimit?: boolean;
  horizontalScroll?: boolean;
  columnWidth?: string | number;
}
```

## 🎯 Minimal Working Example

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { KanbanBoard } from '@incoder/kanban';
import '@incoder/kanban/style.css';

const columns = ref([
  { id: 1, title: 'To Do', order: 0 },
  { id: 2, title: 'Done', order: 1 }
]);

const cards = ref([
  { id: 1, columnId: 1, title: 'My Task', order: 0 }
]);
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    v-model:cards="cards"
  />
</template>
```

## 🔗 Useful Links

- Vue 3 Documentation: https://vuejs.org/
- PrimeVue Documentation: https://primevue.org/
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Vite Documentation: https://vitejs.dev/

## 💡 Pro Tips

1. Always use `v-model:columns` and `v-model:cards` for two-way binding
2. Set unique `id` values for columns and cards
3. Use `order` property to control initial positioning
4. Leverage slots for custom rendering
5. Listen to `card-moved` event for persistence
6. Enable WIP limits to prevent overloading columns
7. Use swimlanes for team-based organization
8. Customize with PrimeVue theme for brand consistency

## 📞 Support

- 📖 Check documentation files first
- 🔍 Search existing issues
- 💬 Ask in discussions
- 🐛 Report bugs with reproduction

---

**Happy Coding! 🎉**
