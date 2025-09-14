# 修正提案と実装計画

## 即座に実行すべき修正

### 1. React キー属性の修正

**現在のコード**:

```tsx
{parent.childArray.map((child: Child, childIndex: number) => (
  <div key={childIndex} className="sidebar-child-item">
```

**修正後**:

```tsx
{parent.childArray.map((child: Child, childIndex: number) => (
  <div key={`sidebar-${parentIndex}-${child.childKey}-${childIndex}`} className="sidebar-child-item">
```

**理由**: ユニークなキーにより、React が要素を正しく追跡し、適切に再レンダリングする。

### 2. useEffect 依存配列の最適化

**現在のコード**:

```typescript
useEffect(() => {
    // サイドバー子要素用Sortable初期化
}, [parentFields, setValue, watchedData.parentArray]);
```

**修正後**:

```typescript
useEffect(() => {
    // サイドバー子要素用Sortable初期化
}, [parentFields.length]);
```

**理由**: 不要な再初期化を防ぎ、パフォーマンスと安定性を向上させる。

### 3. テストの待機戦略改善

**現在のコード**:

```typescript
await page.waitForTimeout(500);
```

**修正後**:

```typescript
await expect(sidebarChildren.first()).toContainText("[0.0] child1-2", {
    timeout: 10000,
});
```

**理由**: 固定時間ではなく、条件ベースの待機でテストの安定性を向上させる。

## 中期的な修正提案

### 1. 統一されたデータ更新関数

```typescript
const updateChildOrder = useCallback(
    (
        fromParentIndex: number,
        toParentIndex: number,
        fromChildIndex: number,
        toChildIndex: number
    ) => {
        const currentData = watchedData.parentArray;

        if (fromParentIndex === toParentIndex) {
            // 同一親内での並び替え
            const newParentArray = [...currentData];
            const childArray = [...newParentArray[fromParentIndex].childArray];
            const [movedChild] = childArray.splice(fromChildIndex, 1);
            childArray.splice(toChildIndex, 0, movedChild);

            newParentArray[fromParentIndex] = {
                ...newParentArray[fromParentIndex],
                childArray,
            };

            setValue("parentArray", newParentArray, {
                shouldDirty: true,
                shouldTouch: true,
            });
        } else {
            // 異なる親間での移動
            const newParentArray = [...currentData];
            const fromChildArray = [
                ...newParentArray[fromParentIndex].childArray,
            ];
            const toChildArray = [...newParentArray[toParentIndex].childArray];

            const [movedChild] = fromChildArray.splice(fromChildIndex, 1);
            toChildArray.splice(toChildIndex, 0, movedChild);

            newParentArray[fromParentIndex] = {
                ...newParentArray[fromParentIndex],
                childArray: fromChildArray,
            };
            newParentArray[toParentIndex] = {
                ...newParentArray[toParentIndex],
                childArray: toChildArray,
            };

            setValue("parentArray", newParentArray, {
                shouldDirty: true,
                shouldTouch: true,
            });
        }
    },
    [setValue, watchedData.parentArray]
);
```

### 2. Sortable 設定の統一

```typescript
const commonSortableConfig = {
    animation: 150,
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    forceFallback: true, // より一貫した動作のため
    fallbackOnBody: true,
    swapThreshold: 0.65,
};

// フォーム用
const formSortableConfig = {
    ...commonSortableConfig,
    group: "children",
};

// サイドバー用
const sidebarSortableConfig = {
    ...commonSortableConfig,
    group: "children", // 同じグループ名を使用
};
```

### 3. エラーハンドリングの強化

```typescript
const handleSortError = (error: Error, context: string) => {
  console.error(`Sortable error in ${context}:`, error);
  // エラー報告やユーザー通知の実装
};

// onEnd コールバック内
onEnd: (evt) => {
  try {
    // ソート処理
    updateChildOrder(fromParentIndex, toParentIndex, evt.oldIndex, evt.newIndex);
  } catch (error) {
    handleSortError(error as Error, 'sidebar-children');
    // 必要に応じて状態をリセット
  }
},
```

## 長期的な改善提案

### 1. カスタムフックの作成

```typescript
const useSortableChildren = (parentFields: any[], setValue: Function) => {
    const sortableRefs = useRef<{ [key: number]: HTMLElement | null }>({});
    const sortableInstances = useRef<{ [key: number]: Sortable }>({});

    const initializeSortable = useCallback((parentIndex: number) => {
        // Sortable初期化ロジック
    }, []);

    const cleanupSortable = useCallback((parentIndex: number) => {
        // クリーンアップロジック
    }, []);

    return {
        sortableRefs,
        initializeSortable,
        cleanupSortable,
    };
};
```

