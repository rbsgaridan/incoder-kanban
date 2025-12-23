/**
 * Type definitions for the Kanban Board component library
 * 
 * These types provide a comprehensive API for building enterprise-grade
 * Kanban boards with full type safety and IDE intellisense support.
 */

/**
 * Unique identifier type for entities
 */
export type KanbanId = string | number;

/**
 * Priority levels for cards
 */
export enum CardPriority {
  LOWEST = 'lowest',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  HIGHEST = 'highest'
}

/**
 * Tag/label attached to a card
 */
export interface KanbanTag {
  id: KanbanId;
  label: string;
  color?: string;
}

/**
 * User/assignee information
 */
export interface KanbanUser {
  id: KanbanId;
  name: string;
  avatar?: string;
  email?: string;
}

/**
 * Core card data structure
 * Represents a single item in the Kanban board
 */
export interface KanbanCard {
  id: KanbanId;
  columnId: KanbanId;
  title: string;
  description?: string;
  order: number;
  
  // Optional metadata
  tags?: KanbanTag[];
  assignees?: KanbanUser[];
  priority?: CardPriority;
  dueDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Swimlane support
  swimlaneId?: KanbanId;
  
  // Drag control
  draggable?: boolean;
  
  // Custom fields (extensible)
  metadata?: Record<string, any>;
}

/**
 * Column configuration and state
 */
export interface KanbanColumn {
  id: KanbanId;
  title: string;
  order: number;
  
  // Visual customization
  color?: string;
  icon?: string;
  
  // Column behavior
  collapsed?: boolean;
  hidden?: boolean;
  wipLimit?: number; // Work-in-progress limit
  
  // Drag control
  draggable?: boolean;
  acceptsCards?: boolean; // Can cards be dropped here?
  
  // Custom fields
  metadata?: Record<string, any>;
}

/**
 * Swimlane for grouping cards horizontally
 */
export interface KanbanSwimlane {
  id: KanbanId;
  title: string;
  order: number;
  collapsed?: boolean;
  color?: string;
  metadata?: Record<string, any>;
}

/**
 * Board-level configuration options
 */
export interface KanbanBoardOptions {
  // Drag & drop
  enableDragDrop?: boolean;
  enableColumnDrag?: boolean;
  enableCardReordering?: boolean;
  
  // Swimlanes
  enableSwimlanes?: boolean;
  groupBy?: string; // Field name to group by (e.g., 'swimlaneId')
  
  // UI behavior
  horizontalScroll?: boolean;
  virtualScrolling?: boolean;
  showEmptyColumns?: boolean;
  showCardCount?: boolean;
  showWipLimit?: boolean;
  
  // Accessibility
  enableKeyboardNavigation?: boolean;
  
  // Card display
  cardMinHeight?: number;
  cardMaxHeight?: number;
  columnWidth?: number | string;
  
  // Custom CSS classes
  boardClass?: string;
  columnClass?: string;
  cardClass?: string;
}

/**
 * Event payload when a card is moved
 */
export interface CardMoveEvent {
  card: KanbanCard;
  fromColumnId: KanbanId;
  toColumnId: KanbanId;
  fromIndex: number;
  toIndex: number;
  fromSwimlaneId?: KanbanId;
  toSwimlaneId?: KanbanId;
}

/**
 * Event payload when a column is moved
 */
export interface ColumnMoveEvent {
  column: KanbanColumn;
  fromIndex: number;
  toIndex: number;
}

/**
 * Event payload for drag operations
 */
export interface DragStartEvent {
  type: 'card' | 'column';
  id: KanbanId;
  sourceColumnId?: KanbanId;
}

export interface DragEndEvent {
  type: 'card' | 'column';
  id: KanbanId;
  success: boolean;
}

/**
 * Event payload for card interactions
 */
export interface CardClickEvent {
  card: KanbanCard;
  event: MouseEvent;
}

export interface CardUpdateEvent {
  card: KanbanCard;
  changes: Partial<KanbanCard>;
}

/**
 * Event payload for column updates
 */
export interface ColumnUpdateEvent {
  column: KanbanColumn;
  changes: Partial<KanbanColumn>;
}

/**
 * Complete board state change event
 */
export interface BoardChangeEvent {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  swimlanes?: KanbanSwimlane[];
}

/**
 * Slot scope for column header
 */
export interface ColumnHeaderSlotScope {
  column: KanbanColumn;
  cardCount: number;
  isOverLimit: boolean;
}

/**
 * Slot scope for column footer
 */
export interface ColumnFooterSlotScope {
  column: KanbanColumn;
  cardCount: number;
}

/**
 * Slot scope for card rendering
 */
export interface CardSlotScope {
  card: KanbanCard;
  column: KanbanColumn;
  index: number;
  isDragging: boolean;
}

/**
 * Slot scope for empty column
 */
export interface EmptyColumnSlotScope {
  column: KanbanColumn;
}

/**
 * Slot scope for board toolbar
 */
export interface BoardToolbarSlotScope {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  swimlanes?: KanbanSwimlane[];
}

/**
 * Props for the main KanbanBoard component
 */
export interface KanbanBoardProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  swimlanes?: KanbanSwimlane[];
  options?: KanbanBoardOptions;
  loading?: boolean;
}

/**
 * Emits for the main KanbanBoard component
 */
export interface KanbanBoardEmits {
  'update:columns': [columns: KanbanColumn[]];
  'update:cards': [cards: KanbanCard[]];
  'update:swimlanes': [swimlanes: KanbanSwimlane[]];
  
  'card-moved': [event: CardMoveEvent];
  'column-moved': [event: ColumnMoveEvent];
  'card-click': [event: CardClickEvent];
  'card-update': [event: CardUpdateEvent];
  'column-update': [event: ColumnUpdateEvent];
  'board-change': [event: BoardChangeEvent];
  
  'drag-start': [event: DragStartEvent];
  'drag-end': [event: DragEndEvent];
}

/**
 * Internal drag state
 */
export interface DragState {
  isDragging: boolean;
  dragType: 'card' | 'column' | null;
  draggedId: KanbanId | null;
  sourceColumnId: KanbanId | null;
  sourceSwimlaneId: KanbanId | null;
  dropColumnId: KanbanId | null;
  dropSwimlaneId: KanbanId | null;
}
