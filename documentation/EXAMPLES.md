# Usage Examples

This document provides practical examples of using the Kanban Board component in various scenarios.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Handling Events](#handling-events)
- [Custom Slots](#custom-slots)
- [Swimlanes](#swimlanes)
- [Advanced Features](#advanced-features)

## Basic Setup

### Minimal Example

The simplest way to use the Kanban board:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { KanbanBoard } from '@incoder/kanban';
import '@incoder/kanban/style.css';
import type { KanbanColumn, KanbanCard } from '@incoder/kanban';

const columns = ref<KanbanColumn[]>([
  { id: 1, title: 'To Do', order: 0 },
  { id: 2, title: 'Done', order: 1 }
]);

const cards = ref<KanbanCard[]>([
  { id: 1, columnId: 1, title: 'First task', order: 0 }
]);
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    v-model:cards="cards"
  />
</template>
```

### With All Card Features

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { KanbanBoard, CardPriority } from '@incoder/kanban';
import type { KanbanColumn, KanbanCard } from '@incoder/kanban';

const columns = ref<KanbanColumn[]>([
  {
    id: 'todo',
    title: 'To Do',
    order: 0,
    icon: 'pi pi-list',
    color: '#3b82f6',
    wipLimit: 5
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    order: 1,
    icon: 'pi pi-spin pi-spinner',
    color: '#f59e0b',
    wipLimit: 3
  },
  {
    id: 'done',
    title: 'Done',
    order: 2,
    icon: 'pi pi-check',
    color: '#10b981'
  }
]);

const cards = ref<KanbanCard[]>([
  {
    id: 1,
    columnId: 'todo',
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication with refresh tokens',
    order: 0,
    priority: CardPriority.HIGH,
    tags: [
      { id: 1, label: 'Backend', color: '#3b82f6' },
      { id: 2, label: 'Security', color: '#ef4444' }
    ],
    assignees: [
      { id: 1, name: 'John Doe', avatar: '/avatars/john.jpg', email: 'john@example.com' }
    ],
    dueDate: '2024-01-15',
    metadata: {
      estimatedHours: 8,
      storyPoints: 5
    }
  }
]);
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    v-model:cards="cards"
  />
</template>
```

## Handling Events

### Card Movement with API Persistence

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { KanbanBoard } from '@incoder/kanban';
import type { CardMoveEvent, KanbanCard } from '@incoder/kanban';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const cards = ref<KanbanCard[]>([/* ... */]);

const handleCardMoved = async (event: CardMoveEvent) => {
  try {
    // Optimistic update already done by v-model
    
    // Persist to backend
    await fetch(`/api/cards/${event.card.id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({
        columnId: event.toColumnId,
        order: event.toIndex
      })
    });
    
    toast.add({
      severity: 'success',
      summary: 'Card Moved',
      detail: `${event.card.title} moved successfully`,
      life: 3000
    });
  } catch (error) {
    // Revert on error
    cards.value = cards.value.map(card => 
      card.id === event.card.id 
        ? { ...card, columnId: event.fromColumnId }
        : card
    );
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to move card',
      life: 3000
    });
  }
};
</script>

<template>
  <KanbanBoard
    v-model:cards="cards"
    v-model:columns="columns"
    @card-moved="handleCardMoved"
  />
</template>
```

### Opening Card Details on Click

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { CardClickEvent } from '@incoder/kanban';
import Dialog from 'primevue/dialog';

const showCardDialog = ref(false);
const selectedCard = ref<KanbanCard | null>(null);

const handleCardClick = (event: CardClickEvent) => {
  selectedCard.value = event.card;
  showCardDialog.value = true;
};
</script>

<template>
  <div>
    <KanbanBoard
      v-model:cards="cards"
      v-model:columns="columns"
      @card-click="handleCardClick"
    />
    
    <Dialog
      v-model:visible="showCardDialog"
      :header="selectedCard?.title"
      :style="{ width: '50vw' }"
    >
      <div v-if="selectedCard">
        <p>{{ selectedCard.description }}</p>
        <!-- Card details form -->
      </div>
    </Dialog>
  </div>
</template>
```

## Custom Slots

### Custom Card with Actions

```vue
<template>
  <KanbanBoard
    v-model:cards="cards"
    v-model:columns="columns"
  >
    <template #card="{ card, column }">
      <div class="custom-card">
        <div class="card-header">
          <h4>{{ card.title }}</h4>
          <Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            @click="openCardMenu(card)"
          />
        </div>
        
        <p class="card-description">{{ card.description }}</p>
        
        <div class="card-footer">
          <div class="card-assignees">
            <Avatar
              v-for="assignee in card.assignees"
              :key="assignee.id"
              :image="assignee.avatar"
              :label="assignee.name.charAt(0)"
              shape="circle"
            />
          </div>
          
          <Chip
            v-if="card.priority"
            :label="card.priority"
            :class="`priority-${card.priority}`"
          />
        </div>
      </div>
    </template>
  </KanbanBoard>
</template>

<style scoped>
.custom-card {
  padding: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin: 0.5rem 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
}
</style>
```

### Custom Column Header with Actions

```vue
<template>
  <KanbanBoard
    v-model:cards="cards"
    v-model:columns="columns"
  >
    <template #column-header="{ column, cardCount, isOverLimit }">
      <div class="custom-column-header">
        <div class="header-left">
          <i :class="column.icon"></i>
          <h3>{{ column.title }}</h3>
          <Badge
            :value="cardCount"
            :severity="isOverLimit ? 'danger' : 'info'"
          />
        </div>
        
        <div class="header-actions">
          <Button
            icon="pi pi-plus"
            text
            rounded
            size="small"
            @click="addCardToColumn(column.id)"
          />
          <Button
            icon="pi pi-cog"
            text
            rounded
            size="small"
            @click="openColumnSettings(column)"
          />
        </div>
      </div>
    </template>
  </KanbanBoard>
</template>

<style scoped>
.custom-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 0.25rem;
}
</style>
```

### Board Toolbar with Filters

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const searchQuery = ref('');
const selectedPriority = ref<string | null>(null);

const filteredCards = computed(() => {
  return cards.value.filter(card => {
    const matchesSearch = !searchQuery.value || 
      card.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesPriority = !selectedPriority.value || 
      card.priority === selectedPriority.value;
    return matchesSearch && matchesPriority;
  });
});
</script>

<template>
  <KanbanBoard
    v-model:cards="filteredCards"
    v-model:columns="columns"
  >
    <template #toolbar="{ cards, columns }">
      <div class="board-toolbar">
        <h2>Project Board</h2>
        
        <div class="toolbar-actions">
          <InputText
            v-model="searchQuery"
            placeholder="Search cards..."
            class="search-input"
          >
            <template #prepend>
              <i class="pi pi-search"></i>
            </template>
          </InputText>
          
          <Dropdown
            v-model="selectedPriority"
            :options="priorityOptions"
            placeholder="Filter by priority"
            show-clear
          />
          
          <Button
            label="Add Card"
            icon="pi pi-plus"
            @click="addCard"
          />
        </div>
      </div>
    </template>
  </KanbanBoard>
</template>

<style scoped>
.board-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.toolbar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  width: 250px;
}
</style>
```

## Swimlanes

### Basic Swimlanes Setup

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { KanbanSwimlane } from '@incoder/kanban';

const swimlanes = ref<KanbanSwimlane[]>([
  { id: 'team-a', title: 'Team A', order: 0 },
  { id: 'team-b', title: 'Team B', order: 1 },
  { id: 'team-c', title: 'Team C', order: 2 }
]);

const cards = ref<KanbanCard[]>([
  {
    id: 1,
    columnId: 'todo',
    swimlaneId: 'team-a',
    title: 'Task for Team A',
    order: 0
  },
  {
    id: 2,
    columnId: 'todo',
    swimlaneId: 'team-b',
    title: 'Task for Team B',
    order: 0
  }
]);

const options = ref({
  enableSwimlanes: true
});
</script>

<template>
  <KanbanBoard
    v-model:cards="cards"
    v-model:columns="columns"
    v-model:swimlanes="swimlanes"
    :options="options"
  />
</template>
```

## Advanced Features

### Disabling Drag for Locked Cards

```vue
<script setup lang="ts">
const cards = ref<KanbanCard[]>([
  {
    id: 1,
    columnId: 'done',
    title: 'Completed and locked',
    draggable: false,  // Cannot be dragged
    order: 0,
    metadata: {
      locked: true,
      lockedBy: 'admin',
      lockedAt: new Date()
    }
  }
]);
</script>

<template>
  <KanbanBoard
    v-model:cards="cards"
    v-model:columns="columns"
  >
    <template #card="{ card }">
      <div class="card" :class="{ locked: !card.draggable }">
        <i v-if="!card.draggable" class="pi pi-lock"></i>
        <h4>{{ card.title }}</h4>
      </div>
    </template>
  </KanbanBoard>
</template>
```

### Dynamic WIP Limits

```vue
<script setup lang="ts">
import { computed } from 'vue';

const columns = ref<KanbanColumn[]>([
  { id: 'in-progress', title: 'In Progress', order: 1, wipLimit: 3 }
]);

// Dynamically update WIP limit
const updateWipLimit = (columnId: string, newLimit: number) => {
  columns.value = columns.value.map(col =>
    col.id === columnId ? { ...col, wipLimit: newLimit } : col
  );
};
</script>

<template>
  <div>
    <KanbanBoard
      v-model:cards="cards"
      v-model:columns="columns"
    >
      <template #column-header="{ column, cardCount, isOverLimit }">
        <div>
          <h3>{{ column.title }}</h3>
          <div v-if="column.wipLimit">
            <span :class="{ 'text-danger': isOverLimit }">
              {{ cardCount }} / {{ column.wipLimit }}
            </span>
            <Button
              icon="pi pi-pencil"
              text
              @click="openWipLimitDialog(column)"
            />
          </div>
        </div>
      </template>
    </KanbanBoard>
  </div>
</template>
```

### Loading State

```vue
<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(true);
const cards = ref<KanbanCard[]>([]);
const columns = ref<KanbanColumn[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    const [columnsData, cardsData] = await Promise.all([
      fetch('/api/columns').then(r => r.json()),
      fetch('/api/cards').then(r => r.json())
    ]);
    columns.value = columnsData;
    cards.value = cardsData;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <KanbanBoard
    v-model:cards="cards"
    v-model:columns="columns"
    :loading="loading"
  />
</template>
```

### Real-time Updates with WebSockets

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { KanbanCard } from '@incoder/kanban';

const cards = ref<KanbanCard[]>([]);
let ws: WebSocket;

onMounted(() => {
  ws = new WebSocket('ws://localhost:3000/kanban');
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    
    switch (update.type) {
      case 'card-added':
        cards.value.push(update.card);
        break;
      case 'card-updated':
        cards.value = cards.value.map(card =>
          card.id === update.card.id ? update.card : card
        );
        break;
      case 'card-deleted':
        cards.value = cards.value.filter(card => card.id !== update.cardId);
        break;
    }
  };
});

onUnmounted(() => {
  ws?.close();
});

const handleCardMoved = (event: CardMoveEvent) => {
  // Send update to other clients
  ws.send(JSON.stringify({
    type: 'card-moved',
    event
  }));
};
</script>

<template>
  <KanbanBoard
    v-model:cards="cards"
    v-model:columns="columns"
    @card-moved="handleCardMoved"
  />
</template>
```
