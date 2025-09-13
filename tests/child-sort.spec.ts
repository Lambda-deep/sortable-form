import { test, expect } from '@playwright/test';

test.describe('Sortable Form - Child Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display initial child structure', async ({ page }) => {
    // Check initial child elements in first parent
    const firstParentChildren = page.locator('.parent-item').first().locator('.child-item');
    await expect(firstParentChildren).toHaveCount(2);
    
    // Check child values
    await expect(firstParentChildren.first().locator('input[placeholder="Child Key"]')).toHaveValue('child1-1');
    await expect(firstParentChildren.nth(1).locator('input[placeholder="Child Key"]')).toHaveValue('child1-2');
    
    // Check second parent has one child
    const secondParentChildren = page.locator('.parent-item').nth(1).locator('.child-item');
    await expect(secondParentChildren).toHaveCount(1);
    await expect(secondParentChildren.first().locator('input[placeholder="Child Key"]')).toHaveValue('child2-1');
  });

  test('should sort children within same parent in form', async ({ page }) => {
    // Get initial order of children in first parent
    const firstParent = page.locator('.parent-item').first();
    const children = firstParent.locator('.child-item');
    
    const firstChildKey = await children.first().locator('input[placeholder="Child Key"]').inputValue();
    const secondChildKey = await children.nth(1).locator('input[placeholder="Child Key"]').inputValue();
    
    expect(firstChildKey).toBe('child1-1');
    expect(secondChildKey).toBe('child1-2');
    
    // Drag first child to second position
    const firstChildHandle = children.first().locator('.drag-handle');
    const secondChild = children.nth(1);
    
    await firstChildHandle.dragTo(secondChild);
    await page.waitForTimeout(500);
    
    // Check new order
    const newFirstChildKey = await children.first().locator('input[placeholder="Child Key"]').inputValue();
    const newSecondChildKey = await children.nth(1).locator('input[placeholder="Child Key"]').inputValue();
    
    expect(newFirstChildKey).toBe('child1-2');
    expect(newSecondChildKey).toBe('child1-1');
  });

  test('should sort children within same parent in sidebar', async ({ page }) => {
    // Check initial sidebar child order
    const firstParentSidebar = page.locator('.sidebar .index-item').first();
    const sidebarChildren = firstParentSidebar.locator('.sidebar-child-item');
    
    await expect(sidebarChildren.first()).toContainText('[0.0] child1-1');
    await expect(sidebarChildren.nth(1)).toContainText('[0.1] child1-2');
    
    // Drag first child to second position in sidebar
    const firstChildSidebarHandle = sidebarChildren.first().locator('.sidebar-child-drag-handle');
    const secondChildSidebar = sidebarChildren.nth(1);
    
    await firstChildSidebarHandle.dragTo(secondChildSidebar);
    await page.waitForTimeout(500);
    
    // Check new sidebar order
    await expect(sidebarChildren.first()).toContainText('[0.0] child1-2');
    await expect(sidebarChildren.nth(1)).toContainText('[0.1] child1-1');
    
    // Verify form also updated
    const firstParent = page.locator('.parent-item').first();
    const children = firstParent.locator('.child-item');
    
    const newFirstChildKey = await children.first().locator('input[placeholder="Child Key"]').inputValue();
    const newSecondChildKey = await children.nth(1).locator('input[placeholder="Child Key"]').inputValue();
    
    expect(newFirstChildKey).toBe('child1-2');
    expect(newSecondChildKey).toBe('child1-1');
  });

  test('should move child between different parents in form', async ({ page }) => {
    // Initial state: parent1 has 2 children, parent2 has 1 child
    const firstParent = page.locator('.parent-item').first();
    const secondParent = page.locator('.parent-item').nth(1);
    
    let firstParentChildren = firstParent.locator('.child-item');
    let secondParentChildren = secondParent.locator('.child-item');
    
    await expect(firstParentChildren).toHaveCount(2);
    await expect(secondParentChildren).toHaveCount(1);
    
    // Move first child from first parent to second parent
    const childToMove = firstParentChildren.first();
    const childKey = await childToMove.locator('input[placeholder="Child Key"]').inputValue();
    expect(childKey).toBe('child1-1');
    
    const childHandle = childToMove.locator('.drag-handle');
    const secondParentContainer = secondParent.locator('.children-container > div[data-parent-index]');
    
    await childHandle.dragTo(secondParentContainer);
    await page.waitForTimeout(500);
    
    // Check new counts and order
    firstParentChildren = firstParent.locator('.child-item');
    secondParentChildren = secondParent.locator('.child-item');
    
    await expect(firstParentChildren).toHaveCount(1);
    await expect(secondParentChildren).toHaveCount(2);
    
    // Verify the moved child is now in second parent
    const movedChildKey = await secondParentChildren.first().locator('input[placeholder="Child Key"]').inputValue();
    expect(movedChildKey).toBe('child1-1');
  });

  test('should move child between different parents in sidebar', async ({ page }) => {
    // Check initial sidebar state
    const firstParentSidebar = page.locator('.sidebar .index-item').first();
    const secondParentSidebar = page.locator('.sidebar .index-item').nth(1);
    
    let firstParentSidebarChildren = firstParentSidebar.locator('.sidebar-child-item');
    let secondParentSidebarChildren = secondParentSidebar.locator('.sidebar-child-item');
    
    await expect(firstParentSidebarChildren).toHaveCount(2);
    await expect(secondParentSidebarChildren).toHaveCount(1);
    
    // Move child via sidebar drag
    const childToMoveSidebar = firstParentSidebarChildren.first();
    await expect(childToMoveSidebar).toContainText('[0.0] child1-1');
    
    const childSidebarHandle = childToMoveSidebar.locator('.sidebar-child-drag-handle');
    const secondParentSidebarContainer = secondParentSidebar.locator('.nested-index');
    
    await childSidebarHandle.dragTo(secondParentSidebarContainer);
    await page.waitForTimeout(500);
    
    // Check new sidebar state
    firstParentSidebarChildren = firstParentSidebar.locator('.sidebar-child-item');
    secondParentSidebarChildren = secondParentSidebar.locator('.sidebar-child-item');
    
    await expect(firstParentSidebarChildren).toHaveCount(1);
    await expect(secondParentSidebarChildren).toHaveCount(2);
    
    // Verify the moved child is in second parent with correct index
    await expect(secondParentSidebarChildren.first()).toContainText('[1.0] child1-1');
    
    // Verify form also updated
    const firstParent = page.locator('.parent-item').first();
    const secondParent = page.locator('.parent-item').nth(1);
    
    const firstParentChildren = firstParent.locator('.child-item');
    const secondParentChildren = secondParent.locator('.child-item');
    
    await expect(firstParentChildren).toHaveCount(1);
    await expect(secondParentChildren).toHaveCount(2);
    
    const movedChildKey = await secondParentChildren.first().locator('input[placeholder="Child Key"]').inputValue();
    expect(movedChildKey).toBe('child1-1');
  });

  test('should add and remove child elements', async ({ page }) => {
    const firstParent = page.locator('.parent-item').first();
    
    // Initial count
    let children = firstParent.locator('.child-item');
    await expect(children).toHaveCount(2);
    
    // Add child
    await firstParent.locator('button:text("Add Child")').click();
    await page.waitForTimeout(200);
    
    // Check new count
    children = firstParent.locator('.child-item');
    await expect(children).toHaveCount(3);
    
    // Remove a child
    await children.first().locator('button:text("×")').click();
    await page.waitForTimeout(200);
    
    // Check count after removal
    children = firstParent.locator('.child-item');
    await expect(children).toHaveCount(2);
  });
});