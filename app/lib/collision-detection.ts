import { CollisionDetection } from "@dnd-kit/core";
import { sidebarChildPattern } from "./drag-patterns";

/**
 * サイドバー用のカスタム衝突検出
 */
export const sidebarCollisionDetection: CollisionDetection = args => {
    const { active, collisionRect, droppableRects, droppableContainers } = args;

    if (!active) return [];

    const activeIdStr = active.id as string;
    const isActiveSidebarChild = sidebarChildPattern.test(activeIdStr);

    // アクティブな要素がサイドバーChild要素の場合
    if (isActiveSidebarChild) {
        // Child要素は同じタイプの要素（他のChild要素）とコンテナに衝突
        const sidebarContainerPattern = /^sidebar-.+-container$/;
        const validContainers = droppableContainers.filter(container => {
            const containerIdStr = container.id as string;
            return (
                sidebarChildPattern.test(containerIdStr) ||
                sidebarContainerPattern.test(containerIdStr)
            );
        });

        return validContainers
            .filter(container => {
                const rect = droppableRects.get(container.id);
                return (
                    collisionRect &&
                    rect &&
                    collisionRect.left < rect.right &&
                    collisionRect.right > rect.left &&
                    collisionRect.top < rect.bottom &&
                    collisionRect.bottom > rect.top
                );
            })
            .map(container => ({ id: container.id }));
    } else {
        // Parent要素は他のParent要素のみに衝突（コンテナは除外）
        const sidebarContainerPattern = /^sidebar-.+-container$/;
        const validContainers = droppableContainers.filter(container => {
            const containerIdStr = container.id as string;
            return (
                containerIdStr.startsWith("sidebar-") &&
                !sidebarChildPattern.test(containerIdStr) &&
                !sidebarContainerPattern.test(containerIdStr)
            );
        });

        return validContainers
            .filter(container => {
                const rect = droppableRects.get(container.id);
                return (
                    collisionRect &&
                    rect &&
                    collisionRect.left < rect.right &&
                    collisionRect.right > rect.left &&
                    collisionRect.top < rect.bottom &&
                    collisionRect.bottom > rect.top
                );
            })
            .map(container => ({ id: container.id }));
    }
};
