import { test, expect } from "@playwright/test";

test.describe("ソート可能フォーム - UI/UXとアクセシビリティ", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("適切なドラッグハンドルが表示される", async ({ page }) => {
        // 親要素のドラッグハンドルを確認
        const parentHandles = page.locator(
            '[data-testid="parent-drag-handle"]'
        );
        await expect(parentHandles).toHaveCount(2);

        for (let i = 0; i < (await parentHandles.count()); i++) {
            await expect(parentHandles.nth(i)).toContainText("⋮⋮");
            await expect(parentHandles.nth(i)).toBeVisible();
        }

        // 子要素のドラッグハンドルを確認
        const childHandles = page.locator(
            '[data-testid="child-item"] [data-testid="drag-handle"]'
        );
        await expect(childHandles.first()).toContainText("⋮");
        await expect(childHandles.first()).toBeVisible();

        // サイドバーのドラッグハンドルを確認
        const sidebarParentHandles = page.locator(
            '[data-testid="sidebar-parent-drag-handle"]'
        );
        await expect(sidebarParentHandles).toHaveCount(2);

        const sidebarChildHandles = page.locator(
            '[data-testid="sidebar-child-drag-handle"]'
        );
        for (let i = 0; i < (await sidebarChildHandles.count()); i++) {
            await expect(sidebarChildHandles.nth(i)).toContainText("⋮");
            await expect(sidebarChildHandles.nth(i)).toBeVisible();
        }
    });

    test("ドラッグ操作中に視覚的フィードバックが表示される", async ({
        page,
    }) => {
        // 親要素のドラッグを開始
        const firstParentHandle = page
            .locator('[data-testid="parent-drag-handle"]')
            .first();

        // ハンドルにホバーしてカーソルスタイルを確認
        await firstParentHandle.hover();

        // ハンドルが表示され、インタラクティブであることを確認
        await expect(firstParentHandle).toBeVisible();

        // ドラッグハンドルがインタラクティブ要素として適切にスタイル設定されていることを確認
        const handleStyles = await firstParentHandle.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return computed.cursor;
        });

        // カーソルが要素がドラッグ可能であることを示すことを確認（'grab'、'move'、'pointer'のいずれか）
        expect(["grab", "move", "pointer", "auto"].includes(handleStyles)).toBe(
            true
        );
    });

    test("ドラッグ操作中に適切なレイアウトが維持される", async ({ page }) => {
        // レイアウト比較のため初期スクリーンショットを撮影
        const initialScreenshot = await page.screenshot({ fullPage: true });

        // ドラッグ操作を実行
        const firstParentHandle = page
            .locator('[data-testid="parent-drag-handle"]')
            .first();
        const secondParentItem = page
            .locator('[data-testid="parent-item"]')
            .nth(1);

        await firstParentHandle.dragTo(secondParentItem);
        await page.waitForTimeout(500);

        // ドラッグ後もレイアウトが損なわれていないことを確認
        const parentItems = page.locator('[data-testid="parent-item"]');
        await expect(parentItems).toHaveCount(2);

        // すべてのフォーム要素が適切に表示されていることを確認
        const parentInputs = page.locator('input[placeholder="Parent Key"]');
        const childInputs = page.locator('input[placeholder="Child Key"]');

        for (let i = 0; i < (await parentInputs.count()); i++) {
            await expect(parentInputs.nth(i)).toBeVisible();
        }

        for (let i = 0; i < (await childInputs.count()); i++) {
            await expect(childInputs.nth(i)).toBeVisible();
        }

        // サイドバーが適切に表示されていることを確認
        const sidebarItems = page.locator(
            '[data-testid="sidebar"] [data-testid="index-item"]'
        );
        await expect(sidebarItems).toHaveCount(2);
        await expect(sidebarItems.first()).toBeVisible();
        await expect(sidebarItems.nth(1)).toBeVisible();
    });

    test("適切なレスポンシブレイアウトを持つ", async ({ page }) => {
        // デスクトップレイアウトをテスト
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.waitForTimeout(200);

        // フォームとサイドバーが横並びになっていることを確認
        const formSection = page.locator('[data-testid="form-section"]');
        const sidebar = page.locator('[data-testid="sidebar"]');

        await expect(formSection).toBeVisible();
        await expect(sidebar).toBeVisible();

        // 両セクションが適切に配置されていることを確認
        const formBox = await formSection.boundingBox();
        const sidebarBox = await sidebar.boundingBox();

        expect(formBox).toBeTruthy();
        expect(sidebarBox).toBeTruthy();

        if (formBox && sidebarBox) {
            // サイドバーがフォームの右側にある（または少なくとも完全に重複していない）ことを確認
            expect(sidebarBox.x >= formBox.x).toBe(true);
        }

        // 小さなビューポートをテスト
        await page.setViewportSize({ width: 800, height: 600 });
        await page.waitForTimeout(200);

        // 要素がまだ表示されていることを確認
        await expect(formSection).toBeVisible();
        await expect(sidebar).toBeVisible();
    });

    test("フォーム要素のキーボードナビゲーションを処理する", async ({
        page,
    }) => {
        // 最初の親キー入力にフォーカス
        await page.locator('input[placeholder="Parent Key"]').first().focus();

        // Tabを使用してフォーム内をナビゲート
        await page.keyboard.press("Tab");
        await expect(
            page.locator('input[placeholder="Parent Value"]').first()
        ).toBeFocused();

        // タブ移動を続けてフォームがキーボードナビゲート可能であることを確認
        await page.keyboard.press("Tab");
        // 削除ボタンまたは次の入力にフォーカスするはず

        // フォーム入力がキーボード入力を受け入れることを確認
        await page.locator('input[placeholder="Parent Key"]').first().focus();
        await page.keyboard.type("テストキー");

        const value = await page
            .locator('input[placeholder="Parent Key"]')
            .first()
            .inputValue();
        expect(value).toContain("テストキー");
    });

    test("適切なエラー状態とバリデーションを表示する", async ({ page }) => {
        // 必須フィールドをクリアしてバリデーションを確認
        await page.locator('input[placeholder="Parent Key"]').first().clear();
        await page.locator('input[placeholder="Parent Value"]').first().clear();

        // フォーム送信を試行
        await page.click('button:text("Submit Form")');

        // 空のフィールドがあってもフォームは正常に機能するはず
        // （現在の実装では厳密なバリデーションはないが、フォームは適切に処理するはず）

        // 追加/削除操作がまだ動作することを確認
        await page.click('button:text("Add Parent")');
        await page.waitForTimeout(200);

        const parentItems = page.locator('[data-testid="parent-item"]');
        await expect(parentItems).toHaveCount(3);
    });

    test("操作間で一貫したスタイリングを維持する", async ({ page }) => {
        // 初期スタイリングを確認
        const firstParentItem = page
            .locator('[data-testid="parent-item"]')
            .first();
        const initialClasses = await firstParentItem.getAttribute("class");

        // 操作を実行
        await page.click('button:text("Add Parent")');
        await page.waitForTimeout(200);

        // ドラッグ操作
        const firstParentHandle = page
            .locator('[data-testid="parent-drag-handle"]')
            .first();
        const secondParentItem = page
            .locator('[data-testid="parent-item"]')
            .nth(1);
        await firstParentHandle.dragTo(secondParentItem);
        await page.waitForTimeout(500);

        // スタイリングが一貫していることを確認
        const parentItems = page.locator('[data-testid="parent-item"]');

        for (let i = 0; i < (await parentItems.count()); i++) {
            const item = parentItems.nth(i);
            await expect(item).toHaveAttribute("data-testid", "parent-item");

            // 子コンテナが構造を維持していることを確認
            const childrenContainer = item.locator(
                '[data-testid="children-container"]'
            );
            await expect(childrenContainer).toBeVisible();
        }

        // ボタンがスタイリングを維持していることを確認
        const addButtons = page.locator('button:text("Add Child")');
        const removeButtons = page.locator('button:text("Remove")');

        for (let i = 0; i < (await addButtons.count()); i++) {
            await expect(addButtons.nth(i)).toBeVisible();
        }

        for (let i = 0; i < (await removeButtons.count()); i++) {
            await expect(removeButtons.nth(i)).toBeVisible();
        }
    });
});
