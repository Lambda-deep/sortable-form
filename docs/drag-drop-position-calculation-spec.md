# ドラッグ&ドロップ時の位置計算仕様書

## 概要

このドキュメントは、Sortable Form におけるドラッグ&ドロップ時の位置計算アルゴリズムの詳細仕様を説明します。
システムは親要素と子要素の階層構造を持ち、フォームとサイドバーの二つのインターフェースで同期されたドラッグ&ドロップ操作を提供します。

## アーキテクチャ概要

### データ構造

```typescript
type Data = {
    parentArray: Parent[];
};

type Parent = {
    parentKey: string;
    parentValue: string;
    childArray: Child[];
};

type Child = {
    childKey: string;
    childValue: string;
};
```

### ID命名規則

- **親要素**: フォーム → `${fieldId}`, サイドバー → `sidebar-${fieldId}`
- **子要素**: フォーム → `${parentIndex}-${childIndex}`, サイドバー → `sidebar-${parentIndex}-${childIndex}`
- **コンテナ**: フォーム → `${fieldId}-container`, サイドバー → `sidebar-${fieldId}-container`

## 位置計算アルゴリズム

### 1. 親要素間の移動

#### 1.1 フォーム内での親要素移動

- **パターン**: 親要素 → 親要素
- **ID識別**: `!childIdPattern.test(activeId) && !childIdPattern.test(overId)`
- **位置計算**:

    ```typescript
    const activeIndex = parentFields.findIndex(field => field.id === active.id);
    const overIndex = parentFields.findIndex(field => field.id === over.id);
    const position = activeIndex < overIndex ? "after" : "before";
    ```

#### 1.2 サイドバー内での親要素移動

- **パターン**: サイドバー親要素 → サイドバー親要素
- **ID識別**: `isActiveSidebar && isOverSidebar && !isChild`
- **位置計算**:

    ```typescript
    const activeId = activeIdStr.replace("sidebar-", "");
    const overId = overIdStr.replace("sidebar-", "");
    const activeIndex = parentFields.findIndex(field => field.id === activeId);
    const overIndex = parentFields.findIndex(field => field.id === overId);
    const position = activeIndex < overIndex ? "after" : "before";
    ```

### 2. 子要素間の移動

#### 2.1 同一親内での子要素移動

- **パターン**: 子要素 → 同一親の子要素
- **条件**: `activeParentIndex === overParentIndex`
- **位置計算**:

    ```typescript
    const position = activeChildIndex < overChildIndex ? "after" : "before";
    ```

- **配列操作**:

    ```typescript
    const newChildArray = [...currentParent.childArray];
    const [movedChild] = newChildArray.splice(activeChildIndex, 1);
    newChildArray.splice(overChildIndex, 0, movedChild);
    ```

#### 2.2 異なる親間での子要素移動（クロスペアレント移動）

- **パターン**: 子要素 → 異なる親の子要素
- **条件**: `activeParentIndex !== overParentIndex`
- **位置計算**: 常に `"before"` ポジションを使用
- **配列操作**:

    ```typescript
    // 移動元から削除
    const newSourceChildArray = [...sourceParent.childArray];
    const [movedChild] = newSourceChildArray.splice(activeChildIndex, 1);
    
    // 移動先に挿入
    const newTargetChildArray = [...targetParent.childArray];
    newTargetChildArray.splice(overChildIndex, 0, movedChild);
    ```

### 3. コンテナへの子要素移動

#### 3.1 マウス位置による挿入位置判定

```typescript
const overCenter = overRect.top + overRect.height / 2;
const dragCenter = rect.top + rect.height / 2;
const isInsertAtEnd = dragCenter > overCenter;
```

#### 3.2 子要素が存在する場合の位置計算

```typescript
const targetChildIndex = isInsertAtEnd 
    ? targetParentData.childArray.length - 1  // 末尾の子要素
    : 0;                                      // 先頭の子要素
const position = isInsertAtEnd ? "after" : "before";
```

#### 3.3 子要素が存在しない場合の位置計算

```typescript
const position = isInsertAtEnd ? "after" : "before";
// 親要素IDを直接使用してドロップ位置を設定
```

## ドロップインジケーター制御

### 表示条件

1. **自分自身への移動は無効**: `active.id === over.id` の場合は非表示
2. **有効な移動パターンのみ表示**: 各移動タイプに応じた条件チェック
3. **リアルタイム更新**: ドラッグオーバー時に即座にインジケーター位置を更新

### 状態管理

```typescript
type DropIndicator = {
    targetId: string;
    position: "before" | "after";
} | null;
```

## 衝突検出アルゴリズム

### サイドバー専用衝突検出

```typescript
export const sidebarCollisionDetection: CollisionDetection = args => {
    const { active, collisionRect, droppableRects, droppableContainers } = args;
    
    if (isActiveSidebarChild) {
        // Child要素は他のChild要素とコンテナに衝突可能
        const validContainers = droppableContainers.filter(container => {
            return sidebarChildPattern.test(containerIdStr) ||
                   sidebarContainerPattern.test(containerIdStr);
        });
    } else {
        // Parent要素は他のParent要素のみに衝突可能
        const validContainers = droppableContainers.filter(container => {
            return containerIdStr.startsWith("sidebar-") &&
                   !sidebarChildPattern.test(containerIdStr) &&
                   !sidebarContainerPattern.test(containerIdStr);
        });
    }
    
    return validateCollisions(validContainers, collisionRect, droppableRects);
};
```

## フォーム状態の同期

### React Hook Form との統合

1. **useFieldArray**: 親要素配列の管理
2. **watch()**: リアルタイムデータ監視
3. **setValue()**: プログラマティック更新

### 同期パターン

```text
Form State (useFieldArray) → watch() → Sidebar Display
                ↑
    Drag Operations (setValue)
```

## エラーハンドリング

### 無効な移動パターン

1. **子要素の親要素への直接ドロップ**: `!overChildId.endsWith("-container")` の場合は警告
2. **存在しない要素への移動**: インデックス範囲外チェック
3. **不正なID形式**: パターンマッチング失敗時の適切な処理

### ログ出力

各移動操作には詳細なコンソールログが記録され、デバッグ時の追跡が可能：

```typescript
console.log("🎯 handleChildMove:", {
    activeParentIndex,
    activeChildIndex,
    overParentIndex,
    overChildIndex,
    isOverChild,
    isDropToEnd: !isOverChild,
});
```

## パフォーマンス考慮事項

### センサー設定

```typescript
const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // 8px移動で開始
        },
    }),
    useSensor(KeyboardSensor)
);
```

### 最適化ポイント

1. **条件ベース衝突検出**: 不要な衝突計算を回避
2. **配列操作の最小化**: splice操作を最適化
3. **状態更新の集約**: 複数の setValue() 呼び出しを最小限に抑制

## テスト戦略

### E2E テストパターン

1. **単一親内移動**: 同じ親要素内での子要素順序変更
2. **クロスペアレント移動**: 異なる親要素間での子要素移動
3. **コンテナ移動**: 空の親要素への子要素挿入
4. **同期検証**: フォームとサイドバーの状態一致確認

### 重要な設定

- **単一ワーカー実行**: `--workers=1` でドラッグ&ドロップの安定性を確保
- **ネットワーク待機**: `page.waitForLoadState("networkidle")` で完全な状態更新を保証

---

この仕様書は、Sortable Form プロジェクトにおけるドラッグ&ドロップ位置計算の完全な実装ガイドとして機能します。
