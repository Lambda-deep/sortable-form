# sortable-form

## 内容

配列を持ったオブジェクトの配列を対象に、入力フォームと、サイドバーにあるインデックス情報のリストを、相互に同期させつつ並び替えられるようにしたい。

## データ構造

```typescript
type Data = {
  parentArray: Parent[];
}
type Parent = {
  parentKey: string;
  parentValue: string
  childArray: Child[];
}
type Child = {
  childKey: string;
  childValue: string;
}
```

## 並び替えのルール

- parentArray内でのParent要素の並び替えは可能
- childArray内でのChild要素の並び替えは可能
- あるParentから別のParentにChild要素を移動可能

## 技術選定

- React(Remix)を用いたアプリケーション
- 入力フォームの管理にはreact-hook-fromを使う
- 要素の並び替えに使うライブラリはsortablejsが第一候補だが、無理そうであれば他のライブラリも検討する
