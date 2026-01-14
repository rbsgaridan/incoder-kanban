<script setup lang="ts">
/**
 * KanbanCard Component
 *
 * Represents a single draggable card in the Kanban board.
 * Supports custom rendering via slots and emits interaction events.
 * Inherits PrimeVue theme tokens for consistent styling.
 */

import { computed } from "vue";
import type { KanbanCard, KanbanColumn } from "../types/kanban";

interface Props {
  card: KanbanCard;
  column: KanbanColumn;
  index: number;
  isDragging?: boolean;
  draggable?: boolean;
}

interface Emits {
  (e: "click", event: MouseEvent): void;
  (e: "dragstart", event: DragEvent): void;
  (e: "dragend", event: DragEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  isDragging: false,
  draggable: true,
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
  if (!props.card.priority) return "";
  return `kanban-card-priority-${props.card.priority}`;
});

/**
 * Handle card click
 */
const handleClick = (event: MouseEvent | KeyboardEvent) => {
  emit("click", event as MouseEvent);
};

/**
 * Handle drag start
 */
const handleDragStart = (event: DragEvent) => {
  if (!canDrag.value) {
    event.preventDefault();
    return;
  }
  emit("dragstart", event);
};

/**
 * Handle drag end
 */
const handleDragEnd = (event: DragEvent) => {
  emit("dragend", event);
};
</script>

<template>
  <div
    class="kanban-card"
    :class="[
      priorityClass,
      {
        'kanban-card-dragging': isDragging,
        'kanban-card-draggable': canDrag,
      },
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
    <slot :card="card" :column="column" :index="index" :isDragging="isDragging">
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
            <i
              :class="`pi pi-flag${
                card.priority === 'highest' || card.priority === 'high'
                  ? '-fill'
                  : ''
              }`"
            ></i>
          </span>
        </div>

        <!-- Card description -->
        <p v-if="card.description" class="kanban-card-description">
          {{ card.description }}
        </p>

        <!-- Tags -->
        <div v-if="card.tags && card.tags.length > 0" class="kanban-card-tags">
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
        <div v-if="card.assignees || card.dueDate" class="kanban-card-footer">
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
