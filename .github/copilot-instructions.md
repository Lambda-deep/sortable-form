# Copilot Instructions for Sortable Form Project

## Project Overview

This is a **dual-interface sortable form** built with Remix, React Hook Form, and @dnd-kit. It manages nested data structures where parent elements contain children, with synchronized drag-and-drop between form inputs and a sidebar index.

### Core Data Structure

```typescript
type Data = {
    parentArray: Parent[];
};
type Parent = {
    parentKey: string;
    parentValue: string;
    childArray: Child[];
};
```

## Architecture Patterns

### 1. Dual Interface Synchronization

-   **Form Interface**: `app/components/SortableParentItem.tsx` + `SortableChildItem.tsx`
-   **Sidebar Interface**: `app/components/SortableSidebarParentItem.tsx` + `SortableSidebarChildItem.tsx`
-   **State Management**: Single source of truth via React Hook Form's `useFieldArray`
-   **Sync Pattern**: `watchedData = watch()` provides real-time form data to sidebar

### 2. Drag & Drop Implementation

-   **Library**: @dnd-kit (NOT SortableJS - migrated away)
-   **ID Strategy**: Parent IDs from `useFieldArray`, child IDs as `${parentIndex}-${childIndex}`
-   **Collision Detection**: Custom logic in `useSortableForm.tsx` prioritizes parent-to-parent drops
-   **Cross-parent moves**: Children can move between different parents

### 3. Form State Management

-   **Hook**: `app/hooks/useSortableForm.tsx` - central state logic
-   **Registration**: `register()` for all inputs with dot notation paths like `parentArray.${parentIndex}.parentKey`
-   **Dynamic Arrays**: `useFieldArray` for both parent and child collections
-   **Validation**: Integrated with React Hook Form patterns

## Development Workflow

### Essential Commands

```bash
# Development with HMR
npm run dev

# Build for production
npm run build

# Testing (critical: single worker due to drag-drop timing)
npm run test                    # All tests
npm run test:headed            # Visual debugging
npm run test:single            # Stop on first failure
npm run test:ui               # Playwright UI mode
```

**⚠️ Important**: Do not restart the development server (`npm run dev`) after making changes. The server is always running at http://localhost:5173/ with hot module reload (HMR) enabled.

### Testing Architecture

-   **Framework**: Playwright with custom drag-drop utilities
-   **Configuration**: Single worker mode (`--workers=1`) required for drag-drop stability
-   **Test Categories**:
    -   `parent-sort.spec.ts` - Parent element operations
    -   `child-sort.spec.ts` - Child element operations and cross-parent moves
    -   `form-integration.spec.ts` - Data integrity and form submission
    -   `ui-ux.spec.ts` - Visual feedback and accessibility

## Critical Implementation Details

### Key Management

-   **Problem**: React key conflicts cause element tracking failures
-   **Solution**: Use stable IDs from `useFieldArray.fields[].id` for parents, composite IDs for children
-   **Anti-pattern**: Never use array indices as keys for sortable elements

### Drag-Drop Event Handling

```typescript
// In useSortableForm.tsx
const customCollisionDetection = (args: any) => {
    const childIdPattern = /^\d+-\d+$/;
    const isDraggingParent = !childIdPattern.test(args.active.id);
    // Parent drags only target other parents
};
```

### Data Flow Synchronization

-   Form mutations update `useFieldArray` → triggers `watch()` → updates sidebar display
-   Never manipulate sidebar state directly; always go through form state
-   Use `setValue()` for programmatic updates, not direct state mutations

## Common Debugging Patterns

### Drag-Drop Issues

1. Check element IDs in DevTools during drag operations
2. Verify `DndContext` wraps both form and sidebar
3. Confirm `SortableContext` items array matches actual rendered elements

### Form State Issues

1. Use `watchedData` inspection in DevTools
2. Check `register()` paths match actual data structure
3. Verify `useFieldArray` operations (append, remove, move) update correctly

### Test Failures

-   **Timing Issues**: Use `page.waitForLoadState("networkidle")` not fixed timeouts
-   **Element Not Found**: Drag-drop may change DOM structure; re-query elements
-   **Data Integrity**: Always verify both form and sidebar state after operations

## File Navigation

-   **Entry Point**: `app/routes/_index.tsx` - main component orchestration
-   **Core Logic**: `app/hooks/useSortableForm.tsx` - state management and drag handlers
-   **Type Definitions**: `app/types.ts` - central type definitions
-   **Test Utilities**: Check `tests/*.spec.ts` for drag-drop helper patterns
-   **Config**: `playwright.config.ts` - test environment setup
-   **Investigation Docs**: `docs/2025-09-13-e2e-test-failure-investigation/` - debugging insights

## Technology Stack

-   **Frontend**: Remix + React 18 + TypeScript
-   **Forms**: React Hook Form with useFieldArray
-   **Drag-Drop**: @dnd-kit (collision detection, sortable contexts)
-   **Styling**: Tailwind CSS
-   **Testing**: Playwright E2E with custom drag-drop utilities
-   **Build**: Vite with Remix plugin
