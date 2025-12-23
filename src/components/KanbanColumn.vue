<script setup lang="ts">
/**
 * KanbanColumn Component
 * 
 * Represents a single column in the Kanban board.
 * Manages card display, drag-and-drop zones, WIP limits, and custom slots.
 * Inherits PrimeVue theme for consistent styling.
 */

import { computed } from 'vue';
import KanbanCard from './KanbanCard.vue';
import type { KanbanCard as IKanbanCard, KanbanColumn, KanbanId } from '../types/kanban';

interface Props {
  column: KanbanColumn;
  cards: IKanbanCard[];
  draggable?: boolean;
  showCardCount?: boolean;
  showWipLimit?: boolean;
  isDraggingCard?: boolean;
}

interface Emits {
  (e: 'card-click', card: IKanbanCard, event: MouseEvent): void;
  (e: 'card-dragstart', card: IKanbanCard, event: DragEvent): void;
  (e: 'card-dragend', card: IKanbanCard, event: DragEvent): void;
  (e: 'column-dragover', event: DragEvent): void;
  (e: 'column-dragleave', event: DragEvent): void;
  (e: 'column-drop', event: DragEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  draggable: true,
  showCardCount: true,
  showWipLimit: true,
  isDraggingCard: false
});

const emit = defineEmits<Emits>();

/**
 * Sorted cards for this column
 */
const sortedCards = computed(() => {
  return [...props.cards].sort((a, b) => a.order - b.order);
});

/**
 * Card count
 */
const cardCount = computed(() => props.cards.length);

/**
 * Check if column is over WIP limit
 */
const isOverLimit = computed(() => {
  if (!props.column.wipLimit) return false;
  return cardCount.value > props.column.wipLimit;
});

/**
 * Check if column can accept cards
 */
const canAcceptCards = computed(() => {
  return props.column.acceptsCards !== false;
});

/**
 * Column header color style
 */
const columnHeaderStyle = computed(() => {
  if (!props.column.color) return {};
  return {
    borderTopColor: props.column.color,
    borderTopWidth: '3px',
    borderTopStyle: 'solid' as const
  };
});

/**
 * Handle card click
 */
const handleCardClick = (card: IKanbanCard, event: MouseEvent) => {
  emit('card-click', card, event);
};

/**
 * Handle card drag start
 */
const handleCardDragStart = (card: IKanbanCard, event: DragEvent) => {
  emit('card-dragstart', card, event);
};

/**
 * Handle card drag end
 */
const handleCardDragEnd = (card: IKanbanCard, event: DragEvent) => {
  emit('card-dragend', card, event);
};

/**
 * Handle drag over column
 */
const handleDragOver = (event: DragEvent) => {
  if (!canAcceptCards.value) {
    event.dataTransfer!.dropEffect = 'none';
    return;
  }
  emit('column-dragover', event);
};

/**
 * Handle drag leave
 */
const handleDragLeave = (event: DragEvent) => {
  emit('column-dragleave', event);
};

/**
 * Handle drop
 */
const handleDrop = (event: DragEvent) => {
  if (!canAcceptCards.value) return;
  emit('column-drop', event);
};
</script>

