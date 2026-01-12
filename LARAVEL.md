# Laravel Integration Guide

This guide covers integrating @incoder/kanban with Laravel applications using Inertia.js and Vue 3.

## Prerequisites

- Laravel 10+ or 11+
- Inertia.js with Vue 3
- Node.js 18+

## Installation

### 1. Install the Package

```bash
npm install @incoder/kanban vue primevue @primevue/themes primeicons
```

### 2. Configure PrimeVue in Your Laravel App

In `resources/js/app.js` or `resources/js/app.ts`:

```typescript
import { createApp, h } from "vue";
import { createInertiaApp } from "@inertiajs/vue3";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import "primeicons/primeicons.css";

createInertiaApp({
  title: (title) => `${title} - ${import.meta.env.VITE_APP_NAME}`,
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.vue`,
      import.meta.glob("./Pages/**/*.vue")
    ),
  setup({ el, App, props, plugin }) {
    return createApp({ render: () => h(App, props) })
      .use(plugin)
      .use(PrimeVue, {
        theme: {
          preset: Aura,
          options: {
            prefix: "p",
            darkModeSelector: ".dark-mode",
            cssLayer: false,
          },
        },
      })
      .mount(el);
  },
  progress: {
    color: "#4B5563",
  },
});
```

### 3. Import Kanban Styles

Add to your `resources/js/app.js`:

```typescript
import "@incoder/kanban/style.css";
```

Or in your `resources/css/app.css`:

```css
@import "@incoder/kanban/style.css";
```

## Basic Usage in Laravel Page

Create a Kanban board component in `resources/js/Pages/Kanban/Index.vue`:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { router } from "@inertiajs/vue3";
import { KanbanBoard } from "@incoder/kanban";
import "@incoder/kanban/style.css";
import type { KanbanColumn, KanbanCard, CardMoveEvent } from "@incoder/kanban";

interface Props {
  columns: KanbanColumn[];
  cards: KanbanCard[];
}

const props = defineProps<Props>();

// Local state (controlled by Vue)
const columns = ref(props.columns);
const cards = ref(props.cards);

// Handle card movement - sync with Laravel backend
const handleCardMoved = (event: CardMoveEvent) => {
  router.post(
    "/api/kanban/move-card",
    {
      card_id: event.card.id,
      from_column: event.fromColumnId,
      to_column: event.toColumnId,
      new_order: event.newOrder,
    },
    {
      preserveScroll: true,
      onSuccess: () => {
        // Update local state
        cards.value = cards.value.map((card) =>
          card.id === event.card.id
            ? { ...card, columnId: event.toColumnId, order: event.newOrder }
            : card
        );
      },
    }
  );
};

const handleCardClick = (event: { card: KanbanCard }) => {
  router.visit(`/tasks/${event.card.id}`);
};
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Project Board</h1>

    <KanbanBoard
      v-model:columns="columns"
      v-model:cards="cards"
      :options="{
        enableDragDrop: true,
        showCardCount: true,
        showWipLimit: true,
      }"
      @card-moved="handleCardMoved"
      @card-click="handleCardClick"
    />
  </div>
</template>
```

## Laravel Backend Setup

### Controller Example

```php
<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KanbanController extends Controller
{
    public function index()
    {
        $columns = [
            ['id' => 'todo', 'title' => 'To Do', 'order' => 0],
            ['id' => 'in_progress', 'title' => 'In Progress', 'order' => 1, 'wipLimit' => 3],
            ['id' => 'done', 'title' => 'Done', 'order' => 2],
        ];

        $cards = Task::orderBy('order')->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'columnId' => $task->status,
                'title' => $task->title,
                'description' => $task->description,
                'order' => $task->order,
                'priority' => $task->priority,
                'assignees' => $task->assignees->map(fn($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->avatar_url
                ]),
                'tags' => $task->tags->map(fn($tag) => [
                    'id' => $tag->id,
                    'label' => $tag->name,
                    'color' => $tag->color
                ]),
                'dueDate' => $task->due_date?->toISOString(),
            ];
        });

        return Inertia::render('Kanban/Index', [
            'columns' => $columns,
            'cards' => $cards
        ]);
    }

    public function moveCard(Request $request)
    {
        $validated = $request->validate([
            'card_id' => 'required|exists:tasks,id',
            'to_column' => 'required|string',
            'new_order' => 'required|integer'
        ]);

        $task = Task::findOrFail($validated['card_id']);
        $task->status = $validated['to_column'];
        $task->order = $validated['new_order'];
        $task->save();

        return back();
    }
}
```

