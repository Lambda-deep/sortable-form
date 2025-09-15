import { CollisionDetection } from "@dnd-kit/core";
import {
    isSidebarChildId,
    isSidebarContainerId,
    isSidebarParentId,
} from "./drag-patterns";

/**
 * サイドバー用のカスタム衝突検出
 */
export const sidebarCollisionDetection: CollisionDetection = ({
    active,
    collisionRect,
    droppableRects,
    droppableContainers,
}) => {
    if (!active) return [];

    const activeIdStr = active.id as string;
    const isActiveSidebarChild = isSidebarChildId(activeIdStr);

    // アクティブな要素がサイドバーChild要素の場合
    if (isActiveSidebarChild) {
        // Child要素は同じタイプの要素（他のChild要素）とコンテナに衝突
        const validContainers = droppableContainers.filter(container => {
            const containerIdStr = container.id as string;
            return (
                isSidebarChildId(containerIdStr) ||
                isSidebarContainerId(containerIdStr)
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
        const validContainers = droppableContainers.filter(container => {
            const containerIdStr = container.id as string;
            return isSidebarParentId(containerIdStr);
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
