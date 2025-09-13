import { test, expect } from "@playwright/test";

test.describe("ソート可能フォーム - 親要素", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("初期フォーム構造が正しく表示される", async ({ page }) => {
        // ページが初期データと共に読み込まれることを確認
        await expect(page.locator("h2")).toContainText("Sortable Form");

        // 親要素が存在することを確認
        const parentItems = page.locator(".parent-item");
        await expect(parentItems).toHaveCount(2);

        // 親要素の値を確認
        await expect(
            page.locator('input[placeholder="Parent Key"]').first()
        ).toHaveValue("parent1");
        await expect(
            page.locator('input[placeholder="Parent Key"]').nth(1)
        ).toHaveValue("parent2");
    });

    test("フォーム内でドラッグ&ドロップによる親要素の並び替えができる", async ({
        page,
    }) => {
        // 初期順序を取得
        const firstParentKey = await page
            .locator('input[placeholder="Parent Key"]')
            .first()
            .inputValue();
        const secondParentKey = await page
            .locator('input[placeholder="Parent Key"]')
            .nth(1)
            .inputValue();

        expect(firstParentKey).toBe("parent1");
        expect(secondParentKey).toBe("parent2");

        // 最初の親要素を2番目の位置にドラッグ&ドロップ
        const firstParentHandle = page.locator(".parent-drag-handle").first();
        const secondParentItem = page.locator(".parent-item").nth(1);

        await firstParentHandle.dragTo(secondParentItem);

        // 新しい順序を確認（条件ベース待機）
        await expect(
            page.locator('input[placeholder="Parent Key"]').first()
        ).toHaveValue("parent2", { timeout: 10000 });
        await expect(
            page.locator('input[placeholder="Parent Key"]').nth(1)
        ).toHaveValue("parent1", { timeout: 10000 });
    });

    test("サイドバー内でドラッグ&ドロップによる親要素の並び替えができる", async ({
        page,
    }) => {
        // 初期サイドバー順序を確認
        const sidebarItems = page.locator(".sidebar .index-item");
        await expect(sidebarItems.first().locator("strong")).toContainText(
            "[0] parent1"
        );
        await expect(sidebarItems.nth(1).locator("strong")).toContainText(
            "[1] parent2"
        );

        // サイドバー内でドラッグ&ドロップを実行
        const firstSidebarHandle = page
            .locator(".sidebar-parent-drag-handle")
            .first();
        const secondSidebarItem = page.locator(".sidebar .index-item").nth(1);

        await firstSidebarHandle.dragTo(secondSidebarItem);

        // 新しいサイドバー順序を確認（条件ベース待機）
        await expect(sidebarItems.first().locator("strong")).toContainText(
            "[0] parent2",
            { timeout: 10000 }
        );
        await expect(sidebarItems.nth(1).locator("strong")).toContainText(
            "[1] parent1",
            { timeout: 10000 }
        );

        // フォームも更新されていることを確認
        const newFirstParentKey = await page
            .locator('input[placeholder="Parent Key"]')
            .first()
            .inputValue();
        const newSecondParentKey = await page
            .locator('input[placeholder="Parent Key"]')
            .nth(1)
            .inputValue();

        expect(newFirstParentKey).toBe("parent2");
        expect(newSecondParentKey).toBe("parent1");
    });

    test("親要素の追加と削除ができる", async ({ page }) => {
        // 初期数
        let parentItems = page.locator(".parent-item");
        await expect(parentItems).toHaveCount(2);

        // 親要素を追加
        await page.click('button:text("Add Parent")');

        // 新しい数を確認（条件ベース待機）
        parentItems = page.locator(".parent-item");
        await expect(parentItems).toHaveCount(3, { timeout: 10000 });

        // 親要素を削除
        await page
            .locator(".parent-item")
            .first()
            .locator('button:text("Remove")')
            .click();

        // 削除後の数を確認（条件ベース待機）
        parentItems = page.locator(".parent-item");
        await expect(parentItems).toHaveCount(2, { timeout: 10000 });
    });
});