### 2. 状態管理の改善

```typescript
// Zustand を使用した例
interface FormState {
    parentArray: Parent[];
    updateParentOrder: (fromIndex: number, toIndex: number) => void;
    updateChildOrder: (
        fromParent: number,
        toParent: number,
        fromChild: number,
        toChild: number
    ) => void;
}

const useFormStore = create<FormState>(set => ({
    parentArray: initialData.parentArray,
    updateParentOrder: (fromIndex, toIndex) =>
        set(state => {
            const newArray = [...state.parentArray];
            const [moved] = newArray.splice(fromIndex, 1);
            newArray.splice(toIndex, 0, moved);
            return { parentArray: newArray };
        }),
    updateChildOrder: (fromParent, toParent, fromChild, toChild) =>
        set(state => {
            // 子要素移動ロジック
        }),
}));
```

### 3. テスト戦略の改善

#### A. データ属性の追加

```tsx
<div
  key={uniqueKey}
  className="sidebar-child-item"
  data-testid={`sidebar-child-${parentIndex}-${childIndex}`}
  data-child-key={child.childKey}
>
```

#### B. 堅牢なテストヘルパー

```typescript
class SortableFormTestHelper {
    constructor(private page: Page) {}

    async waitForChildOrder(parentIndex: number, expectedOrder: string[]) {
        for (let i = 0; i < expectedOrder.length; i++) {
            await expect(
                this.page.locator(
                    `[data-testid="sidebar-child-${parentIndex}-${i}"]`
                )
            ).toContainText(expectedOrder[i], { timeout: 10000 });
        }
    }

    async dragChildToPosition(
        fromParent: number,
        fromChild: number,
        toParent: number,
        toChild: number
    ) {
        const source = this.page.locator(
            `[data-testid="sidebar-child-${fromParent}-${fromChild}"] .drag-handle`
        );
        const target = this.page.locator(
            `[data-testid="sidebar-child-${toParent}-${toChild}"]`
        );

        await source.dragTo(target);
        await this.page.waitForLoadState("networkidle");
    }
}
```

#### C. 改善されたテストコード

```typescript
test("サイドバー内で同じ親内での子要素並び替えができる", async ({ page }) => {
    const helper = new SortableFormTestHelper(page);

    // 初期状態確認
    await helper.waitForChildOrder(0, ["[0.0] child1-1", "[0.1] child1-2"]);

    // ドラッグ操作
    await helper.dragChildToPosition(0, 0, 0, 1);

    // 結果確認
    await helper.waitForChildOrder(0, ["[0.0] child1-2", "[0.1] child1-1"]);
});
```

## 実装スケジュール

### フェーズ 1: 緊急修正 (1-2日)

- [ ] キー属性の修正
- [ ] useEffect依存配列の最適化
- [ ] テスト待機戦略の改善

### フェーズ 2: 中期改善 (1週間)

- [ ] 統一されたデータ更新関数の実装
- [ ] Sortable設定の統一
- [ ] エラーハンドリングの強化

### フェーズ 3: 長期改善 (2-4週間)

- [ ] カスタムフックの作成
- [ ] 状態管理の改善検討
- [ ] 包括的なテスト戦略の実装

## 検証計画

### 1. 単体テスト

- データ更新関数の単体テスト
- カスタムフックのテスト

### 2. 統合テスト

- フォームとサイドバー間の同期テスト
- 複雑なドラッグ&ドロップシナリオのテスト

### 3. E2Eテスト

- 既存テストの安定化
- 新しいテストケースの追加

### 4. パフォーマンステスト

- レンダリング回数の測定
- メモリリークの確認

## リスク評価

### 高リスク

- React Hook Form との互換性問題
- 既存データの整合性への影響

### 中リスク

- パフォーマンスへの影響
- ブラウザ間の互換性問題

### 低リスク

- UI/UXの微調整
- テスト実行時間の増加

## 成功指標

### 定量的指標

- E2Eテスト成功率: 95%以上
- テスト実行時間: 現在の80%以下
- バグ報告数: 現在の50%以下

### 定性的指標

- 開発者体験の向上
- コードの保守性向上
- ユーザー体験の向上
