<script setup lang="ts">
/**
 * KanbanBoard Component
 * 
 * Main component that orchestrates the entire Kanban board.
 * Manages columns, cards, swimlanes, drag-and-drop, and emits events.
 * Fully controlled via props with optional internal state management.
 */

import { computed, toRef } from 'vue';
import KanbanColumn from './KanbanColumn.vue';
import { useKanbanState } from '../composables/useKanbanState';
import { useKanbanDrag } from '../composables/useKanbanDrag';
import type {
  KanbanColumn as IKanbanColumn,
  KanbanCard,
  KanbanSwimlane,
  KanbanBoardOptions,
  CardMoveEvent,
  ColumnMoveEvent,
  CardClickEvent,
  CardUpdateEvent,
  ColumnUpdateEvent,
  BoardChangeEvent,
  DragStartEvent,
  DragEndEvent
} from '../types/kanban';

interface Props {
  columns: IKanbanColumn[];
  cards: KanbanCard[];
  swimlanes?: KanbanSwimlane[];
  options?: KanbanBoardOptions;
  loading?: boolean;
}

interface Emits {
  (e: 'update:columns', columns: IKanbanColumn[]): void;
  (e: 'update:cards', cards: KanbanCard[]): void;
  (e: 'update:swimlanes', swimlanes: KanbanSwimlane[]): void;
  (e: 'card-moved', event: CardMoveEvent): void;
  (e: 'column-moved', event: ColumnMoveEvent): void;
  (e: 'card-click', event: CardClickEvent): void;
  (e: 'card-update', event: CardUpdateEvent): void;
  (e: 'column-update', event: ColumnUpdateEvent): void;
  (e: 'board-change', event: BoardChangeEvent): void;
  (e: 'drag-start', event: DragStartEvent): void;
  (e: 'drag-end', event: DragEndEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  swimlanes: () => [],
  options: () => ({}),
  loading: false
});

const emit = defineEmits<Emits>();

// Convert props to refs for composables
const columnsRef = toRef(props, 'columns');
const cardsRef = toRef(props, 'cards');
const swimlanesRef = toRef(props, 'swimlanes');
const optionsRef = toRef(props, 'options');

// Initialize state management
const state = useKanbanState({
  columns: columnsRef,
  cards: cardsRef,
  swimlanes: swimlanesRef,
  options: optionsRef
});

// Initialize drag and drop
const drag = useKanbanDrag({
  enableDragDrop: computed(() => optionsRef.value.enableDragDrop !== false),
  enableColumnDrag: computed(() => optionsRef.value.enableColumnDrag !== false),
  onDragStart: (event: DragStartEvent) => {
    emit('drag-start', event);
  },
  onDragEnd: (event: DragEndEvent) => {
    emit('drag-end', event);
  },
  onCardMoved: (event: CardMoveEvent) => {
    // Update cards
    const updatedCards = state.moveCard(event);
    emit('update:cards', updatedCards);
    emit('card-moved', event);
    
    // Emit board change
    emitBoardChange(updatedCards);
  }
});

/**
 * Computed options with defaults
 */
const boardOptions = computed(() => ({
  enableDragDrop: true,
  enableColumnDrag: false,
  enableCardReordering: true,
  enableSwimlanes: false,
  horizontalScroll: true,
  showEmptyColumns: true,
  showCardCount: true,
  showWipLimit: true,
  enableKeyboardNavigation: true,
  columnWidth: '300px',
  ...optionsRef.value
}));

/**
 * Check if swimlanes are enabled and have data
 */
const swimlanesEnabled = computed(() => {
  return boardOptions.value.enableSwimlanes && 
         state.effectiveSwimlanes.value.length > 0;
});

/**
 * Board CSS classes
 */
const boardClasses = computed(() => ({
  'kanban-board-horizontal-scroll': boardOptions.value.horizontalScroll,
  'kanban-board-swimlanes': swimlanesEnabled.value,
  'kanban-board-loading': props.loading,
  [boardOptions.value.boardClass || '']: !!boardOptions.value.boardClass
}));

/**
 * Column style
 */
const columnStyle = computed(() => ({
  width: boardOptions.value.columnWidth
}));

