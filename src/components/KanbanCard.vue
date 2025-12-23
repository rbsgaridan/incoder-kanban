<script setup lang="ts">
/**
 * KanbanCard Component
 * 
 * Represents a single draggable card in the Kanban board.
 * Supports custom rendering via slots and emits interaction events.
 * Inherits PrimeVue theme tokens for consistent styling.
 */

import { computed } from 'vue';
import type { KanbanCard, KanbanColumn } from '../types/kanban';

interface Props {
  card: KanbanCard;
  column: KanbanColumn;
  index: number;
  isDragging?: boolean;
  draggable?: boolean;
}

interface Emits {
  (e: 'click', event: MouseEvent): void;
  (e: 'dragstart', event: DragEvent): void;
  (e: 'dragend', event: DragEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  isDragging: false,
  draggable: true
});

const emit = defineEmits<Emits>();

/**
 * Determine if this card can be dragged
 */
const canDrag = computed(() => {
  return props.draggable && props.card.draggable !== false;
});

/**
 * Get priority color class
 */
const priorityClass = computed(() => {
  if (!props.card.priority) return '';
  return `kanban-card-priority-${props.card.priority}`;
});

/**
 * Handle card click
 */
const handleClick = (event: MouseEvent | KeyboardEvent) => {
  emit('click', event as MouseEvent);
};

/**
 * Handle drag start
 */
const handleDragStart = (event: DragEvent) => {
  if (!canDrag.value) {
    event.preventDefault();
    return;
  }
  emit('dragstart', event);
};

/**
 * Handle drag end
 */
const handleDragEnd = (event: DragEvent) => {
  emit('dragend', event);
};
</script>

<template>
  <div
    class="kanban-card"
    :class="[
      priorityClass,
      {
        'kanban-card-dragging': isDragging,
        'kanban-card-draggable': canDrag
      }
    ]"
    :draggable="canDrag"
    role="article"
    :aria-label="`Card: ${card.title}`"
    tabindex="0"
    @click="handleClick"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Allow full customization via default slot -->
    <slot
      :card="card"
      :column="column"
      :index="index"
      :isDragging="isDragging"
    >
      <!-- Default card rendering -->
      <div class="kanban-card-content">
        <!-- Card header with title -->
        <div class="kanban-card-header">
          <h4 class="kanban-card-title">{{ card.title }}</h4>
          
          <!-- Priority indicator -->
          <span
            v-if="card.priority"
            class="kanban-card-priority-badge"
            :class="`priority-${card.priority}`"
            :title="`Priority: ${card.priority}`"
          >
            <i :class="`pi pi-flag${card.priority === 'highest' || card.priority === 'high' ? '-fill' : ''}`"></i>
          </span>
        </div>

        <!-- Card description -->
        <p
          v-if="card.description"
          class="kanban-card-description"
        >
          {{ card.description }}
        </p>

        <!-- Tags -->
        <div
          v-if="card.tags && card.tags.length > 0"
          class="kanban-card-tags"
        >
          <span
            v-for="tag in card.tags"
            :key="tag.id"
            class="kanban-card-tag"
            :style="tag.color ? { backgroundColor: tag.color } : undefined"
          >
            {{ tag.label }}
          </span>
        </div>

        <!-- Card footer with metadata -->
        <div
          v-if="card.assignees || card.dueDate"
          class="kanban-card-footer"
        >
          <!-- Assignees -->
          <div
            v-if="card.assignees && card.assignees.length > 0"
            class="kanban-card-assignees"
          >
            <div
              v-for="assignee in card.assignees.slice(0, 3)"
              :key="assignee.id"
              class="kanban-card-avatar"
              :title="assignee.name"
            >
              <img
                v-if="assignee.avatar"
                :src="assignee.avatar"
                :alt="assignee.name"
              />
              <span v-else>{{ assignee.name.charAt(0).toUpperCase() }}</span>
            </div>
            <span
              v-if="card.assignees.length > 3"
              class="kanban-card-avatar-more"
              :title="`+${card.assignees.length - 3} more`"
            >
              +{{ card.assignees.length - 3 }}
            </span>
          </div>

          <!-- Due date -->
          <div
            v-if="card.dueDate"
            class="kanban-card-due-date"
            :title="`Due: ${card.dueDate}`"
          >
            <i class="pi pi-calendar"></i>
            <span>{{ new Date(card.dueDate).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </slot>

    <!-- Overlay slot for additional UI (e.g., loading, selection) -->
    <slot name="overlay" :card="card" :column="column"></slot>
  </div>
</template>

<style scoped>
/**
 * Card styles using PrimeVue design tokens
 * These inherit from the host application's theme
 */

.kanban-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--card-shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
}

.kanban-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.kanban-card:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.kanban-card-draggable {
  cursor: grab;
}

.kanban-card-dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.kanban-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kanban-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.kanban-card-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.4;
  flex: 1;
}

.kanban-card-priority-badge {
  flex-shrink: 0;
  font-size: 0.875rem;
  opacity: 0.7;
}

.kanban-card-priority-badge.priority-highest {
  color: var(--red-500);
}

.kanban-card-priority-badge.priority-high {
  color: var(--orange-500);
}

.kanban-card-priority-badge.priority-medium {
  color: var(--yellow-500);
}

.kanban-card-priority-badge.priority-low {
  color: var(--blue-500);
}

.kanban-card-priority-badge.priority-lowest {
  color: var(--gray-500);
}

.kanban-card-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kanban-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.kanban-card-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--primary-color);
  color: var(--primary-color-text);
  border-radius: calc(var(--border-radius) / 2);
  font-size: 0.75rem;
  font-weight: 500;
}

.kanban-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.kanban-card-assignees {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.kanban-card-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--primary-color);
  color: var(--primary-color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid var(--surface-card);
  overflow: hidden;
}

.kanban-card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kanban-card-avatar-more {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.kanban-card-due-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.kanban-card-due-date i {
  font-size: 0.875rem;
}

/* Priority border accents */
.kanban-card-priority-highest {
  border-left: 3px solid var(--red-500);
}

.kanban-card-priority-high {
  border-left: 3px solid var(--orange-500);
}

.kanban-card-priority-medium {
  border-left: 3px solid var(--yellow-500);
}

.kanban-card-priority-low {
  border-left: 3px solid var(--blue-500);
}

.kanban-card-priority-lowest {
  border-left: 3px solid var(--gray-400);
}
</style>
