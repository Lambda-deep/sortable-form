# テクニカル分析詳細

## エラーログ詳細分析

### 1. 子要素並び替えテスト失敗

#### エラーメッセージ

```
Error: expect(locator).toContainText(expected) failed
Locator: locator('.sidebar .index-item').first().locator('.sidebar-child-item').first()
Expected string: "[0.0] child1-2"
Received string: "⋮[0.1] child1-1"
```

#### DOM状態分析

テスト実行時のページスナップショットから確認できる状態：

**フォーム側（正常）**:

```
- textbox "Child Key": child1-2
- textbox "Child Value": Child 1-2
- textbox "Child Key": child1-1  
- textbox "Child Value": Child 1-1
```

**サイドバー側（問題）**:

```
- "[0.1] child1-1"
- "[0.0] child1-2" 
```

#### 問題の詳細

1. フォーム側では正しい順序でデータが表示されている
2. サイドバー側でインデックス計算が正しくない
3. ドラッグハンドル「⋮」が期待しない位置に表示されている

### 2. 親間移動テスト失敗

#### エラーメッセージ

```
Error: expect(locator).toHaveCount(expected) failed
Locator: locator('.sidebar .index-item').first().locator('.sidebar-child-item')
Expected: 1
Received: 0
```

#### 問題分析

- 子要素を異なる親に移動後、移動元の親から子要素が完全に削除されない
- または移動先の親に子要素が正しく追加されない
- DOM更新のタイミング問題の可能性

## コード詳細分析

### SortableJS設定の問題

#### フォーム用設定

```typescript
Sortable.create(container, {
  group: "children",
  animation: 150,
  ghostClass: "sortable-ghost",
  chosenClass: "sortable-chosen",
  onEnd: (evt) => {
    // データ更新ロジック
  },
});
```

#### サイドバー用設定  

```typescript
Sortable.create(container, {
  group: "sidebar-children", // 異なるグループ名
  animation: 150,
  ghostClass: "sortable-ghost", 
  chosenClass: "sortable-chosen",
  onEnd: (evt) => {
    // 同様のデータ更新ロジック
  },
});
```

#### 問題点

1. 異なるグループ名により、要素間の移動が制限される可能性
2. 同じデータソースを2つの異なるSortableインスタンスで管理

### React Hook Form 統合の問題

#### useFieldArray使用パターン

```typescript
const { fields: parentFields, move: moveParent } = useFieldArray({
  control,
  name: "parentArray",
});
```

#### カスタムsetValue使用パターン

```typescript
const newParentArray = [...currentData];
// 配列操作
setValue("parentArray", newParentArray);
```

#### 競合の可能性

1. `useFieldArray.move()` と手動の `setValue()` の同時使用
2. React Hook Form の内部状態と手動更新状態の不整合

### キー属性の問題

#### 現在の実装

```tsx
{parent.childArray.map((child: Child, childIndex: number) => (
  <div key={childIndex} className="sidebar-child-item">
```

#### 問題

1. `childIndex`ベースのキーにより、順序変更時にReactが要素を正しく追跡できない
2. 同一キーの重複により、予期しないレンダリング動作

## パフォーマンス分析

### useEffect依存配列の問題

```typescript
useEffect(() => {
  // Sortable初期化
}, [parentFields, setValue, watchedData.parentArray]);
```

#### 問題点

1. `watchedData.parentArray`が依存配列に含まれるため、データ更新の度に再初期化
2. 頻繁な再初期化によるパフォーマンス低下とバグの可能性

### レンダリング最適化の欠如

- `useMemo`や`useCallback`による最適化が不十分
- 不要な再レンダリングが発生している可能性

## セキュリティ考慮事項

### XSS脆弱性の可能性

```tsx
<span>[{parentIndex}.{childIndex}] {child.childKey}</span>
```

`child.childKey`が直接レンダリングされているため、適切なサニタイゼーションが必要。

## テスト環境分析

### Playwright設定確認

- `playwright.config.ts`の設定が適切か
- ブラウザ環境でのドラッグ&ドロップサポート状況

### テスト安定性の課題

1. `page.waitForTimeout(500)`による固定待機時間の使用
2. 動的要素に対する待機戦略の不足
3. フレーキーテストの発生要因

## 推奨される修正の優先順位

### 緊急（24時間以内）

1. キー属性をユニークな値に変更
2. テストタイムアウト値の調整

### 高優先度（1週間以内）  

1. Sortableグループ設定の統一
2. データ更新ロジックの単一化
3. useEffect依存配列の最適化

### 中優先度（2週間以内）

1. パフォーマンス最適化
2. エラーハンドリングの強化
3. テスト戦略の改善

### 低優先度（1ヶ月以内）

1. 全体的なアーキテクチャ見直し
2. 代替ライブラリの検討
3. ドキュメント整備
