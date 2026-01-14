<script setup lang="ts">
/**
 * Playground App
 *
 * Interactive demo of the Kanban Board component
 */

import { ref, computed } from "vue";
import KanbanBoard from "../src/components/KanbanBoard.vue";
import type {
  KanbanColumn,
  KanbanCard,
  KanbanBoardOptions,
  CardMoveEvent,
  CardClickEvent,
  CardPriority,
} from "../src/types/kanban";
import { CardPriority as Priority } from "../src/types/kanban";

// Sample columns
const columns = ref<KanbanColumn[]>([
  {
    id: "backlog",
    title: "Backlog",
    order: 0,
    icon: "pi pi-inbox",
    color: "#64748b",
    wipLimit: 10,
  },
  {
    id: "todo",
    title: "To Do",
    order: 1,
    icon: "pi pi-list",
    color: "#3b82f6",
  },
  {
    id: "in-progress",
    title: "In Progress",
    order: 2,
    icon: "pi pi-spin pi-spinner",
    color: "#f59e0b",
    wipLimit: 3,
  },
  {
    id: "review",
    title: "Review",
    order: 3,
    icon: "pi pi-eye",
    color: "#8b5cf6",
    wipLimit: 5,
  },
  {
    id: "done",
    title: "Done",
    order: 4,
    icon: "pi pi-check",
    color: "#10b981",
  },
]);

// Sample cards
const cards = ref<KanbanCard[]>([
  {
    id: 1,
    columnId: "backlog",
    title: "Implement user authentication",
    description: "Add JWT-based authentication system with refresh tokens",
    order: 0,
    priority: Priority.HIGH,
    tags: [
      { id: 1, label: "Backend", color: "#3b82f6" },
      { id: 2, label: "Security", color: "#ef4444" },
    ],
    assignees: [{ id: 1, name: "John Doe", avatar: "" }],
    dueDate: "2024-01-15",
  },
  {
    id: 2,
    columnId: "backlog",
    title: "Design dashboard mockups",
    description: "Create high-fidelity mockups for the analytics dashboard",
    order: 1,
    priority: Priority.MEDIUM,
    tags: [{ id: 3, label: "Design", color: "#8b5cf6" }],
    assignees: [{ id: 2, name: "Jane Smith", avatar: "" }],
  },
  {
    id: 3,
    columnId: "todo",
    title: "Setup CI/CD pipeline",
    description:
      "Configure GitHub Actions for automated testing and deployment",
    order: 0,
    priority: Priority.HIGH,
    tags: [{ id: 4, label: "DevOps", color: "#f59e0b" }],
  },
  {
    id: 4,
    columnId: "todo",
    title: "Write API documentation",
    description: "Document all REST endpoints using OpenAPI specification",
    order: 1,
    priority: Priority.LOW,
    tags: [{ id: 5, label: "Documentation", color: "#06b6d4" }],
  },
  {
    id: 5,
    columnId: "in-progress",
    title: "Implement real-time notifications",
    description: "Add WebSocket support for push notifications",
    order: 0,
    priority: Priority.HIGHEST,
    tags: [
      { id: 6, label: "Frontend", color: "#10b981" },
      { id: 7, label: "Backend", color: "#3b82f6" },
    ],
    assignees: [
      { id: 1, name: "John Doe", avatar: "" },
      { id: 3, name: "Bob Johnson", avatar: "" },
    ],
    dueDate: "2024-01-10",
  },
  {
    id: 6,
    columnId: "in-progress",
    title: "Optimize database queries",
    description:
      "Add indexes and optimize slow queries identified in monitoring",
    order: 1,
    priority: Priority.MEDIUM,
    tags: [
      { id: 2, label: "Backend", color: "#3b82f6" },
      { id: 8, label: "Performance", color: "#f59e0b" },
    ],
    assignees: [{ id: 4, name: "Alice Brown", avatar: "" }],
  },
  {
    id: 7,
    columnId: "review",
    title: "User profile page",
    description: "New user profile page with edit capabilities",
    order: 0,
    priority: Priority.MEDIUM,
    tags: [{ id: 6, label: "Frontend", color: "#10b981" }],
    assignees: [{ id: 2, name: "Jane Smith", avatar: "" }],
  },
  {
    id: 8,
    columnId: "done",
    title: "Project setup",
    description: "Initialize project with Vue 3, TypeScript, and Vite",
    order: 0,
    priority: Priority.HIGH,
    tags: [{ id: 9, label: "Setup", color: "#64748b" }],
  },
  {
    id: 9,
    columnId: "done",
    title: "Install dependencies",
    description: "Install and configure PrimeVue and other core dependencies",
    order: 1,
    tags: [{ id: 9, label: "Setup", color: "#64748b" }],
  },
]);

