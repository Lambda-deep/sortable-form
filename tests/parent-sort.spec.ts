import { test, expect } from '@playwright/test';

test.describe('Sortable Form - Parent Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display initial form structure', async ({ page }) => {
    // Check that the page loads with initial data
    await expect(page.locator('h2')).toContainText('Sortable Form');
    
    // Check parent elements exist
    const parentItems = page.locator('.parent-item');
    await expect(parentItems).toHaveCount(2);
    
    // Check parent values
    await expect(page.locator('input[placeholder="Parent Key"]').first()).toHaveValue('parent1');
    await expect(page.locator('input[placeholder="Parent Key"]').nth(1)).toHaveValue('parent2');
  });

  test('should sort parent elements via drag and drop in form', async ({ page }) => {
    // Get initial order
    const firstParentKey = await page.locator('input[placeholder="Parent Key"]').first().inputValue();
    const secondParentKey = await page.locator('input[placeholder="Parent Key"]').nth(1).inputValue();
    
    expect(firstParentKey).toBe('parent1');
    expect(secondParentKey).toBe('parent2');
    
    // Perform drag and drop from first parent to second position
    const firstParentHandle = page.locator('.parent-drag-handle').first();
    const secondParentItem = page.locator('.parent-item').nth(1);
    
    await firstParentHandle.dragTo(secondParentItem);
    
    // Wait for the operation to complete
    await page.waitForTimeout(500);
    
    // Check new order
    const newFirstParentKey = await page.locator('input[placeholder="Parent Key"]').first().inputValue();
    const newSecondParentKey = await page.locator('input[placeholder="Parent Key"]').nth(1).inputValue();
    
    expect(newFirstParentKey).toBe('parent2');
    expect(newSecondParentKey).toBe('parent1');
  });

  test('should sort parent elements via drag and drop in sidebar', async ({ page }) => {
    // Check initial sidebar order
    const sidebarItems = page.locator('.sidebar .index-item');
    await expect(sidebarItems.first().locator('strong')).toContainText('[0] parent1');
    await expect(sidebarItems.nth(1).locator('strong')).toContainText('[1] parent2');
    
    // Perform drag and drop in sidebar
    const firstSidebarHandle = page.locator('.sidebar-parent-drag-handle').first();
    const secondSidebarItem = page.locator('.sidebar .index-item').nth(1);
    
    await firstSidebarHandle.dragTo(secondSidebarItem);
    
    // Wait for the operation to complete
    await page.waitForTimeout(500);
    
    // Check new sidebar order
    await expect(sidebarItems.first().locator('strong')).toContainText('[0] parent2');
    await expect(sidebarItems.nth(1).locator('strong')).toContainText('[1] parent1');
    
    // Verify form also updated
    const newFirstParentKey = await page.locator('input[placeholder="Parent Key"]').first().inputValue();
    const newSecondParentKey = await page.locator('input[placeholder="Parent Key"]').nth(1).inputValue();
    
    expect(newFirstParentKey).toBe('parent2');
    expect(newSecondParentKey).toBe('parent1');
  });

  test('should add and remove parent elements', async ({ page }) => {
    // Initial count
    let parentItems = page.locator('.parent-item');
    await expect(parentItems).toHaveCount(2);
    
    // Add parent
    await page.click('button:text("Add Parent")');
    await page.waitForTimeout(200);
    
    // Check new count
    parentItems = page.locator('.parent-item');
    await expect(parentItems).toHaveCount(3);
    
    // Remove a parent
    await page.locator('.parent-item').first().locator('button:text("Remove")').click();
    await page.waitForTimeout(200);
    
    // Check count after removal
    parentItems = page.locator('.parent-item');
    await expect(parentItems).toHaveCount(2);
  });
});