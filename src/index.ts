/**
 * @incoder/kanban
 * 
 * Enterprise-grade Kanban Board component for Vue 3 with PrimeVue integration
 * 
 * @module @incoder/kanban
 */

// Export main component
export { default as KanbanBoard } from './components/KanbanBoard.vue';
export { default as KanbanColumn } from './components/KanbanColumn.vue';
export { default as KanbanCard } from './components/KanbanCard.vue';

// Export composables
export { useKanbanState } from './composables/useKanbanState';
export { useKanbanDrag } from './composables/useKanbanDrag';

// Export all types
export type {
  KanbanId,
  KanbanCard,
  KanbanColumn,
  KanbanSwimlane,
  KanbanTag,
  KanbanUser,
  KanbanBoardOptions,
  KanbanBoardProps,
  KanbanBoardEmits,
  CardMoveEvent,
  ColumnMoveEvent,
  DragStartEvent,
  DragEndEvent,
  CardClickEvent,
  CardUpdateEvent,
  ColumnUpdateEvent,
  BoardChangeEvent,
  ColumnHeaderSlotScope,
  ColumnFooterSlotScope,
  CardSlotScope,
  EmptyColumnSlotScope,
  BoardToolbarSlotScope,
  DragState
} from './types/kanban';

// Export enum
export { CardPriority } from './types/kanban';

// Version
export const version = '1.0.0';
