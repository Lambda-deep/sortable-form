import { test, expect } from "@playwright/test";

test.describe("ソート可能フォーム - フォーム送信とデータ整合性", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("複数操作後のデータ整合性が維持される", async ({ page }) => {
        // 一連の操作を実行してデータの一貫性を確認

        // 1. 新しい親要素を追加
        await page.click('button:text("Add Parent")');
        await page.waitForTimeout(200);

        // 2. 新しい親要素に子要素を追加
        const thirdParent = page.locator('[data-testid="parent-item"]').nth(2);
        await thirdParent.locator('button:text("Add Child")').click();
        await page.waitForTimeout(200);
        await thirdParent.locator('button:text("Add Child")').click();
        await page.waitForTimeout(200);

        // 3. 入力値を変更
        await thirdParent
            .locator('input[placeholder="Parent Key"]')
            .fill("parent3");
        await thirdParent
            .locator('input[placeholder="Parent Value"]')
            .fill("Parent 3");

        const thirdParentChildren = thirdParent.locator(
            '[data-testid="child-item"]'
        );
        await thirdParentChildren
            .first()
            .locator('input[placeholder="Child Key"]')
            .fill("child3-1");
        await thirdParentChildren
            .first()
            .locator('input[placeholder="Child Value"]')
            .fill("Child 3-1");
        await thirdParentChildren
            .nth(1)
            .locator('input[placeholder="Child Key"]')
            .fill("child3-2");
        await thirdParentChildren
            .nth(1)
            .locator('input[placeholder="Child Value"]')
            .fill("Child 3-2");

        await page.waitForTimeout(300);

        // 4. サイドバーがリアルタイムで更新されることを確認
        const sidebarItems = page.locator(
            '[data-testid="sidebar"] [data-testid="index-item"]'
        );
        await expect(sidebarItems).toHaveCount(3);
        await expect(sidebarItems.nth(2).locator("strong")).toContainText(
            "[2] parent3"
        );

        const thirdParentSidebarChildren = sidebarItems
            .nth(2)
            .locator('[data-testid="sidebar-child-item"]');
        await expect(thirdParentSidebarChildren).toHaveCount(2);
        await expect(thirdParentSidebarChildren.first()).toContainText(
            "[2.0] child3-1"
        );
        await expect(thirdParentSidebarChildren.nth(1)).toContainText(
            "[2.1] child3-2"
        );

        // 5. 親要素間で子要素を移動
        const firstParent = page.locator('[data-testid="parent-item"]').first();
        const firstParentChildren = firstParent.locator(
            '[data-testid="child-item"]'
        );
        const childToMove = firstParentChildren.first();
        const childHandle = childToMove.locator('[data-testid="drag-handle"]');
        const thirdParentContainer = thirdParent.locator(
            '[data-testid="children-container"] > div[data-parent-index]'
        );

        await childHandle.dragTo(thirdParentContainer);
        await page.waitForTimeout(500);

        // 6. 最終状態を確認
        await expect(
            firstParent.locator('[data-testid="child-item"]')
        ).toHaveCount(1);
        await expect(
            thirdParent.locator('[data-testid="child-item"]')
        ).toHaveCount(3);

        // サイドバーが変更を反映していることを確認
        const updatedThirdParentSidebarChildren = sidebarItems
            .nth(2)
            .locator('[data-testid="sidebar-child-item"]');
        await expect(updatedThirdParentSidebarChildren).toHaveCount(3);
    });

    test("現在のデータでフォーム送信ができる", async ({ page }) => {
        // コンソールメッセージをリッスン（フォーム送信はコンソールにログ出力）
        const consoleMessages: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "log") {
                consoleMessages.push(msg.text());
            }
        });

        // アラートダイアログをリッスン
        page.on("dialog", async (dialog) => {
            expect(dialog.message()).toContain("Form submitted!");
            await dialog.accept();
        });

        // 送信前にデータを変更
        await page
            .locator('input[placeholder="Parent Value"]')
            .first()
            .fill("変更された親要素 1");
        await page
            .locator('[data-testid="child-item"]')
            .first()
            .locator('input[placeholder="Child Value"]')
            .fill("変更された子要素 1-1");

        // フォーム送信
        await page.click('button:text("Submit Form")');

        // 送信完了を待機
        await page.waitForTimeout(1000);

        // コンソールログにフォームデータが含まれることを確認
        expect(consoleMessages.some((msg) => msg.includes("Form data:"))).toBe(
            true
        );
    });

    test("高速ドラッグ操作でデータが失われない", async ({ page }) => {
        // 複数の高速ドラッグ操作を実行
        const firstParent = page.locator('[data-testid="parent-item"]').first();
        const secondParent = page.locator('[data-testid="parent-item"]').nth(1);

        // 高速親要素並び替え
        const firstParentHandle = page
            .locator('[data-testid="parent-drag-handle"]')
            .first();
        await firstParentHandle.dragTo(secondParent);
        await page.waitForTimeout(100);

        const newFirstParentHandle = page
            .locator('[data-testid="parent-drag-handle"]')
            .first();
        const newSecondParent = page
            .locator('[data-testid="parent-item"]')
            .nth(1);
        await newFirstParentHandle.dragTo(newSecondParent);
        await page.waitForTimeout(100);

        // 高速操作後のデータ整合性を確認
        const parentItems = page.locator('[data-testid="parent-item"]');
        await expect(parentItems).toHaveCount(2);

        // すべての入力がまだ値を持っていることを確認
        const parentKeyInputs = page.locator('input[placeholder="Parent Key"]');
        const childKeyInputs = page.locator('input[placeholder="Child Key"]');

        for (let i = 0; i < (await parentKeyInputs.count()); i++) {
            const value = await parentKeyInputs.nth(i).inputValue();
            expect(value).toBeTruthy();
        }

        for (let i = 0; i < (await childKeyInputs.count()); i++) {
            const value = await childKeyInputs.nth(i).inputValue();
            expect(value).toBeTruthy();
        }
    });

    test("複雑な操作後にサイドバーでの適切なインデックス付けが維持される", async ({
        page,
    }) => {
        // 既知の状態から開始
        let sidebarItems = page.locator(
            '[data-testid="sidebar"] [data-testid="index-item"]'
        );
        await expect(sidebarItems).toHaveCount(2);

        // 3番目の親要素を追加
        await page.click('button:text("Add Parent")');
        await page.waitForTimeout(200);

        // 3番目の親要素に子要素を追加
        const thirdParent = page.locator('[data-testid="parent-item"]').nth(2);
        await thirdParent.locator('button:text("Add Child")').click();
        await page.waitForTimeout(200);

        // 親要素を中間位置に移動
        const thirdParentHandle = page
            .locator('[data-testid="parent-drag-handle"]')
            .nth(2);
        const secondParentItem = page
            .locator('[data-testid="parent-item"]')
            .nth(1);
        await thirdParentHandle.dragTo(secondParentItem);
        await page.waitForTimeout(500);

        // サイドバーのインデックス付けが正しいことを確認
        sidebarItems = page.locator(
            '[data-testid="sidebar"] [data-testid="index-item"]'
        );
        await expect(sidebarItems).toHaveCount(3);

        // 親要素のインデックスを確認
        await expect(sidebarItems.first().locator("strong")).toContainText(
            "[0]"
        );
        await expect(sidebarItems.nth(1).locator("strong")).toContainText(
            "[1]"
        );
        await expect(sidebarItems.nth(2).locator("strong")).toContainText(
            "[2]"
        );

        // 子要素のインデックスも正しく更新されているかを確認
        const firstParentChildren = sidebarItems
            .first()
            .locator('[data-testid="sidebar-child-item"]');
        const secondParentChildren = sidebarItems
            .nth(1)
            .locator('[data-testid="sidebar-child-item"]');
        const thirdParentChildren = sidebarItems
            .nth(2)
            .locator('[data-testid="sidebar-child-item"]');

        // 子要素のインデックス付けが親要素のインデックス付けに従っていることを確認
        if ((await firstParentChildren.count()) > 0) {
            await expect(firstParentChildren.first()).toContainText("[0.0]");
        }
        if ((await secondParentChildren.count()) > 0) {
            await expect(secondParentChildren.first()).toContainText("[1.0]");
        }
        if ((await thirdParentChildren.count()) > 0) {
            await expect(thirdParentChildren.first()).toContainText("[2.0]");
        }
    });
});
