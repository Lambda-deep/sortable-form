/**
 * ドラッグ&ドロップで使用するIDパターンのマッチング関数
 */

// Child ID パターンの判定 (例: "0-1", "1-2")
export const childIdPattern = /^\d+-\d+$/;

// サイドバーChild要素のパターン (例: "sidebar-0-1", "sidebar-1-2")
export const sidebarChildPattern = /^sidebar-\d+-\d+$/;

// サイドバーコンテナのパターン (例: "sidebar-abc123-container")
export const sidebarContainerPattern = /^sidebar-(.+)-container$/;

// サイドバー親要素のパターン (例: "sidebar-abc123")
export const sidebarParentPattern = /^sidebar-(.+)$/;

/**
 * IDが子要素のパターンかどうかを判定
 */
export const isChildId = (id: string): boolean => {
    return childIdPattern.test(id);
};

/**
 * IDがサイドバーの子要素のパターンかどうかを判定
 */
export const isSidebarChildId = (id: string): boolean => {
    return sidebarChildPattern.test(id);
};

/**
 * IDがサイドバーのコンテナのパターンかどうかを判定
 */
export const isSidebarContainerId = (id: string): boolean => {
    return sidebarContainerPattern.test(id);
};

/**
 * IDがサイドバーの親要素のパターンかどうかを判定
 */
export const isSidebarParentId = (id: string): boolean => {
    return sidebarParentPattern.test(id);
};

/**
 * IDからサイドバープレフィックスを削除
 */
export const removeSidebarPrefix = (id: string): string => {
    return id.replace("sidebar-", "");
};

/**
 * IDからコンテナサフィックスを削除
 */
export const removeContainerSuffix = (id: string): string => {
    return id.replace("-container", "");
};