<template>
  <div
    class="kanban-column"
    :class="{
      'kanban-column-collapsed': column.collapsed,
      'kanban-column-over-limit': isOverLimit,
      'kanban-column-dragging': isDraggingCard
    }"
    role="region"
    :aria-label="`Column: ${column.title}`"
  >
    <!-- Column Header -->
    <div
      class="kanban-column-header"
      :style="columnHeaderStyle"
    >
      <!-- Custom header slot -->
      <slot
        name="header"
        :column="column"
        :cardCount="cardCount"
        :isOverLimit="isOverLimit"
      >
        <!-- Default header -->
        <div class="kanban-column-header-content">
          <div class="kanban-column-title-wrapper">
            <!-- Icon -->
            <i
              v-if="column.icon"
              :class="column.icon"
              class="kanban-column-icon"
            ></i>
            
            <!-- Title -->
            <h3 class="kanban-column-title">{{ column.title }}</h3>
          </div>

          <!-- Card count and WIP limit -->
          <div
            v-if="showCardCount || (showWipLimit && column.wipLimit)"
            class="kanban-column-meta"
          >
            <span
              class="kanban-column-count"
              :class="{ 'over-limit': isOverLimit }"
            >
              {{ cardCount }}
              <span v-if="showWipLimit && column.wipLimit">
                / {{ column.wipLimit }}
              </span>
            </span>
          </div>
        </div>
      </slot>
    </div>

    <!-- Column Body (Drop Zone) -->
    <div
      v-if="!column.collapsed"
      class="kanban-column-body"
      :class="{
        'kanban-column-drop-zone': canAcceptCards,
        'kanban-column-no-drop': !canAcceptCards
      }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Cards -->
      <TransitionGroup
        name="kanban-card-list"
        tag="div"
        class="kanban-column-cards"
      >
        <KanbanCard
          v-for="(card, index) in sortedCards"
          :key="card.id"
          :card="card"
          :column="column"
          :index="index"
          :draggable="draggable"
          @click="handleCardClick(card, $event)"
          @dragstart="handleCardDragStart(card, $event)"
          @dragend="handleCardDragEnd(card, $event)"
        >
          <!-- Pass through card slot -->
          <template #default="slotProps">
            <slot name="card" v-bind="slotProps"></slot>
          </template>
          
          <!-- Pass through card overlay slot -->
          <template #overlay="slotProps">
            <slot name="card-overlay" v-bind="slotProps"></slot>
          </template>
        </KanbanCard>
      </TransitionGroup>

      <!-- Empty state -->
      <div
        v-if="sortedCards.length === 0"
        class="kanban-column-empty"
      >
        <slot
          name="empty"
          :column="column"
        >
          <div class="kanban-column-empty-content">
            <i class="pi pi-inbox"></i>
            <p>No cards</p>
          </div>
        </slot>
      </div>
    </div>

    <!-- Column Footer -->
    <div
      v-if="!column.collapsed"
      class="kanban-column-footer"
    >
      <slot
        name="footer"
        :column="column"
        :cardCount="cardCount"
      ></slot>
    </div>
  </div>
</template>

<style scoped>
/**
 * Column styles using PrimeVue design tokens
 */

.kanban-column {
  display: flex;
  flex-direction: column;
  background: var(--surface-ground);
  border-radius: var(--border-radius);
  min-width: 280px;
  max-width: 320px;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.kanban-column-header {
  padding: 1rem;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.kanban-column-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.kanban-column-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.kanban-column-icon {
  font-size: 1.125rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.kanban-column-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kanban-column-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kanban-column-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  background: var(--surface-100);
  padding: 0.25rem 0.5rem;
  border-radius: calc(var(--border-radius) / 2);
}

.kanban-column-count.over-limit {
  background: var(--red-100);
  color: var(--red-600);
}

.kanban-column-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  min-height: 200px;
}

.kanban-column-drop-zone {
  transition: background-color 0.2s ease;
}

.kanban-column-drop-zone.kanban-drag-over {
  background: var(--primary-50, rgba(var(--primary-color-rgb), 0.05));
}

.kanban-column-no-drop {
  cursor: not-allowed;
}

.kanban-column-cards {
  display: flex;
  flex-direction: column;
  min-height: 50px;
}

.kanban-column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  padding: 2rem 1rem;
}

.kanban-column-empty-content {
  text-align: center;
  color: var(--text-color-secondary);
}

.kanban-column-empty-content i {
  font-size: 2rem;
  opacity: 0.5;
  margin-bottom: 0.5rem;
}

.kanban-column-empty-content p {
  margin: 0;
  font-size: 0.875rem;
}

.kanban-column-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--surface-border);
  background: var(--surface-card);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.kanban-column-collapsed {
  max-width: 60px;
  min-width: 60px;
}

.kanban-column-collapsed .kanban-column-header {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.kanban-column-over-limit .kanban-column-header {
  background: var(--red-50);
}

/* Card list transitions */
.kanban-card-list-move {
  transition: transform 0.3s ease;
}

.kanban-card-list-enter-active,
.kanban-card-list-leave-active {
  transition: all 0.3s ease;
}

.kanban-card-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.kanban-card-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Scrollbar styling */
.kanban-column-body::-webkit-scrollbar {
  width: 6px;
}

.kanban-column-body::-webkit-scrollbar-track {
  background: transparent;
}

.kanban-column-body::-webkit-scrollbar-thumb {
  background: var(--surface-border);
  border-radius: 3px;
}

.kanban-column-body::-webkit-scrollbar-thumb:hover {
  background: var(--surface-300);
}
</style>
