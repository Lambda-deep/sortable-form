import { Page, Locator } from "@playwright/test";

/**
 * dragTo関数の代わりに、低レベルマウス操作を使用してドラッグ&ドロップを実行する共通関数
 * @param page Playwrightのページオブジェクト
 * @param sourceElement ドラッグ元の要素（Locator）
 * @param targetElement ドロップ先の要素（Locator）
 * @param options オプション設定
 */
export async function performDragAndDrop(
    page: Page,
    sourceElement: Locator,
    targetElement: Locator,
    options: {
        steps?: number;
        dragStartDelay?: number;
        dragEndDelay?: number;
        sourceOffset?: { x?: number; y?: number };
        targetOffset?: { x?: number; y?: number };
    } = {}
) {
    const {
        steps = 10,
        dragStartDelay = 100,
        dragEndDelay = 100,
        sourceOffset = {},
        targetOffset = {},
    } = options;

    // 要素の位置を取得
    const sourceBox = await sourceElement.boundingBox();
    const targetBox = await targetElement.boundingBox();

    if (!sourceBox || !targetBox) {
        throw new Error("要素の位置を取得できませんでした");
    }

    // ドラッグ開始位置（デフォルトは要素の中央）
    const sourceX = sourceBox.x + (sourceOffset.x ?? sourceBox.width / 2);
    const sourceY = sourceBox.y + (sourceOffset.y ?? sourceBox.height / 2);

    // ドロップ先位置（デフォルトは要素の中央）
    const targetX = targetBox.x + (targetOffset.x ?? targetBox.width / 2);
    const targetY = targetBox.y + (targetOffset.y ?? targetBox.height / 2);

    // 低レベルマウス操作でドラッグ&ドロップを実行
    await page.mouse.move(sourceX, sourceY);
    await page.mouse.down();
    await page.waitForTimeout(dragStartDelay);
    await page.mouse.move(targetX, targetY, { steps });
    await page.waitForTimeout(dragEndDelay);
    await page.mouse.up();
}

/**
 * Child要素専用のドラッグ&ドロップヘルパー
 * @param page Playwrightのページオブジェクト
 * @param sourceChildIndex ドラッグ元のchild要素のインデックス
 * @param targetChildIndex ドロップ先のchild要素のインデックス
 * @param parentSelector 親要素のセレクター（デフォルトは最初の親要素）
 */
export async function dragChildElement(
    page: Page,
    sourceChildIndex: number,
    targetChildIndex: number,
    parentSelector: string = '[data-testid="parent-item"]'
) {
    const parent = page.locator(parentSelector).first();
    const children = parent.locator('[data-testid="child-item"]');

    const sourceChildHandle = children
        .nth(sourceChildIndex)
        .locator('[data-testid="child-drag-handle"]');
    const targetChild = children
        .nth(targetChildIndex)
        .locator('[data-testid="child-drag-handle"]');

    await performDragAndDrop(page, sourceChildHandle, targetChild);
}

/**
 * Parent要素専用のドラッグ&ドロップヘルパー
 * @param page Playwrightのページオブジェクト
 * @param sourceParentIndex ドラッグ元のparent要素のインデックス
 * @param targetParentIndex ドロップ先のparent要素のインデックス
 */
export async function dragParentElement(
    page: Page,
    sourceParentIndex: number,
    targetParentIndex: number
) {
    const parents = page.locator('[data-testid="parent-item"]');

    const sourceParentHandle = parents
        .nth(sourceParentIndex)
        .locator('[data-testid="parent-drag-handle"]');
    const targetParent = parents
        .nth(targetParentIndex)
        .locator('[data-testid="parent-drag-handle"]');

    await performDragAndDrop(page, sourceParentHandle, targetParent);
}

/**
 * 異なる親間でのChild要素移動専用ヘルパー
 * @param page Playwrightのページオブジェクト
 * @param sourceParentIndex ドラッグ元の親要素のインデックス
 * @param sourceChildIndex ドラッグ元の子要素のインデックス
 * @param targetParentIndex ドロップ先の親要素のインデックス
 * @param targetChildIndex ドロップ先の子要素のインデックス（既存の子要素にドロップ）
 */
