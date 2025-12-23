# Getting Started Guide

## Installation and Setup

### Step 1: Install the Package

```bash
npm install @incoder/kanban vue primevue
```

### Step 2: Setup PrimeVue (if not already done)

In your `main.ts` or `main.js`:

```typescript
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import App from './App.vue';

// Import PrimeVue theme
import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

const app = createApp(App);
app.use(PrimeVue);
app.mount('#app');
```

### Step 3: Import Kanban Component

In your component:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { KanbanBoard } from '@incoder/kanban';
import '@incoder/kanban/style.css';
import type { KanbanColumn, KanbanCard } from '@incoder/kanban';

// Define your columns
const columns = ref<KanbanColumn[]>([
  { id: 1, title: 'To Do', order: 0 },
  { id: 2, title: 'In Progress', order: 1 },
  { id: 3, title: 'Done', order: 2 }
]);

// Define your cards
const cards = ref<KanbanCard[]>([
  {
    id: 1,
    columnId: 1,
    title: 'First task',
    description: 'This is my first task',
    order: 0
  }
]);
</script>

<template>
  <div class="kanban-container">
    <KanbanBoard
      v-model:columns="columns"
      v-model:cards="cards"
    />
  </div>
</template>

<style scoped>
.kanban-container {
  height: 100vh;
  padding: 1rem;
}
</style>
```

## Common Use Cases

### 1. Project Management Board

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { KanbanBoard, CardPriority } from '@incoder/kanban';

const columns = ref([
  { id: 'backlog', title: 'Backlog', order: 0, icon: 'pi pi-inbox' },
  { id: 'todo', title: 'To Do', order: 1, icon: 'pi pi-list' },
  { id: 'doing', title: 'In Progress', order: 2, icon: 'pi pi-spin pi-spinner', wipLimit: 3 },
  { id: 'review', title: 'Review', order: 3, icon: 'pi pi-eye' },
  { id: 'done', title: 'Done', order: 4, icon: 'pi pi-check' }
]);

const cards = ref([
  {
    id: 1,
    columnId: 'doing',
    title: 'Implement feature X',
    priority: CardPriority.HIGH,
    assignees: [{ id: 1, name: 'John Doe' }],
    tags: [{ id: 1, label: 'Frontend', color: '#3b82f6' }],
    dueDate: '2024-01-20',
    order: 0
  }
]);
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    v-model:cards="cards"
    @card-moved="handleCardMoved"
    @card-click="openCardDetails"
  />
</template>
```

### 2. Simple Task Tracker

```vue
<script setup lang="ts">
const columns = ref([
  { id: 1, title: 'To Do', order: 0 },
  { id: 2, title: 'Done', order: 1 }
]);

const cards = ref([
  { id: 1, columnId: 1, title: 'Buy groceries', order: 0 },
  { id: 2, columnId: 1, title: 'Call dentist', order: 1 },
  { id: 3, columnId: 2, title: 'Pay bills', order: 0 }
]);

const options = ref({
  showWipLimit: false,
  columnWidth: '250px'
});
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    v-model:cards="cards"
    :options="options"
  />
</template>
```

### 3. Team Workflow with Swimlanes

```vue
<script setup lang="ts">
const swimlanes = ref([
  { id: 'frontend', title: 'Frontend Team', order: 0 },
  { id: 'backend', title: 'Backend Team', order: 1 },
  { id: 'devops', title: 'DevOps Team', order: 2 }
]);

const columns = ref([
  { id: 'todo', title: 'To Do', order: 0 },
  { id: 'doing', title: 'In Progress', order: 1 },
  { id: 'done', title: 'Done', order: 2 }
]);

const cards = ref([
  {
    id: 1,
    columnId: 'todo',
    swimlaneId: 'frontend',
    title: 'Update UI components',
    order: 0
  },
  {
    id: 2,
    columnId: 'doing',
    swimlaneId: 'backend',
    title: 'API optimization',
    order: 0
  }
]);

const options = ref({
  enableSwimlanes: true
});
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    v-model:cards="cards"
    v-model:swimlanes="swimlanes"
    :options="options"
  />
</template>
```

## Integration with Backend

### Fetching Data

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const loading = ref(true);
const columns = ref([]);
const cards = ref([]);

onMounted(async () => {
  try {
    const [columnsRes, cardsRes] = await Promise.all([
      fetch('/api/kanban/columns'),
      fetch('/api/kanban/cards')
    ]);
    
    columns.value = await columnsRes.json();
    cards.value = await cardsRes.json();
  } catch (error) {
    console.error('Failed to load kanban data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    v-model:cards="cards"
    :loading="loading"
  />
</template>
```

### Persisting Changes

```vue
<script setup lang="ts">
import type { CardMoveEvent } from '@incoder/kanban';

const handleCardMoved = async (event: CardMoveEvent) => {
  try {
    await fetch(`/api/cards/${event.card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: event.toColumnId,
        order: event.toIndex
      })
    });
  } catch (error) {
    console.error('Failed to move card:', error);
    // Optionally revert the change
  }
};
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    v-model:cards="cards"
    @card-moved="handleCardMoved"
  />
</template>
```

## Styling and Theming

### Using Different PrimeVue Themes

The component automatically inherits your PrimeVue theme:

```typescript
// For dark theme
import 'primevue/resources/themes/lara-dark-blue/theme.css';

// For light theme
import 'primevue/resources/themes/lara-light-blue/theme.css';

// For custom theme
import 'primevue/resources/themes/my-custom-theme/theme.css';
```

### Custom Styling

```css
/* Override specific styles */
.kanban-board {
  --surface-ground: #f5f5f5;
}

.kanban-column {
  min-width: 320px;
}

.kanban-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## Troubleshooting

### Cards not dragging

Make sure drag & drop is enabled:

```vue
<KanbanBoard
  v-model:columns="columns"
  v-model:cards="cards"
  :options="{ enableDragDrop: true }"
/>
```

### Theme not applied

Ensure you've imported PrimeVue CSS:

```typescript
import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
```

### TypeScript errors

Make sure you're importing types:

```typescript
import type { KanbanColumn, KanbanCard } from '@incoder/kanban';
```

## Next Steps

- Read the [full API documentation](./README.md)
- Check out [usage examples](./EXAMPLES.md)
- Explore the [playground demo](./playground/App.vue)
- Customize with [slots and events](./README.md#slots)

## Support

- 📖 [Documentation](./README.md)
- 💬 [Discussions](https://github.com/yourusername/incoder-kanban/discussions)
- 🐛 [Report Issues](https://github.com/yourusername/incoder-kanban/issues)
