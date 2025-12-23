/**
 * Composable for managing Kanban board state
 * 
 * Provides reactive state management, card/column operations,
 * and computed properties for the Kanban board.
 */

import { computed, ref, watch, type Ref } from 'vue';
import type {
  KanbanCard,
  KanbanColumn,
  KanbanSwimlane,
  KanbanBoardOptions,
  CardMoveEvent,
  ColumnMoveEvent
} from '../types/kanban';

export interface UseKanbanStateOptions {
  columns: Ref<KanbanColumn[]>;
  cards: Ref<KanbanCard[]>;
  swimlanes?: Ref<KanbanSwimlane[]>;
  options?: Ref<KanbanBoardOptions | undefined>;
}

export function useKanbanState(props: UseKanbanStateOptions) {
  // Internal state (for uncontrolled mode)
  const internalColumns = ref<KanbanColumn[]>([]);
  const internalCards = ref<KanbanCard[]>([]);
  const internalSwimlanes = ref<KanbanSwimlane[]>([]);

  // Use internal state as fallback
  const currentColumns = computed(() => props.columns.value || internalColumns.value);
  const currentCards = computed(() => props.cards.value || internalCards.value);
  const currentSwimlanes = computed(() => props.swimlanes?.value || internalSwimlanes.value);

  /**
   * Get all cards for a specific column
   */
  const getCardsForColumn = (columnId: string | number, swimlaneId?: string | number) => {
    return currentCards.value
      .filter(card => {
        const columnMatch = card.columnId === columnId;
        const swimlaneMatch = swimlaneId !== undefined 
          ? card.swimlaneId === swimlaneId 
          : true;
        return columnMatch && swimlaneMatch;
      })
      .sort((a, b) => a.order - b.order);
  };

  /**
   * Get card count for a column
   */
  const getCardCount = (columnId: string | number, swimlaneId?: string | number) => {
    return getCardsForColumn(columnId, swimlaneId).length;
  };

  /**
   * Check if a column is over its WIP limit
   */
  const isColumnOverLimit = (columnId: string | number) => {
    const column = currentColumns.value.find(c => c.id === columnId);
    if (!column || !column.wipLimit) return false;
    
    const cardCount = getCardCount(columnId);
    return cardCount > column.wipLimit;
  };

  /**
   * Get column by ID
   */
  const getColumnById = (columnId: string | number) => {
    return currentColumns.value.find(c => c.id === columnId);
  };

  /**
   * Get card by ID
   */
  const getCardById = (cardId: string | number) => {
    return currentCards.value.find(c => c.id === cardId);
  };

  /**
   * Get swimlane by ID
   */
  const getSwimlaneById = (swimlaneId: string | number) => {
    return currentSwimlanes.value.find(s => s.id === swimlaneId);
  };

  /**
   * Move a card between columns
   */
  const moveCard = (event: CardMoveEvent): KanbanCard[] => {
    const cards = [...currentCards.value];
    const cardIndex = cards.findIndex(c => c.id === event.card.id);
    
    if (cardIndex === -1) return cards;

    // Update the card's column and swimlane
    const updatedCard = {
      ...cards[cardIndex],
      columnId: event.toColumnId,
      swimlaneId: event.toSwimlaneId,
      order: event.toIndex
    };

    // Remove from original position
    cards.splice(cardIndex, 1);

    // Reorder cards in the source column
    cards
      .filter(c => c.columnId === event.fromColumnId && 
                   c.swimlaneId === event.fromSwimlaneId)
      .forEach((card, idx) => {
        card.order = idx;
      });

    // Insert at new position
    const targetCards = cards.filter(c => 
      c.columnId === event.toColumnId && 
      c.swimlaneId === event.toSwimlaneId
    );
    
    targetCards.splice(event.toIndex, 0, updatedCard);
    
    // Reorder cards in target column
    targetCards.forEach((card, idx) => {
      card.order = idx;
    });

    // Rebuild the full cards array
    const otherCards = cards.filter(c => 
      !(c.columnId === event.toColumnId && c.swimlaneId === event.toSwimlaneId) &&
      !(c.columnId === event.fromColumnId && c.swimlaneId === event.fromSwimlaneId)
    );

    return [...otherCards, ...targetCards, ...cards.filter(c => 
      c.columnId === event.fromColumnId && c.swimlaneId === event.fromSwimlaneId
    )];
  };

  /**
   * Move a column to a new position
   */
  const moveColumn = (event: ColumnMoveEvent): KanbanColumn[] => {
    const columns = [...currentColumns.value];
    const columnIndex = columns.findIndex(c => c.id === event.column.id);
    
    if (columnIndex === -1) return columns;

    // Remove from original position
    const [movedColumn] = columns.splice(columnIndex, 1);
    
    // Insert at new position
    columns.splice(event.toIndex, 0, movedColumn);
    
    // Update order for all columns
    return columns.map((col, idx) => ({
      ...col,
      order: idx
    }));
  };

  /**
   * Update a card
   */
  const updateCard = (cardId: string | number, changes: Partial<KanbanCard>): KanbanCard[] => {
    return currentCards.value.map(card => 
      card.id === cardId ? { ...card, ...changes } : card
    );
  };

  /**
   * Update a column
   */
  const updateColumn = (columnId: string | number, changes: Partial<KanbanColumn>): KanbanColumn[] => {
    return currentColumns.value.map(column => 
      column.id === columnId ? { ...column, ...changes } : column
    );
  };

  /**
   * Sort columns by order
   */
  const sortedColumns = computed(() => {
    return [...currentColumns.value].sort((a, b) => a.order - b.order);
  });

  /**
   * Sort swimlanes by order
   */
  const sortedSwimlanes = computed(() => {
    return [...currentSwimlanes.value].sort((a, b) => a.order - b.order);
  });

  /**
   * Get all unique swimlanes from cards if not explicitly defined
   */
  const effectiveSwimlanes = computed(() => {
    if (currentSwimlanes.value.length > 0) {
      return sortedSwimlanes.value;
    }

    // Auto-generate swimlanes from cards
    const swimlaneIds = new Set(
      currentCards.value
        .map(c => c.swimlaneId)
        .filter(id => id !== undefined)
    );

    return Array.from(swimlaneIds).map((id, index) => ({
      id: id!,
      title: `Swimlane ${id}`,
      order: index
    }));
  });

  return {
    // State
    currentColumns,
    currentCards,
    currentSwimlanes,
    
    // Computed
    sortedColumns,
    sortedSwimlanes,
    effectiveSwimlanes,
    
    // Getters
    getCardsForColumn,
    getCardCount,
    isColumnOverLimit,
    getColumnById,
    getCardById,
    getSwimlaneById,
    
    // Actions
    moveCard,
    moveColumn,
    updateCard,
    updateColumn
  };
}