/**
 * Handle card click
 */
const handleCardClick = (card: KanbanCard, event: MouseEvent) => {
  const clickEvent: CardClickEvent = { card, event };
  emit('card-click', clickEvent);
};

/**
 * Handle card drag start
 */
const handleCardDragStart = (card: KanbanCard, event: DragEvent) => {
  drag.startCardDrag(card, event);
};

/**
 * Handle card drag end
 */
const handleCardDragEnd = (_card: KanbanCard, event: DragEvent) => {
  drag.handleDragEnd(event);
};

/**
 * Handle column drag over
 */
const handleColumnDragOver = (
  columnId: string | number,
  swimlaneId: string | number | undefined,
  event: DragEvent
) => {
  drag.handleDragOver(event, columnId, swimlaneId);
};

/**
 * Handle column drag leave
 */
const handleColumnDragLeave = (event: DragEvent) => {
  drag.handleDragLeave(event);
};

/**
 * Handle drop on column
 */
const handleColumnDrop = (
  columnId: string | number,
  swimlaneId: string | number | undefined,
  event: DragEvent
) => {
  drag.handleDrop(
    event,
    columnId,
    swimlaneId,
    state.getCardById,
    (colId, swimId) => state.getCardsForColumn(colId, swimId)
  );
};

/**
 * Emit board change event
 */
const emitBoardChange = (updatedCards?: KanbanCard[]) => {
  const boardChange: BoardChangeEvent = {
    columns: state.currentColumns.value,
    cards: updatedCards || state.currentCards.value,
    swimlanes: swimlanesEnabled.value ? state.currentSwimlanes.value : undefined
  };
  emit('board-change', boardChange);
};

/**
 * Get cards for a specific column and swimlane
 */
const getColumnCards = (columnId: string | number, swimlaneId?: string | number) => {
  return state.getCardsForColumn(columnId, swimlaneId);
};
</script>

<template>
  <div
    class="kanban-board"
    :class="boardClasses"
    role="main"
    aria-label="Kanban Board"
  >
    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="kanban-board-loading-overlay"
    >
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
    </div>

    <!-- Board toolbar slot -->
    <div
      v-if="$slots.toolbar"
      class="kanban-board-toolbar"
    >
      <slot
        name="toolbar"
        :columns="state.currentColumns.value"
        :cards="state.currentCards.value"
        :swimlanes="state.currentSwimlanes.value"
      ></slot>
    </div>

    <!-- Board container -->
    <div class="kanban-board-container">
      <!-- Without swimlanes -->
      <div
        v-if="!swimlanesEnabled"
        class="kanban-board-columns"
      >
        <KanbanColumn
          v-for="column in state.sortedColumns.value"
          :key="column.id"
          :column="column"
          :cards="getColumnCards(column.id)"
          :draggable="boardOptions.enableDragDrop"
          :show-card-count="boardOptions.showCardCount"
          :show-wip-limit="boardOptions.showWipLimit"
          :is-dragging-card="drag.dragState.value.isDragging"
          :style="columnStyle"
          @card-click="handleCardClick"
          @card-dragstart="handleCardDragStart"
          @card-dragend="handleCardDragEnd"
          @column-dragover="handleColumnDragOver(column.id, undefined, $event)"
          @column-dragleave="handleColumnDragLeave"
          @column-drop="handleColumnDrop(column.id, undefined, $event)"
        >
          <!-- Pass through column header slot -->
          <template #header="slotProps">
            <slot name="column-header" v-bind="slotProps"></slot>
          </template>

          <!-- Pass through column footer slot -->
          <template #footer="slotProps">
            <slot name="column-footer" v-bind="slotProps"></slot>
          </template>

          <!-- Pass through card slot -->
          <template #card="slotProps">
            <slot name="card" v-bind="slotProps"></slot>
          </template>

          <!-- Pass through card overlay slot -->
          <template #card-overlay="slotProps">
            <slot name="card-overlay" v-bind="slotProps"></slot>
          </template>

          <!-- Pass through empty column slot -->
          <template #empty="slotProps">
            <slot name="empty-column" v-bind="slotProps"></slot>
          </template>
        </KanbanColumn>
      </div>

      <!-- With swimlanes -->
      <div
        v-else
        class="kanban-board-swimlanes"
      >
        <div
          v-for="swimlane in state.effectiveSwimlanes.value"
          :key="swimlane.id"
          class="kanban-board-swimlane"
          :class="{ 'kanban-board-swimlane-collapsed': swimlane.collapsed }"
        >
          <!-- Swimlane header -->
          <div class="kanban-board-swimlane-header">
            <h3 class="kanban-board-swimlane-title">{{ swimlane.title }}</h3>
          </div>

          <!-- Swimlane columns -->
          <div class="kanban-board-swimlane-columns">
            <KanbanColumn
              v-for="column in state.sortedColumns.value"
              :key="`${swimlane.id}-${column.id}`"
              :column="column"
              :cards="getColumnCards(column.id, swimlane.id)"
              :draggable="boardOptions.enableDragDrop"
              :show-card-count="boardOptions.showCardCount"
              :show-wip-limit="boardOptions.showWipLimit"
              :is-dragging-card="drag.dragState.value.isDragging"
              :style="columnStyle"
              @card-click="handleCardClick"
              @card-dragstart="handleCardDragStart"
              @card-dragend="handleCardDragEnd"
              @column-dragover="handleColumnDragOver(column.id, swimlane.id, $event)"
              @column-dragleave="handleColumnDragLeave"
              @column-drop="handleColumnDrop(column.id, swimlane.id, $event)"
            >
              <!-- Pass through slots -->
              <template #header="slotProps">
                <slot name="column-header" v-bind="slotProps"></slot>
              </template>

              <template #footer="slotProps">
                <slot name="column-footer" v-bind="slotProps"></slot>
              </template>

              <template #card="slotProps">
                <slot name="card" v-bind="slotProps"></slot>
              </template>

              <template #card-overlay="slotProps">
                <slot name="card-overlay" v-bind="slotProps"></slot>
              </template>

              <template #empty="slotProps">
                <slot name="empty-column" v-bind="slotProps"></slot>
              </template>
            </KanbanColumn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * Board styles using PrimeVue design tokens
 */

