# 実装ガイド

本ドキュメントでは、@dnd-kit を使用したソート可能フォームの実装手順を段階的に説明します。

## 実装フェーズ概要

### Phase 1: 親要素のソート機能

- 既存コンポーネントの@dnd-kit対応
- 基本的なドラッグ&ドロップ機能の実装
- フォーム状態との統合

### Phase 2: 子要素のソート機能

- 子要素間のドラッグ&ドロップ
- 親をまたぐ子要素の移動
- 複合ID管理の実装

### Phase 3: サイドバーとの同期

- リアルタイムデータ同期
- サイドバー要素のソート機能
- デュアルインターフェース統合

---

## Phase 1: 親要素のソート機能実装

### 1.1 依存関係のインストール

必要な@dnd-kitパッケージを追加：

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 1.2 型定義の拡張

ドラッグ状態管理のための型を追加：

```typescript
// app/types.ts
export interface DragState {
    activeId: string | null;
    draggedItem: DraggedItem | null;
    dropIndicator: DropIndicator | null;
}

export interface DraggedItem {
    type: "parent" | "child";
    parentIndex: number;
    childIndex?: number;
}
```

### 1.3 useSortableForm フックの拡張

ドラッグイベントハンドラーを追加：

```typescript
// app/hooks/useSortableForm.tsx - 主要部分のみ
const handleDragStart = (event: DragStartEvent) => {
    // ドラッグ開始時の状態設定
};

const handleDragEnd = (event: DragEndEvent) => {
    // 親要素の移動処理
    // arrayMove を使用してuseFieldArrayの配列を更新
};
```

### 1.4 ParentItem コンポーネントの修正

既存のParentItemに useSortable フックを統合：

```typescript
// app/components/ParentItem.tsx - 重要な変更点
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function ParentItem({ ... }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: parentId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <DragHandle attributes={attributes} listeners={listeners} />
      {/* 既存のフォーム要素 */}
    </div>
  );
}
```

### 1.5 DragHandle コンポーネントの更新

@dnd-kit の attributes と listeners を受け取るように修正：

```typescript
// app/components/DragHandle.tsx
interface DragHandleProps {
    attributes?: DraggableAttributes;
    listeners?: SyntheticListenerMap;
}
```

### 1.6 メインルートでの DndContext 統合

```typescript
// app/routes/_index.tsx - 主要構造
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={parentIds} strategy={verticalListSortingStrategy}>
    {/* ParentItem コンポーネントのレンダリング */}
  </SortableContext>
</DndContext>
```

---

## Phase 2: 子要素のソート機能実装

### 2.1 ChildItem コンポーネントの修正

親要素と同様に useSortable フックを統合し、複合ID（`${parentIndex}-${childIndex}`）を使用。

### 2.2 子要素移動ロジックの実装

```typescript
// useSortableForm.tsx に追加
const handleChildMove = (fromParent, fromChild, toParent, toChild) => {
    if (fromParent === toParent) {
        // 同一親内での移動: arrayMove使用
    } else {
        // 異なる親への移動: 削除と挿入の組み合わせ
    }
};
```

### 2.3 ParentItem での SortableContext 追加

子要素用のSortableContextを ParentItem 内に配置し、子要素のIDリストを管理。

---

## Phase 3: サイドバーとの同期実装

### 3.1 SidebarParentItem と SidebarChildItem の修正

フォーム側と同様に useSortable フックを統合し、`sidebar-` プレフィックス付きIDを使用。

### 3.2 リアルタイムデータ同期

React Hook Form の `watch()` を使用して、フォームデータの変更をサイドバーにリアルタイム反映。

### 3.3 衝突検出の最適化

```typescript
// カスタム衝突検出アルゴリズム
const customCollisionDetection = args => {
    // 親要素のドラッグ時は親要素のみをターゲット
    // 子要素のドラッグ時は子要素と親要素をターゲット
};
```

---

## 重要な実装ポイント

### ID管理戦略

- **親要素**: `parent-${index}` または useFieldArray の ID
- **子要素**: `${parentIndex}-${childIndex}`
- **サイドバー**: `sidebar-` プレフィックス付き

### 状態管理

- **フォーム状態**: React Hook Form の useFieldArray が単一の真実の源
- **ドラッグ状態**: 一時的な視覚フィードバック用の独立した状態
- **同期**: watch() による一方向データフロー

### エラーハンドリング

- 無効なドロップターゲットの処理
- ID解析エラーの回避
- フォーム状態の整合性保証

### パフォーマンス最適化

- 不要な再レンダリングの防止
- 大量データ時の仮想化検討
- メモ化の適切な使用

---

## テスト観点

### 単体テスト

- 個別コンポーネントのドラッグ機能
- フック内のデータ変換ロジック

### 統合テスト

- フォームとサイドバーの同期
- 複雑な移動パターンの検証

### E2Eテスト

- 実際のユーザー操作シナリオ
- ブラウザ間の互換性確認

詳細なテスト戦略については [testing-strategy.md](./testing-strategy.md) を参照してください。