// Board options
const options = ref<KanbanBoardOptions>({
  enableDragDrop: true,
  enableColumnDrag: false,
  showCardCount: true,
  showWipLimit: true,
  horizontalScroll: true,
  columnWidth: "300px",
});

// Loading state
const loading = ref(false);

// Event log
const eventLog = ref<string[]>([]);

/**
 * Handle card moved
 */
const handleCardMoved = (event: CardMoveEvent) => {
  console.log("Card moved:", event);
  eventLog.value.unshift(
    `Moved "${event.card.title}" from ${getColumnTitle(
      event.fromColumnId
    )} to ${getColumnTitle(event.toColumnId)}`
  );

  // Keep only last 10 events
  if (eventLog.value.length > 10) {
    eventLog.value = eventLog.value.slice(0, 10);
  }
};

/**
 * Handle card click
 */
const handleCardClick = (event: CardClickEvent) => {
  console.log("Card clicked:", event.card);
  eventLog.value.unshift(`Clicked card: "${event.card.title}"`);

  if (eventLog.value.length > 10) {
    eventLog.value = eventLog.value.slice(0, 10);
  }
};

/**
 * Get column title by ID
 */
const getColumnTitle = (columnId: string | number) => {
  const column = columns.value.find((c) => c.id === columnId);
  return column ? column.title : "Unknown";
};

/**
 * Clear event log
 */
const clearLog = () => {
  eventLog.value = [];
};

/**
 * Toggle drag & drop
 */
const toggleDragDrop = () => {
  options.value.enableDragDrop = !options.value.enableDragDrop;
};
</script>

<template>
  <div class="playground">
    <!-- Header -->
    <div class="playground-header">
      <h1>Kanban Board Playground</h1>
      <p>Interactive demo of the Vue 3 Kanban component with PrimeVue</p>
    </div>

    <!-- Controls -->
    <div class="playground-controls">
      <div class="control-group">
        <label>
          <input v-model="options.enableDragDrop" type="checkbox" />
          Enable Drag & Drop
        </label>

        <label>
          <input v-model="options.showCardCount" type="checkbox" />
          Show Card Count
        </label>

        <label>
          <input v-model="options.showWipLimit" type="checkbox" />
          Show WIP Limits
        </label>

        <label>
          <input v-model="loading" type="checkbox" />
          Loading State
        </label>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="playground-board">
      <KanbanBoard
        v-model:columns="columns"
        v-model:cards="cards"
        :options="options"
        :loading="loading"
        @card-moved="handleCardMoved"
        @card-click="handleCardClick"
      >
        <!-- Custom toolbar -->
        <template #toolbar="{ columns: cols, cards: cds }">
          <div class="board-toolbar">
            <div>
              <strong>{{ cols.length }}</strong> columns ·
              <strong>{{ cds.length }}</strong> cards
            </div>
            <button @click="clearLog" class="clear-button">
              Clear Event Log
            </button>
          </div>
        </template>
      </KanbanBoard>
    </div>

    <!-- Event Log -->
    <div class="playground-log">
      <h3>Event Log</h3>
      <div class="log-content">
        <div v-if="eventLog.length === 0" class="log-empty">
          No events yet. Try dragging cards or clicking on them.
        </div>
        <div v-for="(event, index) in eventLog" :key="index" class="log-item">
          <i class="pi pi-circle-fill"></i>
          {{ event }}
        </div>
      </div>
    </div>
  </div>
</template>
