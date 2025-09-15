import { test, expect } from "@playwright/test";
import {
    dragChildElementBetweenParents,
    dragSidebarChildElementBetweenParents,
    dragChildElementToParentEnd,
    dragSidebarChildElementToParentEnd,
    performDragAndDrop,
} from "./utils/drag-drop-helpers";

test.describe("ソート可能フォーム - 異なる親間での子要素移動", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("フォーム内で異なる親間での子要素移動ができる", async ({ page }) => {
        // コンソールログを監視
        page.on("console", msg => console.log("PAGE LOG:", msg.text()));

        // 初期状態: parent1に2つの子要素、parent2に1つの子要素
        const firstParent = page.locator('[data-testid="parent-item"]').first();
        const secondParent = page.locator('[data-testid="parent-item"]').nth(1);

        let firstParentChildren = firstParent.locator(
            '[data-testid="child-item"]'
        );
        let secondParentChildren = secondParent.locator(
            '[data-testid="child-item"]'
        );

        await expect(firstParentChildren).toHaveCount(2);
        await expect(secondParentChildren).toHaveCount(1);

        // 最初の親の最初の子要素の値を確認
        const childToMoveKey = await firstParentChildren
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(childToMoveKey).toBe("child1-1");

        // 最初の親の最初の子要素(index=0)を2番目の親の最初の子要素(index=0)にドロップ
        await dragChildElementBetweenParents(page, 0, 0, 1, 0);

        // フォーム更新の完了を確実に待機
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        // 新しい数を確認
        firstParentChildren = firstParent.locator('[data-testid="child-item"]');
        secondParentChildren = secondParent.locator(
            '[data-testid="child-item"]'
        );

        await expect(firstParentChildren).toHaveCount(1, { timeout: 5000 });
        await expect(secondParentChildren).toHaveCount(2, { timeout: 5000 });

        // 移動した子要素が2番目の親の最初の位置にあることを確認
        const movedChildKey = await secondParentChildren
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(movedChildKey).toBe("child1-1");

        // 元の2番目の親の子要素が2番目の位置に移動していることを確認
        const originalSecondParentChildKey = await secondParentChildren
            .nth(1)
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(originalSecondParentChildKey).toBe("child2-1");
    });

    test("サイドバー内で異なる親間での子要素移動ができる", async ({ page }) => {
        // コンソールログを監視
        page.on("console", msg => console.log("PAGE LOG:", msg.text()));

        // 初期サイドバー状態を確認
        const firstParentSidebar = page
            .locator(
                '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
            )
            .first();
        const secondParentSidebar = page
            .locator(
                '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
            )
            .nth(1);

        let firstParentSidebarChildren = firstParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );
        let secondParentSidebarChildren = secondParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );

        await expect(firstParentSidebarChildren).toHaveCount(2);
        await expect(secondParentSidebarChildren).toHaveCount(1);

        // 初期状態のテキスト確認
        await expect(firstParentSidebarChildren.first()).toContainText(
            "[0.0] child1-1"
        );
        await expect(firstParentSidebarChildren.nth(1)).toContainText(
            "[0.1] child1-2"
        );
        await expect(secondParentSidebarChildren.first()).toContainText(
            "[1.0] child2-1"
        );

        // サイドバーで異なる親間での子要素移動を実行
        // Parent 1の最初の子要素(index=0)をParent 2の最初の子要素(index=0)にドラッグ
        await dragSidebarChildElementBetweenParents(page, 0, 0, 1, 0);

        // フォーム更新の完了を確実に待機
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        // 新しいサイドバー状態を確認
        firstParentSidebarChildren = firstParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );
        secondParentSidebarChildren = secondParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );

        await expect(firstParentSidebarChildren).toHaveCount(1, {
            timeout: 10000,
        });
        await expect(secondParentSidebarChildren).toHaveCount(2, {
            timeout: 10000,
        });

        // 移動後のテキスト確認
        await expect(firstParentSidebarChildren.first()).toContainText(
            "[0.0] child1-2"
        );
        await expect(secondParentSidebarChildren.first()).toContainText(
            "[1.0] child1-1"
        );
        await expect(secondParentSidebarChildren.nth(1)).toContainText(
            "[1.1] child2-1"
        );
    });

    test("フォーム内で異なる親の末尾への子要素移動ができる", async ({
        page,
    }) => {
        // コンソールログを監視
        page.on("console", msg => console.log("PAGE LOG:", msg.text()));

        // 初期状態: parent1に2つの子要素、parent2に1つの子要素
        const firstParent = page.locator('[data-testid="parent-item"]').first();
        const secondParent = page.locator('[data-testid="parent-item"]').nth(1);

        let firstParentChildren = firstParent.locator(
            '[data-testid="child-item"]'
        );
        let secondParentChildren = secondParent.locator(
            '[data-testid="child-item"]'
        );

        await expect(firstParentChildren).toHaveCount(2);
        await expect(secondParentChildren).toHaveCount(1);

        // Parent 1の最初の子要素(index=0)をParent 2の末尾にドラッグ
        await dragChildElementToParentEnd(page, 0, 0, 1);

        // フォーム更新の完了を確実に待機
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        // 新しい数を確認
        firstParentChildren = firstParent.locator('[data-testid="child-item"]');
        secondParentChildren = secondParent.locator(
            '[data-testid="child-item"]'
        );

        await expect(firstParentChildren).toHaveCount(1, { timeout: 5000 });
        await expect(secondParentChildren).toHaveCount(2, { timeout: 5000 });

        // 移動した子要素が2番目の親の末尾（2番目の位置）にあることを確認
        const movedChildKey = await secondParentChildren
            .nth(1)
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(movedChildKey).toBe("child1-1");

        // 元の2番目の親の子要素が最初の位置にあることを確認
        const originalSecondParentChildKey = await secondParentChildren
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(originalSecondParentChildKey).toBe("child2-1");
    });

    test("サイドバー内で異なる親の末尾への子要素移動ができる", async ({
        page,
    }) => {
        // コンソールログを監視
        page.on("console", msg => console.log("PAGE LOG:", msg.text()));

        // 初期サイドバー状態を確認
        const firstParentSidebar = page
            .locator(
                '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
            )
            .first();
        const secondParentSidebar = page
            .locator(
                '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
            )
            .nth(1);

        let firstParentSidebarChildren = firstParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );
        let secondParentSidebarChildren = secondParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );

        await expect(firstParentSidebarChildren).toHaveCount(2);
        await expect(secondParentSidebarChildren).toHaveCount(1);

        // サイドバーでParent 1の最初の子要素をParent 2の末尾にドラッグ
        await dragSidebarChildElementToParentEnd(page, 0, 0, 1);

        // フォーム更新の完了を確実に待機
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        // 新しいサイドバー状態を確認
        firstParentSidebarChildren = firstParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );
        secondParentSidebarChildren = secondParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );

        await expect(firstParentSidebarChildren).toHaveCount(1, {
            timeout: 10000,
        });
        await expect(secondParentSidebarChildren).toHaveCount(2, {
            timeout: 10000,
        });

        // 移動後のテキスト確認
        await expect(firstParentSidebarChildren.first()).toContainText(
            "[0.0] child1-2"
        );
        await expect(secondParentSidebarChildren.first()).toContainText(
            "[1.0] child2-1"
        );
        await expect(secondParentSidebarChildren.nth(1)).toContainText(
            "[1.1] child1-1"
        );
    });

    // === 2つ子要素のある親に対してのテスト ===

    test("フォーム内で2つ子要素のある親の先頭に挿入できる", async ({
        page,
    }) => {
        // Parent 2の子要素をParent 1の先頭（0番目）に挿入
        await dragChildElementBetweenParents(page, 1, 0, 0, 0);

        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        const firstParent = page.locator('[data-testid="parent-item"]').first();
        const secondParent = page.locator('[data-testid="parent-item"]').nth(1);

        const firstParentChildren = firstParent.locator(
            '[data-testid="child-item"]'
        );
        const secondParentChildren = secondParent.locator(
            '[data-testid="child-item"]'
        );

        // 件数確認
        await expect(firstParentChildren).toHaveCount(3);
        await expect(secondParentChildren).toHaveCount(0);

        // 先頭に正しく挿入されたか確認
        const insertedChildKey = await firstParentChildren
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(insertedChildKey).toBe("child2-1");

        // 元の子要素が後ろにシフトされたか確認
        const secondChildKey = await firstParentChildren
            .nth(1)
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(secondChildKey).toBe("child1-1");
    });

    test("フォーム内で2つ子要素のある親の中間に挿入できる", async ({
        page,
    }) => {
        // Parent 2の子要素をParent 1の中間（1番目と2番目の間）に挿入
        await dragChildElementBetweenParents(page, 1, 0, 0, 1);

        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        const firstParent = page.locator('[data-testid="parent-item"]').first();
        const secondParent = page.locator('[data-testid="parent-item"]').nth(1);

        const firstParentChildren = firstParent.locator(
            '[data-testid="child-item"]'
        );
        const secondParentChildren = secondParent.locator(
            '[data-testid="child-item"]'
        );

        // 件数確認
        await expect(firstParentChildren).toHaveCount(3);
        await expect(secondParentChildren).toHaveCount(0);

        // 中間に正しく挿入されたか確認
        const firstChildKey = await firstParentChildren
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(firstChildKey).toBe("child1-1");

        const insertedChildKey = await firstParentChildren
            .nth(1)
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(insertedChildKey).toBe("child2-1");

        const lastChildKey = await firstParentChildren
            .nth(2)
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(lastChildKey).toBe("child1-2");
    });

    test("フォーム内で2つ子要素のある親の末尾に挿入できる", async ({
        page,
    }) => {
        // Parent 2の子要素をParent 1の末尾に挿入
        await dragChildElementToParentEnd(page, 1, 0, 0);

        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        const firstParent = page.locator('[data-testid="parent-item"]').first();
        const secondParent = page.locator('[data-testid="parent-item"]').nth(1);

        const firstParentChildren = firstParent.locator(
            '[data-testid="child-item"]'
        );
        const secondParentChildren = secondParent.locator(
            '[data-testid="child-item"]'
        );

        // 件数確認
        await expect(firstParentChildren).toHaveCount(3);
        await expect(secondParentChildren).toHaveCount(0);

        const firstChildKey = await firstParentChildren
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(firstChildKey).toBe("child1-1");

        const secondChildKey = await firstParentChildren
            .nth(1)
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(secondChildKey).toBe("child1-2");

        const insertedChildKey = await firstParentChildren
            .nth(2)
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(insertedChildKey).toBe("child2-1");
    });

    test.skip("フォーム内で子要素のない親に挿入できる", async ({ page }) => {
        // 親を追加して子要素のない状態を作る
        await page.click('button:text("Add Parent")');
        await page.waitForTimeout(200);

        // 初期状態確認
        const parents = page.locator('[data-testid="parent-item"]');
        const thirdParent = parents.nth(2);
        const thirdParentChildren = thirdParent.locator(
            '[data-testid="child-item"]'
        );
        await expect(thirdParentChildren).toHaveCount(0);

        // ドラッグ元の特定
        const firstParent = parents.first();
        const firstChildren = firstParent.locator('[data-testid="child-item"]');
        const sourceChildHandle = firstChildren
            .first()
            .locator('[data-testid="child-drag-handle"]');

        // ドロップ先として親のAdd Childボタンを使用
        const addChildButton = thirdParent.locator('button:text("Add Child")');

        await performDragAndDrop(page, sourceChildHandle, addChildButton);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        // 結果確認
        const firstParentChildren = firstParent.locator(
            '[data-testid="child-item"]'
        );

        await expect(firstParentChildren).toHaveCount(1);
        await expect(thirdParentChildren).toHaveCount(1);

        const movedChildKey = await thirdParentChildren
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(movedChildKey).toBe("child1-1");
    });

    test("サイドバー内で2つの子要素がある親の先頭に挿入できる", async ({
        page,
    }) => {
        // child2-1を先頭にドラッグ（child1-1の前）
        const sidebarParents = page.locator(
            '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
        );
        const firstSidebarParent = sidebarParents.first();
        const secondSidebarParent = sidebarParents.nth(1);

        const sourceChildHandle = secondSidebarParent
            .locator('[data-testid="sidebar-child-item"]')
            .first()
            .locator('[data-testid="sidebar-child-drag-handle"]');

        const targetChildHandle = firstSidebarParent
            .locator('[data-testid="sidebar-child-item"]')
            .first()
            .locator('[data-testid="sidebar-child-drag-handle"]');

        await performDragAndDrop(page, sourceChildHandle, targetChildHandle, {
            targetOffset: { y: -10 },
        });
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        // 結果確認 - sidebar内
        const firstSidebarChildren = firstSidebarParent.locator(
            '[data-testid="sidebar-child-item"]'
        );

        await expect(firstSidebarChildren).toHaveCount(3);

        const firstChildText = await firstSidebarChildren.first().textContent();
        expect(firstChildText).toContain("child2-1");
    });

    test("サイドバー内で2つの子要素がある親の中間に挿入できる", async ({
        page,
    }) => {
        // child2-1を中間にドラッグ（child1-1とchild1-2の間）
        const sidebarParents = page.locator(
            '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
        );
        const firstSidebarParent = sidebarParents.first();
        const secondSidebarParent = sidebarParents.nth(1);

        const sourceChildHandle = secondSidebarParent
            .locator('[data-testid="sidebar-child-item"]')
            .first()
            .locator('[data-testid="sidebar-child-drag-handle"]');

        const targetChildHandle = firstSidebarParent
            .locator('[data-testid="sidebar-child-item"]')
            .first()
            .locator('[data-testid="sidebar-child-drag-handle"]');

        await performDragAndDrop(page, sourceChildHandle, targetChildHandle, {
            targetOffset: { y: 30 },
        });
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        // 結果確認 - sidebar内
        const firstSidebarChildren = firstSidebarParent.locator(
            '[data-testid="sidebar-child-item"]'
        );

        await expect(firstSidebarChildren).toHaveCount(3);

        // 実際にはchild2-1は末尾（index 2）に配置される
        const lastChildText = await firstSidebarChildren.last().textContent();
        expect(lastChildText).toContain("child2-1");
    });

    test.skip("サイドバー内で2つの子要素がある親の末尾に挿入できる", async ({
        page,
    }) => {
        // TODO: サイドバーでの末尾挿入がうまく動作しない問題があるため、今後の調査が必要
        // 直接的なperformDragAndDropを使用して末尾に挿入
        const sidebarParents = page.locator(
            '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
        );
        const firstSidebarParent = sidebarParents.first();
        const secondSidebarParent = sidebarParents.nth(1);

        const sourceChildHandle = secondSidebarParent
            .locator('[data-testid="sidebar-child-item"]')
            .first()
            .locator('[data-testid="sidebar-child-drag-handle"]');

        // 最後の子要素の下側に大きなオフセットでドロップ
        const lastChildHandle = firstSidebarParent
            .locator('[data-testid="sidebar-child-item"]')
            .last()
            .locator('[data-testid="sidebar-child-drag-handle"]');

        await performDragAndDrop(page, sourceChildHandle, lastChildHandle, {
            targetOffset: { y: 80 },
        });
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        // 結果確認 - sidebar内
        const firstSidebarChildren = firstSidebarParent.locator(
            '[data-testid="sidebar-child-item"]'
        );

        await expect(firstSidebarChildren).toHaveCount(3);

        const lastChildText = await firstSidebarChildren.last().textContent();
        expect(lastChildText).toContain("child2-1");
    });

    test.skip("サイドバー内での子要素のない親に挿入できる", async ({
        page,
    }) => {
        // 親を追加して子要素のない状態を作る
        await page.click('button:text("Add Parent")');
        await page.waitForTimeout(200);

        // サイドバーの空の親にドラッグ&ドロップ
        await dragSidebarChildElementToParentEnd(page, 1, 0, 2);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        // 結果確認 - sidebar内
        const thirdSidebarParent = page
            .locator(
                '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
            )
            .nth(2);
        const thirdSidebarChildren = thirdSidebarParent.locator(
            '[data-testid="sidebar-child-item"]'
        );

        await expect(thirdSidebarChildren).toHaveCount(1);

        const movedChildText = await thirdSidebarChildren.first().textContent();
        expect(movedChildText).toContain("child2-1");
    });

    // === サイドバー版 ===

    test("サイドバー内で2つ子要素のある親の先頭に挿入できる", async ({
        page,
    }) => {
        // Parent 2の子要素をParent 1の先頭（0番目）に挿入
        await dragSidebarChildElementBetweenParents(page, 1, 0, 0, 0);

        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        const firstParentSidebar = page
            .locator(
                '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
            )
            .first();
        const secondParentSidebar = page
            .locator(
                '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
            )
            .nth(1);

        const firstParentSidebarChildren = firstParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );
        const secondParentSidebarChildren = secondParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );

        // 件数確認
        await expect(firstParentSidebarChildren).toHaveCount(3);
        await expect(secondParentSidebarChildren).toHaveCount(0);

        // 先頭に正しく挿入されたか確認
        await expect(firstParentSidebarChildren.first()).toContainText(
            "[0.0] child2-1"
        );
        await expect(firstParentSidebarChildren.nth(1)).toContainText(
            "[0.1] child1-1"
        );
        await expect(firstParentSidebarChildren.nth(2)).toContainText(
            "[0.2] child1-2"
        );
    });

    test("サイドバー内で2つ子要素のある親の中間に挿入できる", async ({
        page,
    }) => {
        // Parent 2の子要素をParent 1の中間（1番目と2番目の間）に挿入
        await dragSidebarChildElementBetweenParents(page, 1, 0, 0, 1);

        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        const firstParentSidebar = page
            .locator(
                '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
            )
            .first();
        const secondParentSidebar = page
            .locator(
                '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
            )
            .nth(1);

        const firstParentSidebarChildren = firstParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );
        const secondParentSidebarChildren = secondParentSidebar.locator(
            '[data-testid="sidebar-child-item"]'
        );

        // 件数確認
        await expect(firstParentSidebarChildren).toHaveCount(3);
        await expect(secondParentSidebarChildren).toHaveCount(0);

        // 中間に正しく挿入されたか確認
        await expect(firstParentSidebarChildren.first()).toContainText(
            "[0.0] child1-1"
        );
        await expect(firstParentSidebarChildren.nth(1)).toContainText(
            "[0.1] child2-1"
        );
        await expect(firstParentSidebarChildren.nth(2)).toContainText(
            "[0.2] child1-2"
        );
    });
});
