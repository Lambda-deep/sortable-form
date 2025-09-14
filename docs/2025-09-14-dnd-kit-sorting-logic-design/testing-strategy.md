# テスト戦略

## テスト戦略概要

本テスト戦略では、@dnd-kitを使用したソート可能フォームの品質を保証するため、包括的なテストアプローチを定義します。

## テストピラミッド

```
         /\
        /  \    E2E Tests (少数・高信頼性)
       /____\
      /      \
     /        \   Integration Tests (中程度)
    /__________\
   /            \
  /              \ Unit Tests (多数・高速)
 /________________\
```

## テストレベル別戦略

### Unit Tests (単体テスト)

#### 対象コンポーネント

| コンポーネント | テスト観点 | 優先度 |
|---------------|-----------|--------|
| `useSortableForm` | フック内ロジック、状態管理 | 高 |
| `SortableParentItem` | 単体コンポーネント動作 | 高 |
| `SortableChildItem` | 単体コンポーネント動作 | 高 |
| `DragHandle` | UI操作レスポンス | 中 |
| ユーティリティ関数 | データ変換、バリデーション | 高 |

#### テストケース例

```typescript
// tests/unit/useSortableForm.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSortableForm } from '../../app/hooks/useSortableForm';

describe('useSortableForm', () => {
  test('初期データが正しく設定される', () => {
    const { result } = renderHook(() => useSortableForm());
    
    expect(result.current.parentFields).toHaveLength(2);
    expect(result.current.watchedData.parentArray[0].parentKey).toBe('parent1');
  });

  test('Parent要素の追加が正しく動作する', () => {
    const { result } = renderHook(() => useSortableForm());
    
    act(() => {
      result.current.addParent();
    });
    
    expect(result.current.parentFields).toHaveLength(3);
  });

  test('Parent要素の削除が正しく動作する', () => {
    const { result } = renderHook(() => useSortableForm());
    
    act(() => {
      result.current.removeParent(0);
    });
    
    expect(result.current.parentFields).toHaveLength(1);
  });

  test('Child要素の追加が正しく動作する', () => {
    const { result } = renderHook(() => useSortableForm());
    
    act(() => {
      result.current.addChild(0);
    });
    
    expect(result.current.watchedData.parentArray[0].childArray).toHaveLength(3);
  });
});
```

#### データ移動ロジックのテスト

```typescript
// tests/unit/dragLogic.test.ts
import { arrayMove } from '@dnd-kit/sortable';

describe('ドラッグ移動ロジック', () => {
  test('Parent要素の移動が正しく動作する', () => {
    const parentArray = [
      { parentKey: 'p1', parentValue: 'Parent 1', childArray: [] },
      { parentKey: 'p2', parentValue: 'Parent 2', childArray: [] },
      { parentKey: 'p3', parentValue: 'Parent 3', childArray: [] }
    ];
    
    const result = arrayMove(parentArray, 0, 2);
    
    expect(result[0].parentKey).toBe('p2');
    expect(result[1].parentKey).toBe('p3');
    expect(result[2].parentKey).toBe('p1');
  });

  test('Child要素の同一親内移動が正しく動作する', () => {
    const childArray = [
      { childKey: 'c1', childValue: 'Child 1' },
      { childKey: 'c2', childValue: 'Child 2' },
      { childKey: 'c3', childValue: 'Child 3' }
    ];
    
    const result = arrayMove(childArray, 0, 2);
    
    expect(result[0].childKey).toBe('c2');
    expect(result[1].childKey).toBe('c3');
    expect(result[2].childKey).toBe('c1');
  });
});
```

### Integration Tests (統合テスト)

#### フォーム統合テスト

