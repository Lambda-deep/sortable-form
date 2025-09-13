import { test, expect } from '@playwright/test';

test.describe('Sortable Form - Form Submission and Data Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should maintain data integrity after multiple operations', async ({ page }) => {
    // Perform a series of operations and verify data consistency
    
    // 1. Add a new parent
    await page.click('button:text("Add Parent")');
    await page.waitForTimeout(200);
    
    // 2. Add children to the new parent
    const thirdParent = page.locator('.parent-item').nth(2);
    await thirdParent.locator('button:text("Add Child")').click();
    await page.waitForTimeout(200);
    await thirdParent.locator('button:text("Add Child")').click();
    await page.waitForTimeout(200);
    
    // 3. Modify some input values
    await thirdParent.locator('input[placeholder="Parent Key"]').fill('parent3');
    await thirdParent.locator('input[placeholder="Parent Value"]').fill('Parent 3');
    
    const thirdParentChildren = thirdParent.locator('.child-item');
    await thirdParentChildren.first().locator('input[placeholder="Child Key"]').fill('child3-1');
    await thirdParentChildren.first().locator('input[placeholder="Child Value"]').fill('Child 3-1');
    await thirdParentChildren.nth(1).locator('input[placeholder="Child Key"]').fill('child3-2');
    await thirdParentChildren.nth(1).locator('input[placeholder="Child Value"]').fill('Child 3-2');
    
    await page.waitForTimeout(300);
    
    // 4. Verify sidebar updates in real-time
    const sidebarItems = page.locator('.sidebar .index-item');
    await expect(sidebarItems).toHaveCount(3);
    await expect(sidebarItems.nth(2).locator('strong')).toContainText('[2] parent3');
    
    const thirdParentSidebarChildren = sidebarItems.nth(2).locator('.sidebar-child-item');
    await expect(thirdParentSidebarChildren).toHaveCount(2);
    await expect(thirdParentSidebarChildren.first()).toContainText('[2.0] child3-1');
    await expect(thirdParentSidebarChildren.nth(1)).toContainText('[2.1] child3-2');
    
    // 5. Move child between parents
    const firstParent = page.locator('.parent-item').first();
    const firstParentChildren = firstParent.locator('.child-item');
    const childToMove = firstParentChildren.first();
    const childHandle = childToMove.locator('.drag-handle');
    const thirdParentContainer = thirdParent.locator('.children-container > div[data-parent-index]');
    
    await childHandle.dragTo(thirdParentContainer);
    await page.waitForTimeout(500);
    
    // 6. Verify final state
    await expect(firstParent.locator('.child-item')).toHaveCount(1);
    await expect(thirdParent.locator('.child-item')).toHaveCount(3);
    
    // Verify sidebar reflects the changes
    const updatedThirdParentSidebarChildren = sidebarItems.nth(2).locator('.sidebar-child-item');
    await expect(updatedThirdParentSidebarChildren).toHaveCount(3);
  });

  test('should submit form with current data', async ({ page }) => {
    // Listen for console messages (form submission logs to console)
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleMessages.push(msg.text());
      }
    });

    // Listen for alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Form submitted!');
      await dialog.accept();
    });

    // Modify some data before submission
    await page.locator('input[placeholder="Parent Value"]').first().fill('Modified Parent 1');
    await page.locator('.child-item').first().locator('input[placeholder="Child Value"]').fill('Modified Child 1-1');
    
    // Submit form
    await page.click('button:text("Submit Form")');
    
    // Wait for submission to complete
    await page.waitForTimeout(1000);
    
    // Verify console log contains form data
    expect(consoleMessages.some(msg => msg.includes('Form data:'))).toBe(true);
  });

  test('should handle rapid drag operations without losing data', async ({ page }) => {
    // Perform multiple rapid drag operations
    const firstParent = page.locator('.parent-item').first();
    const secondParent = page.locator('.parent-item').nth(1);
    
    // Rapid parent reordering
    const firstParentHandle = page.locator('.parent-drag-handle').first();
    await firstParentHandle.dragTo(secondParent);
    await page.waitForTimeout(100);
    
    const newFirstParentHandle = page.locator('.parent-drag-handle').first();
    const newSecondParent = page.locator('.parent-item').nth(1);
    await newFirstParentHandle.dragTo(newSecondParent);
    await page.waitForTimeout(100);
    
    // Verify data integrity after rapid operations
    const parentItems = page.locator('.parent-item');
    await expect(parentItems).toHaveCount(2);
    
    // Verify all inputs still have values
    const parentKeyInputs = page.locator('input[placeholder="Parent Key"]');
    const childKeyInputs = page.locator('input[placeholder="Child Key"]');
    
    for (let i = 0; i < await parentKeyInputs.count(); i++) {
      const value = await parentKeyInputs.nth(i).inputValue();
      expect(value).toBeTruthy();
    }
    
    for (let i = 0; i < await childKeyInputs.count(); i++) {
      const value = await childKeyInputs.nth(i).inputValue();
      expect(value).toBeTruthy();
    }
  });

  test('should maintain proper indexing in sidebar after complex operations', async ({ page }) => {
    // Start with known state
    let sidebarItems = page.locator('.sidebar .index-item');
    await expect(sidebarItems).toHaveCount(2);
    
    // Add a third parent
    await page.click('button:text("Add Parent")');
    await page.waitForTimeout(200);
    
    // Add child to third parent
    const thirdParent = page.locator('.parent-item').nth(2);
    await thirdParent.locator('button:text("Add Child")').click();
    await page.waitForTimeout(200);
    
    // Move parent to middle position
    const thirdParentHandle = page.locator('.parent-drag-handle').nth(2);
    const secondParentItem = page.locator('.parent-item').nth(1);
    await thirdParentHandle.dragTo(secondParentItem);
    await page.waitForTimeout(500);
    
    // Verify sidebar indexing is correct
    sidebarItems = page.locator('.sidebar .index-item');
    await expect(sidebarItems).toHaveCount(3);
    
    // Check parent indices
    await expect(sidebarItems.first().locator('strong')).toContainText('[0]');
    await expect(sidebarItems.nth(1).locator('strong')).toContainText('[1]');
    await expect(sidebarItems.nth(2).locator('strong')).toContainText('[2]');
    
    // Check child indices are also updated correctly
    const firstParentChildren = sidebarItems.first().locator('.sidebar-child-item');
    const secondParentChildren = sidebarItems.nth(1).locator('.sidebar-child-item');
    const thirdParentChildren = sidebarItems.nth(2).locator('.sidebar-child-item');
    
    // Verify child indexing follows parent indexing
    if (await firstParentChildren.count() > 0) {
      await expect(firstParentChildren.first()).toContainText('[0.0]');
    }
    if (await secondParentChildren.count() > 0) {
      await expect(secondParentChildren.first()).toContainText('[1.0]');
    }
    if (await thirdParentChildren.count() > 0) {
      await expect(thirdParentChildren.first()).toContainText('[2.0]');
    }
  });
});