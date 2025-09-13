import { test, expect } from "@playwright/test";

test.describe("ソート可能フォーム - 子要素", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("初期子要素構造が正しく表示される", async ({ page }) => {
        // 最初の親要素内の初期子要素を確認
        const firstParentChildren = page
            .locator(".parent-item")
            .first()
            .locator(".child-item");
        await expect(firstParentChildren).toHaveCount(2);

        // 子要素の値を確認
        await expect(
            firstParentChildren
                .first()
                .locator('input[placeholder="Child Key"]')
        ).toHaveValue("child1-1");
        await expect(
            firstParentChildren.nth(1).locator('input[placeholder="Child Key"]')
        ).toHaveValue("child1-2");

        // 2番目の親要素に1つの子要素があることを確認
        const secondParentChildren = page
            .locator(".parent-item")
            .nth(1)
            .locator(".child-item");
        await expect(secondParentChildren).toHaveCount(1);
        await expect(
            secondParentChildren
                .first()
                .locator('input[placeholder="Child Key"]')
        ).toHaveValue("child2-1");
    });

    test("フォーム内で同じ親内での子要素並び替えができる", async ({ page }) => {
        // 最初の親要素内の子要素の初期順序を取得
        const firstParent = page.locator(".parent-item").first();
        const children = firstParent.locator(".child-item");

        const firstChildKey = await children
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        const secondChildKey = await children
            .nth(1)
            .locator('input[placeholder="Child Key"]')
            .inputValue();

        expect(firstChildKey).toBe("child1-1");
        expect(secondChildKey).toBe("child1-2");

        // 最初の子要素を2番目の位置にドラッグ
        const firstChildHandle = children.first().locator(".drag-handle");
        const secondChild = children.nth(1);

        await firstChildHandle.dragTo(secondChild);
        await page.waitForTimeout(500);

        // 新しい順序を確認
        const newFirstChildKey = await children
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        const newSecondChildKey = await children
            .nth(1)
            .locator('input[placeholder="Child Key"]')
            .inputValue();

        expect(newFirstChildKey).toBe("child1-2");
        expect(newSecondChildKey).toBe("child1-1");
    });

    test("サイドバー内で同じ親内での子要素並び替えができる", async ({
        page,
    }) => {
        // 初期サイドバー子要素順序を確認
        const firstParentSidebar = page.locator(".sidebar .index-item").first();
        const sidebarChildren = firstParentSidebar.locator(
            ".sidebar-child-item"
        );

        await expect(sidebarChildren.first()).toContainText("[0.0] child1-1");
        await expect(sidebarChildren.nth(1)).toContainText("[0.1] child1-2");

        // サイドバー内で最初の子要素を2番目の位置にドラッグ
        const firstChildSidebarHandle = sidebarChildren
            .first()
            .locator(".sidebar-child-drag-handle");
        const secondChildSidebar = sidebarChildren.nth(1);

        await firstChildSidebarHandle.dragTo(secondChildSidebar);

        // 新しいサイドバー順序を確認（条件ベース待機）
        await expect(sidebarChildren.first()).toContainText("[0.0] child1-2", {
            timeout: 10000,
        });
        await expect(sidebarChildren.nth(1)).toContainText("[0.1] child1-1", {
            timeout: 10000,
        });

        // フォームも更新されていることを確認
        const firstParent = page.locator(".parent-item").first();
        const children = firstParent.locator(".child-item");

        const newFirstChildKey = await children
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        const newSecondChildKey = await children
            .nth(1)
            .locator('input[placeholder="Child Key"]')
            .inputValue();

        expect(newFirstChildKey).toBe("child1-2");
        expect(newSecondChildKey).toBe("child1-1");
    });

    test("フォーム内で異なる親間での子要素移動ができる", async ({ page }) => {
        // 初期状態: parent1に2つの子要素、parent2に1つの子要素
        const firstParent = page.locator(".parent-item").first();
        const secondParent = page.locator(".parent-item").nth(1);

        let firstParentChildren = firstParent.locator(".child-item");
        let secondParentChildren = secondParent.locator(".child-item");

        await expect(firstParentChildren).toHaveCount(2);
        await expect(secondParentChildren).toHaveCount(1);

        // 最初の親の最初の子要素を2番目の親に移動
        const childToMove = firstParentChildren.first();
        const childKey = await childToMove
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(childKey).toBe("child1-1");

        const childHandle = childToMove.locator(".drag-handle");
        const secondParentContainer = secondParent.locator(
            ".children-container > div[data-parent-index]"
        );

        await childHandle.dragTo(secondParentContainer);
        await page.waitForTimeout(500);

        // 新しい数と順序を確認
        firstParentChildren = firstParent.locator(".child-item");
        secondParentChildren = secondParent.locator(".child-item");

        await expect(firstParentChildren).toHaveCount(1);
        await expect(secondParentChildren).toHaveCount(2);

        // 移動した子要素が2番目の親にあることを確認
        const movedChildKey = await secondParentChildren
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(movedChildKey).toBe("child1-1");
    });

    test("サイドバー内で異なる親間での子要素移動ができる", async ({ page }) => {
        // 初期サイドバー状態を確認
        const firstParentSidebar = page.locator(".sidebar .index-item").first();
        const secondParentSidebar = page.locator(".sidebar .index-item").nth(1);

        let firstParentSidebarChildren = firstParentSidebar.locator(
            ".sidebar-child-item"
        );
        let secondParentSidebarChildren = secondParentSidebar.locator(
            ".sidebar-child-item"
        );

        await expect(firstParentSidebarChildren).toHaveCount(2);
        await expect(secondParentSidebarChildren).toHaveCount(1);

        // サイドバードラッグで子要素を移動
        const childToMoveSidebar = firstParentSidebarChildren.first();
        await expect(childToMoveSidebar).toContainText("[0.0] child1-1");

        const childSidebarHandle = childToMoveSidebar.locator(
            ".sidebar-child-drag-handle"
        );
        const secondParentSidebarContainer =
            secondParentSidebar.locator(".nested-index");

        await childSidebarHandle.dragTo(secondParentSidebarContainer);

        // 新しいサイドバー状態を確認（条件ベース待機）
        firstParentSidebarChildren = firstParentSidebar.locator(
            ".sidebar-child-item"
        );
        secondParentSidebarChildren = secondParentSidebar.locator(
            ".sidebar-child-item"
        );

        await expect(firstParentSidebarChildren).toHaveCount(1, {
            timeout: 10000,
        });
        await expect(secondParentSidebarChildren).toHaveCount(2, {
            timeout: 10000,
        });

        // 移動した子要素が正しいインデックスで2番目の親にあることを確認
        await expect(secondParentSidebarChildren.first()).toContainText(
            "[1.0] child1-1",
            { timeout: 10000 }
        );

        // フォームも更新されていることを確認
        const firstParent = page.locator(".parent-item").first();
        const secondParent = page.locator(".parent-item").nth(1);

        const firstParentChildren = firstParent.locator(".child-item");
        const secondParentChildren = secondParent.locator(".child-item");

        await expect(firstParentChildren).toHaveCount(1);
        await expect(secondParentChildren).toHaveCount(2);

        const movedChildKey = await secondParentChildren
            .first()
            .locator('input[placeholder="Child Key"]')
            .inputValue();
        expect(movedChildKey).toBe("child1-1");
    });

    test("子要素の追加と削除ができる", async ({ page }) => {
        const firstParent = page.locator(".parent-item").first();

        // 初期数
        let children = firstParent.locator(".child-item");
        await expect(children).toHaveCount(2);

        // 子要素を追加
        await firstParent.locator('button:text("Add Child")').click();
        await page.waitForTimeout(200);

        // 新しい数を確認
        children = firstParent.locator(".child-item");
        await expect(children).toHaveCount(3);

        // 子要素を削除
        await children.first().locator('button:text("×")').click();
        await page.waitForTimeout(200);

        // 削除後の数を確認
        children = firstParent.locator(".child-item");
        await expect(children).toHaveCount(2);
    });
});