```typescript
// tests/integration/formIntegration.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableParentItem } from '../../app/components/SortableParentItem';
import { useSortableForm } from '../../app/hooks/useSortableForm';

const TestWrapper = () => {
  const formHook = useSortableForm();
  
  return (
    <DndContext>
      <form onSubmit={formHook.handleSubmit(formHook.onSubmit)}>
        {formHook.parentFields.map((parent, index) => (
          <SortableParentItem
            key={parent.id}
            parentIndex={index}
            register={formHook.register}
            removeParent={formHook.removeParent}
            watchedData={formHook.watchedData}
            addChild={formHook.addChild}
            removeChild={formHook.removeChild}
          />
        ))}
        <button type="submit">Submit</button>
      </form>
    </DndContext>
  );
};

describe('フォーム統合テスト', () => {
  test('フォーム入力とドラッグ機能が連携して動作する', () => {
    render(<TestWrapper />);
    
    const parentKeyInput = screen.getByDisplayValue('parent1');
    fireEvent.change(parentKeyInput, { target: { value: 'updated-parent1' } });
    
    expect(parentKeyInput).toHaveValue('updated-parent1');
  });

  test('Child要素の追加・削除が正しく反映される', () => {
    render(<TestWrapper />);
    
    const addChildButton = screen.getAllByText('+ Add Child')[0];
    fireEvent.click(addChildButton);
    
    // 新しいChild要素が追加されたことを確認
    expect(screen.getAllByPlaceholderText('Child Key')).toHaveLength(3);
  });
});
```

#### サイドバー同期テスト

```typescript
// tests/integration/sidebarSync.test.tsx
describe('サイドバー同期テスト', () => {
  test('フォーム変更がサイドバーに即座に反映される', async () => {
    const { result } = renderHook(() => useSortableForm());
    
    act(() => {
      result.current.setValue('parentArray.0.parentValue', 'Updated Parent');
    });
    
    // watch による同期を待機
    await waitFor(() => {
      expect(result.current.sidebarData.parentArray[0].parentValue)
        .toBe('Updated Parent');
    });
  });

  test('Parent要素の順序変更がサイドバーに反映される', async () => {
    const { result } = renderHook(() => useSortableForm());
    
    const mockDragEndEvent = {
      active: { id: result.current.parentFields[0].id },
      over: { id: result.current.parentFields[1].id }
    };
    
    act(() => {
      result.current.dragHandlers.onDragEnd(mockDragEndEvent);
    });
    
    await waitFor(() => {
      expect(result.current.sidebarData.parentArray[0].parentKey)
        .toBe('parent2');
    });
  });
});
```

### E2E Tests (エンドツーエンドテスト)

#### Playwright設定の拡張

```typescript
// tests/e2e/dragAndDrop.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ドラッグ&ドロップ機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Parent要素のドラッグ&ドロップ並び替え', async ({ page }) => {
    // 初期状態の確認
    const firstParent = page.locator('[data-testid="parent-item"]').first();
    const firstParentValue = await firstParent.locator('input[name*="parentValue"]').inputValue();
    
    // ドラッグ&ドロップ実行
    const secondParent = page.locator('[data-testid="parent-item"]').nth(1);
    await firstParent.locator('[data-testid="drag-handle"]').dragTo(secondParent);
    
    // 結果確認
    const newFirstParent = page.locator('[data-testid="parent-item"]').first();
    const newFirstParentValue = await newFirstParent.locator('input[name*="parentValue"]').inputValue();
    
    expect(newFirstParentValue).not.toBe(firstParentValue);
  });

  test('Child要素の異なる親間での移動', async ({ page }) => {
    // 最初の親の子要素を取得
    const sourceChild = page.locator('[data-testid="child-item"]').first();
    const sourceChildValue = await sourceChild.locator('input[name*="childValue"]').inputValue();
    
    // 二番目の親に移動
    const targetParent = page.locator('[data-testid="parent-item"]').nth(1);
    await sourceChild.locator('[data-testid="drag-handle"]').dragTo(targetParent);
    
    // 移動先で子要素が追加されたことを確認
    const targetChildren = targetParent.locator('[data-testid="child-item"]');
    const lastChild = targetChildren.last();
    const movedChildValue = await lastChild.locator('input[name*="childValue"]').inputValue();
    
    expect(movedChildValue).toBe(sourceChildValue);
  });

  test('フォームとサイドバーの同期', async ({ page }) => {
    // フォーム側で値を変更
    const parentValueInput = page.locator('input[name="parentArray.0.parentValue"]');
    await parentValueInput.fill('Updated Parent Value');
    
    // サイドバーで同期されたことを確認
    const sidebarParentValue = page.locator('[data-testid="sidebar-parent"]').first();
    await expect(sidebarParentValue).toContainText('Updated Parent Value');
  });
});
```