.kanban-board {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-ground);
  font-family: var(--font-family);
}

.kanban-board-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.kanban-board-toolbar {
  padding: 1rem;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}

.kanban-board-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.kanban-board-columns {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
}

.kanban-board-horizontal-scroll .kanban-board-columns,
.kanban-board-horizontal-scroll .kanban-board-swimlane-columns {
  overflow-x: auto;
  overflow-y: hidden;
}

.kanban-board-swimlanes {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
}

.kanban-board-swimlane {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kanban-board-swimlane-header {
  padding: 0.75rem 0;
  border-bottom: 2px solid var(--surface-border);
}

.kanban-board-swimlane-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.kanban-board-swimlane-columns {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
}

.kanban-board-swimlane-collapsed .kanban-board-swimlane-columns {
  display: none;
}

/* Scrollbar styling */
.kanban-board-columns::-webkit-scrollbar,
.kanban-board-swimlane-columns::-webkit-scrollbar,
.kanban-board-swimlanes::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.kanban-board-columns::-webkit-scrollbar-track,
.kanban-board-swimlane-columns::-webkit-scrollbar-track,
.kanban-board-swimlanes::-webkit-scrollbar-track {
  background: var(--surface-ground);
}

.kanban-board-columns::-webkit-scrollbar-thumb,
.kanban-board-swimlane-columns::-webkit-scrollbar-thumb,
.kanban-board-swimlanes::-webkit-scrollbar-thumb {
  background: var(--surface-border);
  border-radius: 4px;
}

.kanban-board-columns::-webkit-scrollbar-thumb:hover,
.kanban-board-swimlane-columns::-webkit-scrollbar-thumb:hover,
.kanban-board-swimlanes::-webkit-scrollbar-thumb:hover {
  background: var(--surface-300);
}

/* Drag over styles */
:deep(.kanban-drag-over) {
  background: var(--primary-50, rgba(var(--primary-color-rgb), 0.05));
  border-color: var(--primary-color);
}
</style>
