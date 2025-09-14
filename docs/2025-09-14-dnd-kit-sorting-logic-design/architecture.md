# 技術アーキテクチャ設計書

## アーキテクチャ概要

本設計書では、@dnd-kit ライブラリを核とした、型安全で拡張性の高いドラッグ&ドロップシステムのアーキテクチャを定義します。

## システム全体設計

### コンポーネント構成図

```
┌─────────────────────────────────────────────────────────────┐
│                    DndContext                               │
│  ┌─────────────────────────────┐ ┌─────────────────────────┐ │
│  │        FormArea             │ │      SidebarArea        │ │
│  │                             │ │                         │ │
│  │  ┌─────────────────────────┐ │ │ ┌─────────────────────┐ │ │
│  │  │   SortableContext       │ │ │ │   SortableContext   │ │ │
│  │  │   (Parents)             │ │ │ │   (Parents)         │ │ │
│  │  │                         │ │ │ │                     │ │ │
│  │  │  ┌─────────────────────┐│ │ │ │ ┌─────────────────┐ │ │ │
│  │  │  │ SortableParentItem  ││ │ │ │ │SidebarParentItem│ │ │ │
│  │  │  │                     ││ │ │ │ │                 │ │ │ │
│  │  │  │ ┌─────────────────┐ ││ │ │ │ │ ┌─────────────┐ │ │ │ │
│  │  │  │ │SortableContext  │ ││ │ │ │ │ │SortableCtx  │ │ │ │ │
│  │  │  │ │(Children)       │ ││ │ │ │ │ │(Children)   │ │ │ │ │
│  │  │  │ │                 │ ││ │ │ │ │ │             │ │ │ │ │
│  │  │  │ │┌──────────────┐ │ ││ │ │ │ │ │┌──────────┐ │ │ │ │ │
│  │  │  │ ││SortableChild │ │ ││ │ │ │ │ ││SidebarCh │ │ │ │ │ │
│  │  │  │ │└──────────────┘ │ ││ │ │ │ │ │└──────────┘ │ │ │ │ │
│  │  │  │ └─────────────────┘ ││ │ │ │ │ └─────────────┘ │ │ │ │
│  │  │  └─────────────────────┘│ │ │ │ └─────────────────┘ │ │ │
│  │  └─────────────────────────┘ │ │ └─────────────────────┘ │ │
│  └─────────────────────────────┘ │ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┐
                                                               │
                      useSortableForm Hook                     │
                   ┌─────────────────────────┐                 │
                   │    React Hook Form      │                 │
                   │    - useFieldArray      │                 │
                   │    - watch              │                 │
                   │    - setValue           │                 │
                   └─────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## コア設計原則

### 単一責任の原則

- **DndContext**: グローバルなドラッグ状態管理
- **SortableContext**: 特定スコープ内の並び替え管理
- **useSortableForm**: フォーム状態とドラッグロジックの統合

### データフロー設計

```typescript
┌─────────────────────┐    watch()    ┌─────────────────────┐
│   React Hook Form   │ ──────────────> │    Sidebar State    │
│   (Source of Truth) │               │   (Derived State)   │
└─────────────────────┘               └─────────────────────┘
          │                                       │
          │ setValue()                            │
          │                                       │
          v                                       v
┌─────────────────────┐               ┌─────────────────────┐
│     Form UI         │               │    Sidebar UI       │
│   (Input Fields)    │               │  (Index Display)    │
└─────────────────────┘               └─────────────────────┘
          │                                       │
          └─────────────── DndContext ────────────┘
                            │
                            v
                    ┌─────────────────────┐
                    │  Drag Event         │
                    │  Handlers           │
                    └─────────────────────┘
```

## ID管理戦略

### 階層的ID設計

```typescript
// Parent ID: React Hook Form の useFieldArray から取得
type ParentId = string; //例: "field-abc123def456"

// Child ID: 親インデックス + 子インデックスの合成
type ChildId = `${number}-${number}`; // 例: "0-1", "2-3"

// ID判定ロジック
const childIdPattern = /^\d+-\d+$/;
const isChildId = (id: string): boolean => childIdPattern.test(id);
const isParentId = (id: string): boolean => !childIdPattern.test(id);
```

### ID変換ユーティリティ

```typescript
interface IdUtils {
  // Child ID から親・子インデックスを抽出
  parseChildId(childId: string): { parentIndex: number; childIndex: number };
  
  // Parent ID から親インデックスを取得
  findParentIndex(parentId: string, parentFields: FieldArrayWithId[]): number;
  
  // Child ID を生成
  createChildId(parentIndex: number, childIndex: number): string;
}
```

## 衝突検出アルゴリズム

### カスタム衝突検出ロジック

```typescript
const customCollisionDetection = (args: CollisionDetectionArgs) => {
  const { active, droppableContainers } = args;
  
  // アクティブ要素の種別判定
  const isDraggingParent = !childIdPattern.test(active.id);
  
  if (isDraggingParent) {
    // Parent ドラッグ時: Parent コンテナのみフィルタリング
    const parentContainers = filterParentContainers(droppableContainers);
    return closestCenter({ ...args, droppableContainers: parentContainers });
  } else {
    // Child ドラッグ時: Child コンテナのみフィルタリング
    const childContainers = filterChildContainers(droppableContainers);
    return closestCenter({ ...args, droppableContainers: childContainers });
  }
};