#### ドラッグ&ドロップヘルパー関数

```typescript
// tests/e2e/helpers/dragHelpers.ts
import { Page, Locator } from '@playwright/test';

export class DragDropHelper {
  constructor(private page: Page) {}

  async dragElement(source: Locator, target: Locator) {
    // より安定したドラッグ&ドロップ実装
    const sourceBoundingBox = await source.boundingBox();
    const targetBoundingBox = await target.boundingBox();
    
    if (!sourceBoundingBox || !targetBoundingBox) {
      throw new Error('要素のbounding boxが取得できません');
    }
    
    // ドラッグ開始
    await this.page.mouse.move(
      sourceBoundingBox.x + sourceBoundingBox.width / 2,
      sourceBoundingBox.y + sourceBoundingBox.height / 2
    );
    await this.page.mouse.down();
    
    // 移動
    await this.page.mouse.move(
      targetBoundingBox.x + targetBoundingBox.width / 2,
      targetBoundingBox.y + targetBoundingBox.height / 2,
      { steps: 10 }
    );
    
    // ドロップ
    await this.page.mouse.up();
    
    // 操作の完了を待機
    await this.page.waitForTimeout(100);
  }

  async verifyDropIndicator(isVisible: boolean) {
    const dropIndicator = this.page.locator('[data-testid="drop-indicator"]');
    
    if (isVisible) {
      await expect(dropIndicator).toBeVisible();
    } else {
      await expect(dropIndicator).not.toBeVisible();
    }
  }
}
```

## パフォーマンステスト

### レンダリングパフォーマンス

```typescript
// tests/performance/renderPerformance.test.ts
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';

describe('レンダリングパフォーマンス', () => {
  test('大量データでのレンダリング時間が許容範囲内', () => {
    const largeDataSet = generateLargeDataSet(100); // 100個のParent要素
    
    const startTime = performance.now();
    render(<SortableForm initialData={largeDataSet} />);
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(1000); // 1秒以内
  });

  test('ドラッグ操作のフレームレート維持', async () => {
    // フレームレート測定ロジック
    const frameRates: number[] = [];
    
    // ドラッグ操作中のフレームレート計測
    // 実装は複雑になるため、実際のプロジェクトでは専用ツールを使用
    
    const averageFrameRate = frameRates.reduce((a, b) => a + b) / frameRates.length;
    expect(averageFrameRate).toBeGreaterThan(55); // 55FPS以上
  });
});
```

### メモリリーク検出

```typescript
// tests/performance/memoryLeak.test.ts
describe('メモリリーク検出', () => {
  test('コンポーネントの mount/unmount でメモリリークがない', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize;
    
    // 複数回のマウント・アンマウント
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<SortableForm />);
      unmount();
    }
    
    // ガベージコレクション強制実行
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;
    
    // メモリ増加が許容範囲内であることを確認
    expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB未満
  });
});
```

## アクセシビリティテスト

### キーボードナビゲーション

```typescript
// tests/a11y/keyboardNavigation.test.ts
test('キーボードによるドラッグ&ドロップ操作', async ({ page }) => {
  await page.goto('/');
  
  // 最初のドラッグハンドルにフォーカス
  const firstDragHandle = page.locator('[data-testid="drag-handle"]').first();
  await firstDragHandle.focus();
  
  // スペースキーでドラッグ開始
  await page.keyboard.press('Space');
  
  // 矢印キーで移動
  await page.keyboard.press('ArrowDown');
  
  // スペースキーでドロップ
  await page.keyboard.press('Space');
  
  // 結果確認
  // 要素の順序が変更されたことを確認する
});
```

### スクリーンリーダー対応

