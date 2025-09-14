import { test, expect } from "@playwright/test";
import {
    dragParentElement,
    dragSidebarParentElement,
} from "./utils/drag-drop-helpers";

test.describe("ソート可能フォーム - 親要素", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("初期フォーム構造が正しく表示される", async ({ page }) => {
        // 親要素が存在することを確認
        const parentItems = page.locator('[data-testid="parent-item"]');
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

        // 最初の親要素（index 0）を2番目の位置（index 1）にドラッグ&ドロップ
        await dragParentElement(page, 0, 1);

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
        const sidebarItems = page.locator(
            '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
        );
        await expect(sidebarItems.first().locator("strong")).toContainText(
            "[0] parent1"
        );
        await expect(sidebarItems.nth(1).locator("strong")).toContainText(
            "[1] parent2"
        );

        // サイドバー内で最初の親要素（index 0）を2番目の位置（index 1）にドラッグ&ドロップ
        await dragSidebarParentElement(page, 0, 1);

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
        // 初期数（フォームとサイドバー）
        let parentItems = page.locator('[data-testid="parent-item"]');
        let sidebarParentItems = page.locator(
            '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
        );
        await expect(parentItems).toHaveCount(2);
        await expect(sidebarParentItems).toHaveCount(2);

        // 親要素を追加
        await page.click('button:text("Add Parent")');

        // 新しい数を確認（条件ベース待機）
        parentItems = page.locator('[data-testid="parent-item"]');
        sidebarParentItems = page.locator(
            '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
        );
        await expect(parentItems).toHaveCount(3, { timeout: 10000 });
        await expect(sidebarParentItems).toHaveCount(3, { timeout: 10000 });

        // 親要素を削除
        await page
            .locator('[data-testid="parent-item"]')
            .first()
            .locator('button:text("Remove")')
            .click();

        // 削除後の数を確認（条件ベース待機）
        parentItems = page.locator('[data-testid="parent-item"]');
        sidebarParentItems = page.locator(
            '[data-testid="sidebar"] [data-testid="sidebar-parent-item"]'
        );
        await expect(parentItems).toHaveCount(2, { timeout: 10000 });
        await expect(sidebarParentItems).toHaveCount(2, { timeout: 10000 });
    });
});
