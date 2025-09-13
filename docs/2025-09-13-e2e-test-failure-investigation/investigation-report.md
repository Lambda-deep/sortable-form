# E2Eテスト失敗調査報告書

**調査日**: 2025年9月13日  
**対象プロジェクト**: sortable-form  
**調査範囲**: Playwrightを使用したE2Eテスト

## 概要

ソート可能フォームアプリケーションのE2Eテストで多数の失敗が発生している。主にドラッグ&ドロップ機能に関連するテストが失敗しており、期待される要素数やインデックス表示の不一致が原因となっている。

## 失敗したテストの一覧

### 子要素関連テスト

1. **サイドバー内で異なる親間での子要素移動ができる**
   - エラー: `expect(locator).toHaveCount(expected) failed`
   - 期待値: 1, 実際値: 0
   - ロケーター: `.sidebar .index-item').first().locator('.sidebar-child-item')`

2. **サイドバー内で同じ親内での子要素並び替えができる**
   - エラー: `expect(locator).toContainText(expected) failed`
   - 期待値: `"[0.0] child1-2"`, 実際値: `"⋮[0.1] child1-1"`

3. **フォーム内での子要素並び替え関連テスト**
   - 複数のテストで同様のパターンで失敗

### 親要素関連テスト

4. **フォーム内での親要素並び替え**
5. **サイドバー内での親要素並び替え**
6. **初期フォーム構造表示**

### フォーム統合テスト

7. **現在のデータでフォーム送信**
8. **複数操作後のデータ整合性**
9. **高速ドラッグ操作でのデータ保持**

## 主要な問題点

### 1. サイドバーでのドラッグ&ドロップ後のインデックス更新不具合

**問題**: サイドバー内でドラッグ&ドロップを実行した後、要素のインデックス表示が正しく更新されていない。

**具体例**:

- 期待値: `[0.0] child1-2`, `[0.1] child1-1`
- 実際値: `⋮[0.1] child1-1`, `⋮[0.0] child1-2`

**原因分析**:

1. サイドバーでのドラッグ操作後、DOM要素の順序は変更されているが、インデックス表示が適切に再計算されていない
2. `key`属性が `childIndex` ベースで設定されているため、React の再レンダリング時に適切に更新されない可能性

### 2. React Hook Form とのデータ同期問題

**問題**: サイドバーでの操作がフォームデータに反映されるが、UI表示との同期に遅延や不整合が発生。

**原因分析**:

- `useFieldArray` の `move` 関数とカスタムの `setValue` 操作の競合
- `watchedData` による監視とSortableJSのDOM操作のタイミング問題

### 3. Sortable.js グループ設定の問題

**問題**: 子要素の親間移動で期待される要素数と実際の要素数が一致しない。

**原因分析**:

- フォーム用とサイドバー用で異なるグループ名（`"children"` vs `"sidebar-children"`）を使用
- 両者間でのデータ同期が適切に行われていない

## コード分析

### 問題のあるコード箇所

#### 1. サイドバー子要素のキー設定

```tsx
{parent.childArray.map((child: Child, childIndex: number) => (
  <div key={childIndex} className="sidebar-child-item">
    <span className="drag-handle sidebar-child-drag-handle">⋮</span>
    <span>[{parentIndex}.{childIndex}] {child.childKey}</span>
  </div>
))}
```

**問題**: `key={childIndex}` により、順序変更時にReactが適切に要素を更新しない可能性。

#### 2. データ更新ロジックの複雑性

```tsx
// サイドバー子要素の並び替え処理
if (fromParentIndex === toParentIndex) {
  // Same parent - just reorder
  const newParentArray = [...currentData];
  const childArray = [...newParentArray[fromParentIndex].childArray];
  const [movedChild] = childArray.splice(evt.oldIndex, 1);
  childArray.splice(evt.newIndex, 0, movedChild);
  newParentArray[fromParentIndex] = {
    ...newParentArray[fromParentIndex],
    childArray,
  };
  setValue("parentArray", newParentArray);
}
```

**問題**: フォーム用とサイドバー用で同じロジックを使用しているが、微妙な違いによる不整合の可能性。

## 推奨される修正方針

### 1. 短期修正（優先度：高）

#### A. キー属性の修正

```tsx
// 修正前
{parent.childArray.map((child: Child, childIndex: number) => (
  <div key={childIndex} className="sidebar-child-item">

// 修正後
{parent.childArray.map((child: Child, childIndex: number) => (
  <div key={`${parentIndex}-${child.childKey}-${childIndex}`} className="sidebar-child-item">
```

#### B. useEffect依存配列の見直し

サイドバー用Sortable初期化の依存配列を調整し、不要な再初期化を防ぐ。

#### C. データ更新後の強制再レンダリング

```tsx
setValue("parentArray", newParentArray, { shouldDirty: true, shouldTouch: true });
```

### 2. 中期修正（優先度：中）

#### A. 統一されたデータ更新関数の作成

フォームとサイドバーで共通のデータ更新ロジックを使用。

#### B. Sortable.js設定の統一

グループ名やオプションを統一し、データフローを簡素化。

### 3. 長期修正（優先度：低）

#### A. 状態管理の改善

React Hook Form以外の状態管理ライブラリ（Zustand, Jotai等）の検討。

#### B. テスト安定性の向上

`waitForTimeout` の代わりに、より信頼性の高い待機方法の実装。

## テスト修正の必要性

### 現在のテスト課題

1. **タイミング問題**: `waitForTimeout(500)` に依存した不安定なテスト
2. **セレクター問題**: DOM構造変更に脆弱なセレクター使用
3. **データ検証不足**: UI表示のみでなく、内部データ状態の検証が必要

### 推奨テスト改善

1. **より堅牢な待機方法**:

   ```typescript
   await expect(sidebarChildren.first()).toContainText('[0.0] child1-2', { timeout: 10000 });
   ```

2. **データ属性の活用**:

   ```typescript
   await expect(page.locator('[data-testid="child-item-0-0"]')).toBeVisible();
   ```

## 結論

E2Eテストの失敗は主に以下の要因による：

1. Reactのキー属性設定によるレンダリング問題
2. SortableJSとReact Hook Formのデータ同期タイミング問題
3. フォームとサイドバー間のデータフロー複雑性

これらの問題は段階的な修正により解決可能であり、まずは短期修正から着手することを推奨する。

## 次のアクション項目

1. **即座に実行**:
   - キー属性の修正
   - テストタイムアウト値の調整

2. **1週間以内**:
   - データ更新ロジックの統一
   - テストセレクターの改善

3. **1ヶ月以内**:
   - 包括的なリファクタリング
   - テスト戦略の見直し