export async function dragChildElementBetweenParents(
    page: Page,
    sourceParentIndex: number,
    sourceChildIndex: number,
    targetParentIndex: number,
    targetChildIndex: number
) {
    const parents = page.locator('[data-testid="parent-item"]');

    // ドラッグ元の子要素
    const sourceParent = parents.nth(sourceParentIndex);
    const sourceChildren = sourceParent.locator('[data-testid="child-item"]');
    const sourceChildHandle = sourceChildren
        .nth(sourceChildIndex)
        .locator('[data-testid="child-drag-handle"]');

    // ドロップ先の子要素
    const targetParent = parents.nth(targetParentIndex);
    const targetChildren = targetParent.locator('[data-testid="child-item"]');
    const targetChild = targetChildren
        .nth(targetChildIndex)
        .locator('[data-testid="child-drag-handle"]');

    await performDragAndDrop(page, sourceChildHandle, targetChild);
}

/**
 * サイドバーの異なる親間でのChild要素移動専用ヘルパー
 * @param page Playwrightのページオブジェクト
 * @param sourceParentIndex ドラッグ元の親要素のインデックス
 * @param sourceChildIndex ドラッグ元の子要素のインデックス
 * @param targetParentIndex ドロップ先の親要素のインデックス
 * @param targetChildIndex ドロップ先の子要素のインデックス（既存の子要素にドロップ）
 */
export async function dragSidebarChildElementBetweenParents(
    page: Page,
    sourceParentIndex: number,
    sourceChildIndex: number,
    targetParentIndex: number,
    targetChildIndex: number
) {
    const sidebarParents = page.locator(
        '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
    );

    // ドラッグ元の子要素
    const sourceParent = sidebarParents.nth(sourceParentIndex);
    const sourceChildren = sourceParent.locator(
        '[data-testid="sidebar-child-item"]'
    );
    const sourceChildHandle = sourceChildren
        .nth(sourceChildIndex)
        .locator('[data-testid="sidebar-child-drag-handle"]');

    // ドロップ先の子要素
    const targetParent = sidebarParents.nth(targetParentIndex);
    const targetChildren = targetParent.locator(
        '[data-testid="sidebar-child-item"]'
    );
    const targetChild = targetChildren
        .nth(targetChildIndex)
        .locator('[data-testid="sidebar-child-drag-handle"]');

    await performDragAndDrop(page, sourceChildHandle, targetChild);
}

/**
 * 異なる親間でのChild要素を末尾に移動する専用ヘルパー
 * @param page Playwrightのページオブジェクト
 * @param sourceParentIndex ドラッグ元の親要素のインデックス
 * @param sourceChildIndex ドラッグ元の子要素のインデックス
 * @param targetParentIndex ドロップ先の親要素のインデックス
 */
export async function dragChildElementToParentEnd(
    page: Page,
    sourceParentIndex: number,
    sourceChildIndex: number,
    targetParentIndex: number
) {
    const parents = page.locator('[data-testid="parent-item"]');

    // ドラッグ元の子要素
    const sourceParent = parents.nth(sourceParentIndex);
    const sourceChildren = sourceParent.locator('[data-testid="child-item"]');
    const sourceChildHandle = sourceChildren
        .nth(sourceChildIndex)
        .locator('[data-testid="child-drag-handle"]');

    // ドロップ先の親要素の末尾の子要素を取得
    const targetParent = parents.nth(targetParentIndex);
    const targetChildren = targetParent.locator('[data-testid="child-item"]');

    // 子要素の数を確認
    const childCount = await targetChildren.count();

    if (childCount > 0) {
        // 末尾の子要素にドロップ
        const lastChild = targetChildren.nth(childCount - 1);
        const lastChildHandle = lastChild.locator(
            '[data-testid="child-drag-handle"]'
        );

        // 子要素の高さを取得して動的にオフセットを計算
        const lastChildBox = await lastChildHandle.boundingBox();
        console.log(
            `Child element height: ${lastChildBox?.height}, width: ${lastChildBox?.width}`
        );

        // 要素の高さが18pxの場合、30px（高さ × 1.67）が適切
        // 安全を考慮して高さ × 1.5 + 最小値5pxを使用
        const dynamicOffset = lastChildBox
            ? Math.max(Math.floor(lastChildBox.height * 1.5), 25)
            : 30;
        console.log(`Calculated dynamic offset: ${dynamicOffset}`);

        await performDragAndDrop(page, sourceChildHandle, lastChildHandle, {
            targetOffset: { y: dynamicOffset }, // 計算されたオフセットを使用
        });
    } else {
        // 子要素がない場合はコンテナにドロップ（既存の動作）
        const targetContainer = targetParent.locator(
            '[data-testid="children-container"]'
        );
        await performDragAndDrop(page, sourceChildHandle, targetContainer);
    }
}