### Routes

```php
// routes/web.php
use App\Http\Controllers\KanbanController;

Route::middleware(['auth'])->group(function () {
    Route::get('/kanban', [KanbanController::class, 'index'])->name('kanban.index');
    Route::post('/api/kanban/move-card', [KanbanController::class, 'moveCard']);
});
```

### Database Migration

```php
// database/migrations/xxxx_create_tasks_table.php
Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('description')->nullable();
    $table->string('status'); // Maps to columnId
    $table->integer('order')->default(0);
    $table->enum('priority', ['lowest', 'low', 'medium', 'high', 'highest'])->default('medium');
    $table->date('due_date')->nullable();
    $table->timestamps();

    $table->index(['status', 'order']);
});
```

## Advanced Features

### Real-time Updates with Laravel Broadcasting

```vue
<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  window.Echo.channel("kanban-board").listen("CardMoved", (event) => {
    // Update local state when other users move cards
    const cardIndex = cards.value.findIndex((c) => c.id === event.cardId);
    if (cardIndex !== -1) {
      cards.value[cardIndex].columnId = event.toColumn;
      cards.value[cardIndex].order = event.newOrder;
    }
  });
});
</script>
```

### Custom Card Slots with Blade Data

```vue
<template>
  <KanbanBoard v-model:columns="columns" v-model:cards="cards">
    <template #card="{ card }">
      <div class="p-3">
        <h3>{{ card.title }}</h3>
        <div class="flex gap-2 mt-2">
          <span
            v-for="tag in card.tags"
            :key="tag.id"
            class="px-2 py-1 text-xs rounded"
            :style="{ backgroundColor: tag.color }"
          >
            {{ tag.label }}
          </span>
        </div>
      </div>
    </template>
  </KanbanBoard>
</template>
```

## TypeScript Support

The library is fully typed. Create type definitions for your Laravel models:

```typescript
// resources/js/types/kanban.ts
import type { KanbanCard as BaseCard } from "@incoder/kanban";

export interface Task extends BaseCard {
  id: number;
  columnId: string;
  title: string;
  description?: string;
  order: number;
  priority: "lowest" | "low" | "medium" | "high" | "highest";
  // Add your custom fields
  project_id?: number;
  estimated_hours?: number;
}
```

## Troubleshooting

### CSS Not Loading

Make sure you've added the import in your `app.js` or `app.css`:

```typescript
import "@incoder/kanban/style.css";
```

### PrimeVue Theme Not Applied

Verify PrimeVue is configured with a preset:

```typescript
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
```

### Build Errors

Ensure your `vite.config.js` processes Vue files:

```javascript
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    laravel({
      input: "resources/js/app.ts",
      refresh: true,
    }),
    vue({
      template: {
        transformAssetUrls: {
          base: null,
          includeAbsolute: false,
        },
      },
    }),
  ],
});
```

## Performance Tips

1. **Lazy load the Kanban component** for better initial page load:

```typescript
const KanbanBoard = defineAsyncComponent(() =>
  import("@incoder/kanban").then((m) => m.KanbanBoard)
);
```

2. **Use Inertia's `preserveScroll`** to prevent page jumps during updates

3. **Debounce card movements** if users drag frequently:

```typescript
import { useDebounceFn } from "@vueuse/core";

const debouncedMove = useDebounceFn((event) => {
  router.post("/api/kanban/move-card", {
    /* ... */
  });
}, 300);
```

## Example Project

Check out a complete Laravel + Inertia + @incoder/kanban example at:
https://github.com/yourusername/laravel-kanban-example (coming soon)
