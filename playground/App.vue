<script setup lang="ts">
/**
 * Playground App
 *
 * Interactive demo of the Kanban Board component
 */

import { ref } from "vue";
import KanbanBoard from "../src/components/KanbanBoard.vue";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import Popover from "primevue/popover";
import { sampleColumns, sampleCards } from "./sampleData";
import type {
  KanbanColumn,
  KanbanCard,
  KanbanBoardOptions,
  CardMoveEvent,
  CardClickEvent,
} from "../src/types/kanban";

// Sample columns
const columns = ref<KanbanColumn[]>(sampleColumns);

// Sample cards
const cards = ref<KanbanCard[]>(sampleCards);

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

// Settings overlay panel ref
const settingsPanel = ref();

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
 * Toggle settings panel
 */
const toggleSettings = (event: Event) => {
  settingsPanel.value.toggle(event);
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
            <Button
              @click="toggleSettings"
              icon="pi pi-cog"
              label="Settings"
              size="small"
              outlined
            />
            <Popover ref="settingsPanel">
              <div class="settings-panel">
                <h4>Board Settings</h4>
                <div class="settings-options">
                  <div class="flex items-center gap-2 mb-3">
                    <Checkbox
                      v-model="options.enableDragDrop"
                      inputId="dragDrop"
                      :binary="true"
                    />
                    <label for="dragDrop">Enable Drag & Drop</label>
                  </div>

                  <div class="flex items-center gap-2 mb-3">
                    <Checkbox
                      v-model="options.showCardCount"
                      inputId="cardCount"
                      :binary="true"
                    />
                    <label for="cardCount">Show Card Count</label>
                  </div>

                  <div class="flex items-center gap-2 mb-3">
                    <Checkbox
                      v-model="options.showWipLimit"
                      inputId="wipLimit"
                      :binary="true"
                    />
                    <label for="wipLimit">Show WIP Limits</label>
                  </div>

                  <div class="flex items-center gap-2 mb-3">
                    <Checkbox
                      v-model="loading"
                      inputId="loading"
                      :binary="true"
                    />
                    <label for="loading">Loading State</label>
                  </div>
                </div>

                <div class="settings-divider"></div>

                <Button
                  @click="clearLog"
                  label="Clear Event Log"
                  size="small"
                  severity="secondary"
                  class="w-full"
                />
              </div>
            </Popover>
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
