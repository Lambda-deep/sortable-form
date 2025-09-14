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
    const targetChild = children.nth(targetChildIndex);

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
    const targetParent = parents.nth(targetParentIndex);

    await performDragAndDrop(page, sourceParentHandle, targetParent);
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
    const targetSidebarParent = sidebarParents.nth(targetParentIndex);

    await performDragAndDrop(page, sourceSidebarHandle, targetSidebarParent);
}
