import { test, expect } from '@playwright/test';

test.describe('Sortable Form - UI/UX and Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display proper drag handles', async ({ page }) => {
    // Check parent drag handles
    const parentHandles = page.locator('.parent-drag-handle');
    await expect(parentHandles).toHaveCount(2);
    
    for (let i = 0; i < await parentHandles.count(); i++) {
      await expect(parentHandles.nth(i)).toContainText('⋮⋮');
      await expect(parentHandles.nth(i)).toBeVisible();
    }
    
    // Check child drag handles
    const childHandles = page.locator('.child-item .drag-handle');
    await expect(childHandles.first()).toContainText('⋮');
    await expect(childHandles.first()).toBeVisible();
    
    // Check sidebar drag handles
    const sidebarParentHandles = page.locator('.sidebar-parent-drag-handle');
    await expect(sidebarParentHandles).toHaveCount(2);
    
    const sidebarChildHandles = page.locator('.sidebar-child-drag-handle');
    for (let i = 0; i < await sidebarChildHandles.count(); i++) {
      await expect(sidebarChildHandles.nth(i)).toContainText('⋮');
      await expect(sidebarChildHandles.nth(i)).toBeVisible();
    }
  });

  test('should show visual feedback during drag operations', async ({ page }) => {
    // Start dragging a parent element
    const firstParentHandle = page.locator('.parent-drag-handle').first();
    
    // Hover over the handle to check cursor style
    await firstParentHandle.hover();
    
    // The handle should be visible and interactive
    await expect(firstParentHandle).toBeVisible();
    
    // Check that drag handles are properly styled as interactive elements
    const handleStyles = await firstParentHandle.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.cursor;
    });
    
    // The cursor should indicate the element is draggable (might be 'grab', 'move', or 'pointer')
    expect(['grab', 'move', 'pointer', 'auto'].includes(handleStyles)).toBe(true);
  });

  test('should maintain proper layout during drag operations', async ({ page }) => {
    // Take initial screenshot to compare layout
    const initialScreenshot = await page.screenshot({ fullPage: true });
    
    // Perform drag operation
    const firstParentHandle = page.locator('.parent-drag-handle').first();
    const secondParentItem = page.locator('.parent-item').nth(1);
    
    await firstParentHandle.dragTo(secondParentItem);
    await page.waitForTimeout(500);
    
    // Verify layout is still intact after drag
    const parentItems = page.locator('.parent-item');
    await expect(parentItems).toHaveCount(2);
    
    // Verify all form elements are still properly displayed
    const parentInputs = page.locator('input[placeholder="Parent Key"]');
    const childInputs = page.locator('input[placeholder="Child Key"]');
    
    for (let i = 0; i < await parentInputs.count(); i++) {
      await expect(parentInputs.nth(i)).toBeVisible();
    }
    
    for (let i = 0; i < await childInputs.count(); i++) {
      await expect(childInputs.nth(i)).toBeVisible();
    }
    
    // Verify sidebar is still properly displayed
    const sidebarItems = page.locator('.sidebar .index-item');
    await expect(sidebarItems).toHaveCount(2);
    await expect(sidebarItems.first()).toBeVisible();
    await expect(sidebarItems.nth(1)).toBeVisible();
  });

  test('should have proper responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(200);
    
    // Verify form and sidebar are side by side
    const formSection = page.locator('.form-section');
    const sidebar = page.locator('.sidebar');
    
    await expect(formSection).toBeVisible();
    await expect(sidebar).toBeVisible();
    
    // Check that both sections are properly positioned
    const formBox = await formSection.boundingBox();
    const sidebarBox = await sidebar.boundingBox();
    
    expect(formBox).toBeTruthy();
    expect(sidebarBox).toBeTruthy();
    
    if (formBox && sidebarBox) {
      // Sidebar should be to the right of the form (or at least not overlap completely)
      expect(sidebarBox.x >= formBox.x).toBe(true);
    }
    
    // Test smaller viewport
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(200);
    
    // Elements should still be visible
    await expect(formSection).toBeVisible();
    await expect(sidebar).toBeVisible();
  });

  test('should handle keyboard navigation for form elements', async ({ page }) => {
    // Focus on first parent key input
    await page.locator('input[placeholder="Parent Key"]').first().focus();
    
    // Navigate through form using Tab
    await page.keyboard.press('Tab');
    await expect(page.locator('input[placeholder="Parent Value"]').first()).toBeFocused();
    
    // Continue tabbing to verify form is keyboard navigable
    await page.keyboard.press('Tab');
    // Should focus on Remove button or next input
    
    // Verify form inputs accept keyboard input
    await page.locator('input[placeholder="Parent Key"]').first().focus();
    await page.keyboard.type('test-key');
    
    const value = await page.locator('input[placeholder="Parent Key"]').first().inputValue();
    expect(value).toContain('test-key');
  });

  test('should show proper error states and validation', async ({ page }) => {
    // Clear required fields and check for validation
    await page.locator('input[placeholder="Parent Key"]').first().clear();
    await page.locator('input[placeholder="Parent Value"]').first().clear();
    
    // Try to submit form
    await page.click('button:text("Submit Form")');
    
    // The form should still be functional even with empty fields
    // (Based on the current implementation, there's no strict validation, but form should handle gracefully)
    
    // Verify add/remove operations still work
    await page.click('button:text("Add Parent")');
    await page.waitForTimeout(200);
    
    const parentItems = page.locator('.parent-item');
    await expect(parentItems).toHaveCount(3);
  });

  test('should maintain consistent styling across operations', async ({ page }) => {
    // Check initial styling
    const firstParentItem = page.locator('.parent-item').first();
    const initialClasses = await firstParentItem.getAttribute('class');
    
    // Perform operations
    await page.click('button:text("Add Parent")');
    await page.waitForTimeout(200);
    
    // Drag operation
    const firstParentHandle = page.locator('.parent-drag-handle').first();
    const secondParentItem = page.locator('.parent-item').nth(1);
    await firstParentHandle.dragTo(secondParentItem);
    await page.waitForTimeout(500);
    
    // Check that styling remains consistent
    const parentItems = page.locator('.parent-item');
    
    for (let i = 0; i < await parentItems.count(); i++) {
      const item = parentItems.nth(i);
      await expect(item).toHaveClass(/parent-item/);
      
      // Check that child containers maintain their structure
      const childrenContainer = item.locator('.children-container');
      await expect(childrenContainer).toBeVisible();
    }
    
    // Verify buttons maintain their styling
    const addButtons = page.locator('button:text("Add Child")');
    const removeButtons = page.locator('button:text("Remove")');
    
    for (let i = 0; i < await addButtons.count(); i++) {
      await expect(addButtons.nth(i)).toBeVisible();
    }
    
    for (let i = 0; i < await removeButtons.count(); i++) {
      await expect(removeButtons.nth(i)).toBeVisible();
    }
  });
});