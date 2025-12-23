/**
 * Composable for managing drag and drop operations
 * 
 * Provides drag state management, event handlers, and utilities
 * for implementing drag-and-drop functionality in the Kanban board.
 * 
 * Uses native HTML5 Drag and Drop API with Vue reactivity.
 */

import { ref, computed, type Ref } from 'vue';
import type {
  KanbanId,
  KanbanCard,
  KanbanColumn,
  DragState,
  DragStartEvent,
  DragEndEvent,
  CardMoveEvent
} from '../types/kanban';

export interface UseKanbanDragOptions {
  enableDragDrop?: Ref<boolean>;
  enableColumnDrag?: Ref<boolean>;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onCardMoved?: (event: CardMoveEvent) => void;
}

export function useKanbanDrag(options: UseKanbanDragOptions = {}) {
  // Drag state
  const dragState = ref<DragState>({
    isDragging: false,
    dragType: null,
    draggedId: null,
    sourceColumnId: null,
    sourceSwimlaneId: null,
    dropColumnId: null,
    dropSwimlaneId: null
  });

  // Track the element being dragged over
  const dragOverElement = ref<HTMLElement | null>(null);

  /**
   * Check if drag is enabled
   */
  const isDragEnabled = computed(() => 
    options.enableDragDrop?.value !== false
  );

  const isColumnDragEnabled = computed(() => 
    options.enableColumnDrag?.value !== false
  );

  /**
   * Start dragging a card
   */
  const startCardDrag = (
    card: KanbanCard,
    event: DragEvent
  ) => {
    if (!isDragEnabled.value || card.draggable === false) {
      event.preventDefault();
      return;
    }

    dragState.value = {
      isDragging: true,
      dragType: 'card',
      draggedId: card.id,
      sourceColumnId: card.columnId,
      sourceSwimlaneId: card.swimlaneId || null,
      dropColumnId: null,
      dropSwimlaneId: null
    };

    // Set drag data for accessibility and cross-frame support
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'card',
        id: card.id,
        columnId: card.columnId,
        swimlaneId: card.swimlaneId
      }));
    }

    // Add dragging class to element
    const target = event.target as HTMLElement;
    target.classList.add('kanban-dragging');

    // Emit drag start event
    options.onDragStart?.({
      type: 'card',
      id: card.id,
      sourceColumnId: card.columnId
    });
  };

  /**
   * Start dragging a column
   */
  const startColumnDrag = (
    column: KanbanColumn,
    event: DragEvent
  ) => {
    if (!isColumnDragEnabled.value || column.draggable === false) {
      event.preventDefault();
      return;
    }

    dragState.value = {
      isDragging: true,
      dragType: 'column',
      draggedId: column.id,
      sourceColumnId: null,
      sourceSwimlaneId: null,
      dropColumnId: null,
      dropSwimlaneId: null
    };

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'column',
        id: column.id
      }));
    }

    const target = event.target as HTMLElement;
    target.classList.add('kanban-dragging');

    options.onDragStart?.({
      type: 'column',
      id: column.id
    });
  };

  /**
   * Handle drag over a drop zone
   */
  const handleDragOver = (
    event: DragEvent,
    columnId: KanbanId,
    swimlaneId?: KanbanId
  ) => {
    if (!isDragEnabled.value || !dragState.value.isDragging) {
      return;
    }

    event.preventDefault();
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    // Update drop target
    dragState.value.dropColumnId = columnId;
    dragState.value.dropSwimlaneId = swimlaneId || null;

    // Add visual feedback
    const target = event.currentTarget as HTMLElement;
    if (target !== dragOverElement.value) {
      dragOverElement.value?.classList.remove('kanban-drag-over');
      target.classList.add('kanban-drag-over');
      dragOverElement.value = target;
    }
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (event: DragEvent) => {
    const target = event.currentTarget as HTMLElement;
    
    // Only remove class if we're actually leaving the element
    // (not just entering a child)
    if (!target.contains(event.relatedTarget as Node)) {
      target.classList.remove('kanban-drag-over');
      if (dragOverElement.value === target) {
        dragOverElement.value = null;
      }
    }
  };

  /**
   * Handle drop on a column
   */
  const handleDrop = (
    event: DragEvent,
    columnId: KanbanId,
    swimlaneId: KanbanId | undefined,
    getCard: (id: KanbanId) => KanbanCard | undefined,
    getCardsInColumn: (colId: KanbanId, swimId?: KanbanId) => KanbanCard[]
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isDragEnabled.value || dragState.value.dragType !== 'card') {
      resetDragState();
      return;
    }

    const target = event.currentTarget as HTMLElement;
    target.classList.remove('kanban-drag-over');

    const draggedId = dragState.value.draggedId;
    if (!draggedId) {
      resetDragState();
      return;
    }

    const card = getCard(draggedId);
    if (!card) {
      resetDragState();
      return;
    }

    const fromColumnId = dragState.value.sourceColumnId;
    const fromSwimlaneId = dragState.value.sourceSwimlaneId;
    
    if (!fromColumnId) {
      resetDragState();
      return;
    }

    // Calculate the drop index based on mouse position
    const cardsInColumn = getCardsInColumn(columnId, swimlaneId);
    let toIndex = cardsInColumn.length;

    // If dropping in the same column, adjust index
    if (columnId === fromColumnId && swimlaneId === fromSwimlaneId) {
      const fromIndex = cardsInColumn.findIndex(c => c.id === draggedId);
      if (fromIndex !== -1) {
        toIndex = fromIndex;
      }
    }

    // Check if the card actually moved to a different position
    const actuallyMoved = columnId !== fromColumnId || 
                          swimlaneId !== fromSwimlaneId ||
                          toIndex !== card.order;

    // Only emit card moved event if position actually changed
    if (actuallyMoved) {
      const moveEvent: CardMoveEvent = {
        card,
        fromColumnId,
        toColumnId: columnId,
        fromIndex: card.order,
        toIndex,
        fromSwimlaneId,
        toSwimlaneId: swimlaneId
      };

      options.onCardMoved?.(moveEvent);
    }

    // Emit drag end event
    options.onDragEnd?.({
      type: 'card',
      id: draggedId,
      success: true
    });

    // Reset drag state
    resetDragState();
  };

  /**
   * Handle drag end
   */
  const handleDragEnd = (event: DragEvent) => {
    const target = event.target as HTMLElement;
    target.classList.remove('kanban-dragging');
    
    dragOverElement.value?.classList.remove('kanban-drag-over');
    dragOverElement.value = null;

    const draggedId = dragState.value.draggedId;
    const dragType = dragState.value.dragType;

    if (draggedId && dragType) {
      options.onDragEnd?.({
        type: dragType,
        id: draggedId,
        success: false
      });
    }

    resetDragState();
  };

  /**
   * Reset drag state
   */
  const resetDragState = () => {
    dragState.value = {
      isDragging: false,
      dragType: null,
      draggedId: null,
      sourceColumnId: null,
      sourceSwimlaneId: null,
      dropColumnId: null,
      dropSwimlaneId: null
    };
  };

  /**
   * Check if a specific card is being dragged
   */
  const isCardDragging = (cardId: KanbanId) => {
    return dragState.value.dragType === 'card' && 
           dragState.value.draggedId === cardId;
  };

  /**
   * Check if a specific column is being dragged
   */
  const isColumnDragging = (columnId: KanbanId) => {
    return dragState.value.dragType === 'column' && 
           dragState.value.draggedId === columnId;
  };

  return {
    // State
    dragState,
    isDragEnabled,
    isColumnDragEnabled,
    
    // Handlers
    startCardDrag,
    startColumnDrag,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    
    // Utilities
    isCardDragging,
    isColumnDragging,
    resetDragState
  };
}