// 優先度付き衝突検出（将来拡張用）
const prioritizedCollisionDetection = (args: CollisionDetectionArgs) => {
  // 1. 同一親内の移動を優先
  // 2. 異なる親への移動を次優先
  // 3. 無効なドロップを除外
};
```

## 状態管理アーキテクチャ

### 中央集権的状態管理

```typescript
interface SortableFormState {
  // フォーム状態（唯一の真実の源）
  formData: Data;
  
  // ドラッグ状態
  dragState: {
    activeId: string | null;
    draggedItem: DraggedItem | null;
    dropIndicator: DropIndicator | null;
  };
  
  // UI状態
  uiState: {
    isFormLoading: boolean;
    validationErrors: ValidationError[];
  };
}
```

### 状態更新フロー

```typescript
// 1. ドラッグ開始
onDragStart → setActiveId + setDraggedItem

// 2. ドラッグ中
onDragOver → setDropIndicator (UIのみ、データ変更なし)

// 3. ドラッグ終了
onDragEnd → データ更新 → setValue → watch → 自動同期
```

## コンポーネントアーキテクチャ

### Hook設計

```typescript
interface UseSortableFormReturn {
  // フォーム関連
  register: UseFormRegister<Data>;
  handleSubmit: UseFormHandleSubmit<Data>;
  parentFields: FieldArrayWithId<Data, "parentArray", "id">[];
  watchedData: Data;
  
  // ドラッグ関連
  sensors: SensorDescriptor<SensorOptions>[];
  dragHandlers: {
    onDragStart: (event: DragStartEvent) => void;
    onDragOver: (event: DragOverEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
  };
  
  // 状態
  dragState: DragState;
  sidebarData: Data;
  
  // アクション
  actions: {
    addParent: () => void;
    removeParent: (index: number) => void;
    addChild: (parentIndex: number) => void;
    removeChild: (parentIndex: number, childIndex: number) => void;
  };
}
```

### コンポーネント責任分離

```typescript
// フォーム側コンポーネント
interface SortableParentItemProps {
  parentIndex: number;
  // フォーム固有のプロパティ
  register: UseFormRegister<Data>;
  onRemove: (index: number) => void;
}

// サイドバー側コンポーネント
interface SidebarParentItemProps {
  parent: Parent;
  parentIndex: number;
  // 表示のみ、編集機能なし
}

// 共通ドラッグ機能
interface DraggableItemProps {
  id: string;
  isDragDisabled?: boolean;
  dragHandle?: ReactNode;
}
```

## イベント処理設計

### 段階的イベント処理

```typescript
class DragEventProcessor {
  // Phase 1: 検証フェーズ
  private validateDragStart(event: DragStartEvent): boolean;
  
  // Phase 2: 準備フェーズ
  private prepareDragState(event: DragStartEvent): DragState;
  
  // Phase 3: 実行フェーズ
  private executeDrop(event: DragEndEvent): void;
  
  // Phase 4: クリーンアップフェーズ
  private cleanupDragState(): void;
}
```

### エラーハンドリング戦略

```typescript
interface DragErrorHandler {
  // 無効なドロップの検出と処理
  handleInvalidDrop(active: Active, over: Over): void;
  
  // データ整合性エラーの処理
  handleDataIntegrityError(error: DataIntegrityError): void;
  
  // パフォーマンス警告の処理
  handlePerformanceWarning(metrics: PerformanceMetrics): void;
}
```

## パフォーマンス最適化

### メモ化戦略

```typescript
// コンポーネントレベル
const MemoizedSortableParentItem = memo(SortableParentItem, (prev, next) => {
  return prev.parentIndex === next.parentIndex &&
         JSON.stringify(prev.watchedData.parentArray[prev.parentIndex]) === 
         JSON.stringify(next.watchedData.parentArray[next.parentIndex]);
});

// Hookレベル
const useMemoizedDragHandlers = () => {
  return useMemo(() => ({
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd
  }), []);
};
```

### 仮想化対応設計

```typescript
// 大量データ対応のための設計拡張点
interface VirtualizedSortableProps {
  itemHeight: number;
  overscan: number;
  estimatedItemSize: number;
}

// react-window との統合インターフェース
interface VirtualDragContext extends DndContextProps {
  virtualizer: Virtualizer;
  scrollElement: HTMLElement;
}
```

## 拡張性設計

### プラグインアーキテクチャ

```typescript
interface SortablePlugin {
  name: string;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  customCollisionDetection?: CollisionDetection;
}

// プラグイン統合
const useSortableWithPlugins = (plugins: SortablePlugin[]) => {
  // プラグインのライフサイクル管理
};
```

### 型拡張性

```typescript
// カスタムデータ型の対応
interface ExtendableSortableForm<T extends Record<string, any> = Data> {
  data: T;
  schema: ZodSchema<T>;
  customValidation?: (data: T) => ValidationResult;
}
```

## セキュリティ考慮事項

### データサニタイゼーション

```typescript
interface DataSanitizer {
  sanitizeParentData(parent: Parent): Parent;
  sanitizeChildData(child: Child): Child;
  validateDataStructure(data: Data): boolean;
}
```

### XSS対策

- すべてのユーザー入力値のエスケープ処理
- HTMLエンティティのサニタイゼーション
- CSP（Content Security Policy）の設定
