# dnd-kit 並び替えロジック設計

本ディレクトリには、@dnd-kit ライブラリを使用したソート可能フォームの包括的な設計資料が含まれています。

## 📋 ドキュメント一覧

### [要求仕様書](./requirements.md)

- プロジェクトの背景と目的
- 詳細な機能要件と制約条件
- ドラッグ&ドロップの動作要件
- デュアルインターフェース仕様

### [技術アーキテクチャ設計書](./architecture.md)

- dnd-kit アーキテクチャの全体設計
- コンポーネント構造とコンテキスト設計
- ID管理戦略と衝突検出アルゴリズム
- 状態管理とデータフロー設計

### [実装ガイド](./implementation-guide.md)

- 段階的な実装手順
- 具体的なコードサンプルと解説
- イベントハンドラーとデータ移動ロジック
- 視覚的フィードバックの実装方法

### [テスト戦略](./testing-strategy.md)

- 包括的なテスト計画
- 単体テスト・統合テスト・E2Eテストの方針
- エラーハンドリングとバリデーション
- パフォーマンステストの指針

## 🎯 プロジェクト概要

本プロジェクトは、以下のデータ構造を持つネストした配列の並び替えを可能にするインターフェースを構築します：

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

## 🔧 技術スタック

- **フレームワーク**: React (Remix)
- **フォーム管理**: React Hook Form
- **ドラッグ&ドロップ**: @dnd-kit
- **テスト**: Playwright (E2E)

## 📁 関連ファイル

プロジェクトの実装ファイルについては、以下を参照してください：

- **フックロジック**: `app/hooks/useSortableForm.tsx`
- **型定義**: `app/types.ts`
- **コンポーネント**: `app/components/`
- **テスト**: `tests/`

## 🚀 実装フェーズ

1. **Phase 1**: 基本ドラッグ&ドロップ機能
2. **Phase 2**: 高度な機能（親間移動、制約条件）
3. **Phase 3**: 最適化とテスト

詳細な実装手順については [実装ガイド](./implementation-guide.md) を参照してください。