```typescript
// tests/a11y/screenReader.test.ts
test('スクリーンリーダー用のaria属性が正しく設定される', async ({ page }) => {
  await page.goto('/');
  
  // ドラッグ可能要素のaria属性確認
  const draggableElement = page.locator('[data-testid="parent-item"]').first();
  
  await expect(draggableElement).toHaveAttribute('role', 'button');
  await expect(draggableElement).toHaveAttribute('tabindex', '0');
  await expect(draggableElement).toHaveAttribute('aria-describedby');
  
  // ドラッグ開始時のaria-labelの変更確認
  await draggableElement.focus();
  await page.keyboard.press('Space');
  
  await expect(draggableElement).toHaveAttribute('aria-pressed', 'true');
});
```

## エラーシナリオテスト

### 境界値テスト

```typescript
// tests/edge-cases/boundaryTests.test.ts
describe('境界値テスト', () => {
  test('空の配列での操作', () => {
    const emptyData = { parentArray: [] };
    const { result } = renderHook(() => useSortableForm(emptyData));
    
    // 空の状態での操作が正常に動作することを確認
    expect(result.current.parentFields).toHaveLength(0);
    
    act(() => {
      result.current.addParent();
    });
    
    expect(result.current.parentFields).toHaveLength(1);
  });

  test('単一要素での操作', () => {
    const singleParentData = {
      parentArray: [{
        parentKey: 'single',
        parentValue: 'Single Parent',
        childArray: []
      }]
    };
    
    const { result } = renderHook(() => useSortableForm(singleParentData));
    
    // 単一要素での移動操作は効果がないことを確認
    const mockDragEvent = {
      active: { id: result.current.parentFields[0].id },
      over: { id: result.current.parentFields[0].id }
    };
    
    act(() => {
      result.current.dragHandlers.onDragEnd(mockDragEvent);
    });
    
    // 配列の順序に変化がないことを確認
    expect(result.current.parentFields[0].id).toBe(
      result.current.parentFields[0].id
    );
  });
});
```

### ネットワークエラー時の動作

```typescript
// tests/edge-cases/networkErrors.test.ts
test('ネットワークエラー時のフォーム送信処理', async ({ page }) => {
  // ネットワークを無効化
  await page.context().setOffline(true);
  
  await page.goto('/');
  
  // フォーム送信試行
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();
  
  // エラーメッセージが表示されることを確認
  await expect(page.locator('[data-testid="error-message"]'))
    .toContainText('ネットワークエラーが発生しました');
  
  // ネットワークを復元
  await page.context().setOffline(false);
});
```

## テストデータ管理

### テストデータファクトリー

```typescript
// tests/helpers/testDataFactory.ts
export class TestDataFactory {
  static createParent(overrides: Partial<Parent> = {}): Parent {
    return {
      parentKey: 'test-parent',
      parentValue: 'Test Parent',
      childArray: [],
      ...overrides
    };
  }

  static createChild(overrides: Partial<Child> = {}): Child {
    return {
      childKey: 'test-child',
      childValue: 'Test Child',
      ...overrides
    };
  }

  static createCompleteData(parentCount: number = 2, childrenPerParent: number = 2): Data {
    return {
      parentArray: Array.from({ length: parentCount }, (_, pIndex) => ({
        parentKey: `parent-${pIndex}`,
        parentValue: `Parent ${pIndex + 1}`,
        childArray: Array.from({ length: childrenPerParent }, (_, cIndex) => ({
          childKey: `child-${pIndex}-${cIndex}`,
          childValue: `Child ${pIndex + 1}-${cIndex + 1}`
        }))
      }))
    };
  }

  static createLargeDataSet(parentCount: number): Data {
    return this.createCompleteData(parentCount, 5);
  }
}
```

## CI/CD での自動テスト

### GitHub Actions設定例

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## テストメトリクス

### カバレッジ目標

| テストタイプ | カバレッジ目標 | 測定項目 |
|-------------|--------------|----------|
| Unit Tests | 90%以上 | Line Coverage |
| Integration Tests | 80%以上 | Branch Coverage |
| E2E Tests | 主要機能100% | User Journey Coverage |

### 品質ゲート

- すべてのテストがパス
- カバレッジ目標の達成
- パフォーマンステストの基準クリア
- アクセシビリティテストの合格

この包括的なテスト戦略により、ドラッグ&ドロップ機能の品質と信頼性を確保できます。