/**
 * サイドバーの異なる親間でのChild要素を末尾に移動する専用ヘルパー
 * @param page Playwrightのページオブジェクト
 * @param sourceParentIndex ドラッグ元の親要素のインデックス
 * @param sourceChildIndex ドラッグ元の子要素のインデックス
 * @param targetParentIndex ドロップ先の親要素のインデックス
 */
export async function dragSidebarChildElementToParentEnd(
    page: Page,
    sourceParentIndex: number,
    sourceChildIndex: number,
    targetParentIndex: number
) {
    const sidebarParents = page.locator(
        '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
    );

    // ドラッグ元の子要素
    const sourceParent = sidebarParents.nth(sourceParentIndex);
    const sourceChildren = sourceParent.locator(
        '[data-testid="sidebar-child-item"]'
    );
    const sourceChildHandle = sourceChildren
        .nth(sourceChildIndex)
        .locator('[data-testid="sidebar-child-drag-handle"]');

    // ドロップ先の親要素の末尾の子要素を取得
    const targetParent = sidebarParents.nth(targetParentIndex);
    const targetChildren = targetParent.locator(
        '[data-testid="sidebar-child-item"]'
    );

    // 子要素の数を確認
    const childCount = await targetChildren.count();

    console.log(
        `dragSidebarChildElementToParentEnd: targetParentIndex=${targetParentIndex}, childCount=${childCount}`
    );

    if (childCount > 0) {
        // 末尾の子要素にドロップ
        const lastChild = targetChildren.nth(childCount - 1);
        const lastChildHandle = lastChild.locator(
            '[data-testid="sidebar-child-drag-handle"]'
        );

        console.log(`Dropping to last child at index ${childCount - 1}`);

        // 子要素の高さを取得して動的にオフセットを計算
        const lastChildBox = await lastChildHandle.boundingBox();
        console.log(
            `Sidebar child element height: ${lastChildBox?.height}, width: ${lastChildBox?.width}`
        );

        // サイドバーの要素も同様の計算を適用
        const dynamicOffset = lastChildBox
            ? Math.max(Math.floor(lastChildBox.height * 1.5), 25)
            : 40;
        console.log(`Calculated sidebar dynamic offset: ${dynamicOffset}`);

        await performDragAndDrop(page, sourceChildHandle, lastChildHandle, {
            targetOffset: { y: dynamicOffset }, // 計算されたオフセットを使用
        });
    } else {
        // 子要素がない場合はコンテナにドロップ（既存の動作）
        const targetContainer = targetParent.locator(
            '[data-testid="sidebar-children-container"]'
        );
        console.log("Dropping to container (no children)");
        await performDragAndDrop(page, sourceChildHandle, targetContainer);
    }
}

/**
 * サイドバーのParent要素専用のドラッグ&ドロップヘルパー
 * @param page Playwrightのページオブジェクト
 * @param sourceParentIndex ドラッグ元のparent要素のインデックス
 * @param targetParentIndex ドロップ先のparent要素のインデックス
 */
export async function dragSidebarParentElement(
    page: Page,
    sourceParentIndex: number,
    targetParentIndex: number
) {
    const sidebarParents = page.locator(
        '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
    );

    const sourceSidebarHandle = sidebarParents
        .nth(sourceParentIndex)
        .locator('[data-testid="sidebar-parent-drag-handle"]');
    const targetSidebarParent = sidebarParents
        .nth(targetParentIndex)
        .locator('[data-testid="sidebar-parent-drag-handle"]');

    await performDragAndDrop(page, sourceSidebarHandle, targetSidebarParent);
}
