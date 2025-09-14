# 子要素ドラッグアニメーション改善の選択肢

## 問題の概要

**現象**: 子要素のドラッグ&ドロップ終了時に「元の場所に戻ろうとする」不自然なアニメーションが発生

**原因**: SortableContextの構造の違いが原因

- **親要素**: 全体で1つのSortableContextに含まれ、スムーズなアニメーション
- **子要素**: 各親要素内で個別のSortableContextに含まれ、ネストされた構造による不自然なアニメーション

## 解決策の選択肢

### 選択肢1: 単一SortableContextによる統合（推奨）

**概要**: すべての親要素と子要素を1つのSortableContextに含める

**変更点**:

```tsx
// _index.tsx内で
const allChildIds = parentFields.flatMap((parentField, parentIndex) => 
    watchedData.parentArray[parentIndex]?.childArray?.map((_, childIndex) => 
        `${parentIndex}-${childIndex}`
    ) || []
);

<SortableContext
    items={[...parentIds, ...allChildIds]}
    strategy={verticalListSortingStrategy}
>
    // ParentItem内のSortableContextは削除
</SortableContext>
```

**メリット**:

- ✅ 親要素と子要素で統一されたアニメーション動作
- ✅ 「元の場所に戻る」問題の完全解消
- ✅ シンプルで予測可能な動作
- ✅ @dnd-kitの標準的な使用方法に準拠

**デメリット**:

- ❌ 大規模な構造変更が必要
- ❌ 親子関係の管理が複雑になる可能性
- ❌ 既存のドラッグハンドラーロジックの見直しが必要

**実装難易度**: 高
**効果期待度**: 非常に高

---

### 選択肢2: animateLayoutChanges最適化

**概要**: 現在のネストされた構造を維持し、各SortableContextのアニメーション設定を最適化

**変更点**:

```tsx
// ParentItem.tsx内で
<SortableContext
    items={childIds}
    strategy={verticalListSortingStrategy}
    // カスタムアニメーション設定を追加
>
```

**ChildItem.tsx**:

```tsx
const { ... } = useSortable({ 
    id: childId,
    animateLayoutChanges: (args) => {
        // カスタムアニメーション条件
        return args.isSorting || args.wasDragging;
    },
    transition: {
        duration: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
});
```

**メリット**:

- ✅ 既存構造の維持
- ✅ 段階的な改善が可能
- ✅ 実装リスクが低い

**デメリット**:

- ❌ 根本的な解決にならない可能性
- ❌ ネストされたSortableContextの制約は残る
- ❌ 完全な問題解消の保証なし

**実装難易度**: 中
**効果期待度**: 中

---

### 選択肢3: カスタムアニメーション実装

**概要**: @dnd-kitの標準アニメーションを上書きし、独自のアニメーション処理を実装

**変更点**:

```tsx
// カスタムアニメーションフック
const useCustomSortableAnimation = (id: string, type: 'parent' | 'child') => {
    const { transform, transition, ...rest } = useSortable({ id });
    
    const customStyle = useMemo(() => {
        if (type === 'child') {
            return {
                transform: CSS.Transform.toString(transform),
                transition: 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                // カスタムアニメーションロジック
            };
        }
        return { transform: CSS.Transform.toString(transform), transition };
    }, [transform, transition, type]);
    
    return { ...rest, style: customStyle };
};
```

**メリット**:

- ✅ 完全なアニメーション制御
- ✅ 既存構造への影響最小
- ✅ 将来的な拡張性

**デメリット**:

- ❌ 実装が複雑
- ❌ @dnd-kitのアップデートでの互換性リスク
- ❌ デバッグが困難
- ❌ パフォーマンスへの影響の可能性

**実装難易度**: 非常に高
**効果期待度**: 高（ただし不確実性あり）

---

### 選択肢4: CSS Transitionによる上書き

**概要**: JavaScript側の設定はそのままに、CSS側でアニメーションを制御

**変更点**:

```css
/* global.css */
[data-testid="child-item"] {
    transition: transform 300ms cubic-bezier(0.25, 1, 0.5, 1) !important;
}

[data-testid="child-item"][data-sorting="true"] {
    transition: transform 200ms ease-out !important;
}
```

**メリット**:

- ✅ 最小限の変更
- ✅ 実装が簡単
- ✅ すぐにテスト可能

**デメリット**:

- ❌ !importantによる強制上書き
- ❌ JavaScript側との整合性問題
- ❌ 根本的な解決にならない
- ❌ ブラウザ依存の可能性

**実装難易度**: 低
**効果期待度**: 低

---

## 推奨する実装順序

1. **選択肢4**: まず簡単なCSS調整でテスト
2. **選択肢2**: animateLayoutChanges最適化で改善を確認
3. **選択肢1**: 根本的解決のための構造変更
4. **選択肢3**: 最後の手段としてカスタム実装

## 実装時の注意点

- 各選択肢を試行する前に、現在の動作をビデオ録画して比較基準とする
- テストケースで動作確認を行う
- 親要素のアニメーションに影響しないことを確認
- サイドバー側の動作にも影響しないことを確認

## 次のステップ

まず選択肢4から試行し、段階的に効果の高い選択肢に移行していく。
