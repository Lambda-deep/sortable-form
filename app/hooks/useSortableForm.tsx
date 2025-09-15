import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    useSensors,
    useSensor,
    PointerSensor,
    KeyboardSensor,
} from "@dnd-kit/core";
import type { Data, DragState } from "../types";
import { initialData } from "../lib/initial-data";
import { childIdPattern, sidebarChildPattern } from "../lib/drag-patterns";
import { sidebarCollisionDetection } from "../lib/collision-detection";
import { useParentOperations } from "./useParentOperations";
import { useChildOperations } from "./useChildOperations";

export function useSortableForm() {
    const form = useForm<Data>({
        defaultValues: initialData,
    });
    const { register, watch, getValues, handleSubmit } = form;

    // 親要素操作のカスタムフック
    const { parentFields, handleParentMove, addParent, removeParent, move } =
        useParentOperations({ form });

    // 子要素操作のカスタムフック
    const {
        handleChildMove,
        handleSidebarChildToParentEnd,
        handleSidebarChildMove,
        addChild,
        removeChild,
    } = useChildOperations({ form, parentFields });

    const watchedData = watch();

    // ドラッグ状態の管理
    const [dragState, setDragState] = useState<DragState>({
        activeId: null,
        draggedItem: null,
        dropIndicator: null,
        sidebarActiveId: null,
        sidebarDraggedItem: null,
    });

    // センサーの設定（フォーム用）
    const formSensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px移動で開始
            },
        }),
        useSensor(KeyboardSensor)
    );

    // センサーの設定（サイドバー用）
    const sidebarSensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px移動で開始
            },
        }),
        useSensor(KeyboardSensor)
    );

    // ドラッグ開始ハンドラー
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;

        console.log("📝 フォーム: ドラッグ開始", {
            activeId: active.id,
            activeType: typeof active.id,
        });

        setDragState(prev => ({
            ...prev,
            activeId: active.id as string,
        }));

        const isDraggingChild = childIdPattern.test(active.id as string);

        if (isDraggingChild) {
            const [parentIndex, childIndex] = (active.id as string)
                .split("-")
                .map(Number);
            setDragState(prev => ({
                ...prev,
                draggedItem: {
                    type: "child",
                    parentIndex,
                    childIndex,
                    data: watchedData.parentArray[parentIndex].childArray[
                        childIndex
                    ],
                },
            }));
        } else {
            const parentIndex = parentFields.findIndex(
                field => field.id === active.id
            );
            setDragState(prev => ({
                ...prev,
                draggedItem: {
                    type: "parent",
                    parentIndex,
                    data: watchedData.parentArray[parentIndex],
                },
            }));
        }
    };

    // ドラッグ中ハンドラー
    const handleDragOver = (event: DragOverEvent) => {
        const { over, active } = event;

        console.log("🎯 handleDragOver called:", {
            activeId: active.id,
            overId: over?.id,
            event,
        });

        if (!over) {
            setDragState(prev => ({ ...prev, dropIndicator: null }));
            return;
        }

        // 自分自身の上にドラッグしている場合はインジケーターを表示しない
        if (active.id === over.id) {
            setDragState(prev => ({ ...prev, dropIndicator: null }));
            return;
        }

        const isDraggingChild = childIdPattern.test(active.id as string);
        const isOverChild = childIdPattern.test(over.id as string);

        // サイドバーかどうかの判定
        const isActiveSidebar = (active.id as string).startsWith("sidebar-");
        const isOverSidebar = (over.id as string).startsWith("sidebar-");

        console.log("🎯 ドロップインジケーター判定:", {
            isDraggingChild,
            isOverChild,
            isActiveSidebar,
            isOverSidebar,
            activeId: active.id,
            overId: over.id,
        });

        if (!isDraggingChild && !isOverChild) {
            // Parent要素のドラッグ中
            if (isActiveSidebar && isOverSidebar) {
                // サイドバー内でのParent要素ドラッグ
                const activeId = (active.id as string).replace("sidebar-", "");
                const overId = (over.id as string).replace("sidebar-", "");

                const activeIndex = parentFields.findIndex(
                    field => field.id === activeId
                );
                const overIndex = parentFields.findIndex(
                    field => field.id === overId
                );

                console.log("🎯 サイドバー Parent ドロップインジケーター:", {
                    activeId,
                    overId,
                    activeIndex,
                    overIndex,
                });

                if (activeIndex !== -1 && overIndex !== -1) {
                    const position =
                        activeIndex < overIndex ? "after" : "before";

                    console.log("🎯 サイドバー ドロップインジケーター表示:", {
                        targetId: over.id,
                        position,
                    });

                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: {
                            targetId: over.id as string,
                            position,
                        },
                    }));
                }
            } else if (!isActiveSidebar && !isOverSidebar) {
                // フォーム内でのParent要素ドラッグ
                const activeIndex = parentFields.findIndex(
                    field => field.id === active.id
                );
                const overIndex = parentFields.findIndex(
                    field => field.id === over.id
                );

                if (activeIndex !== -1 && overIndex !== -1) {
                    const position =
                        activeIndex < overIndex ? "after" : "before";

                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: {
                            targetId: over.id as string,
                            position,
                        },
                    }));
                }
            }
        } else if (isDraggingChild && isOverChild) {
            // Child要素のドラッグ中
            const activeIdStr = active.id as string;
            const overIdStr = over.id as string;

            // サイドバーChild要素かどうかの判定
            const isActiveSidebarChild = sidebarChildPattern.test(activeIdStr);
            const isOverSidebarChild = sidebarChildPattern.test(overIdStr);

            if (isActiveSidebarChild && isOverSidebarChild) {
                // サイドバー内でのChild要素ドラッグ
                const [activeParentIndex] = activeIdStr
                    .replace("sidebar-", "")
                    .split("-")
                    .map(Number);
                const [overParentIndex, overChildIndex] = overIdStr
                    .replace("sidebar-", "")
                    .split("-")
                    .map(Number);

                // 同一Parent内でのみドロップインジケーターを表示 - ドラッグ中の要素自体は除外
                if (activeParentIndex === overParentIndex) {
                    const [, activeChildIndex] = activeIdStr
                        .replace("sidebar-", "")
                        .split("-")
                        .map(Number);

                    // ドラッグ中の要素自体は除外
                    if (activeChildIndex !== overChildIndex) {
                        const position =
                            activeChildIndex < overChildIndex
                                ? "after"
                                : "before";

                        setDragState(prev => ({
                            ...prev,
                            dropIndicator: {
                                targetId: over.id as string,
                                position,
                            },
                        }));
                    }
                }
            } else if (!isActiveSidebarChild && !isOverSidebarChild) {
                // フォーム内でのChild要素ドラッグ
                const [activeParentIndex, activeChildIndex] = activeIdStr
                    .split("-")
                    .map(Number);
                const [overParentIndex, overChildIndex] = overIdStr
                    .split("-")
                    .map(Number);

                console.log("🎯 フォーム: Child要素のドラッグオーバー", {
                    activeParentIndex,
                    activeChildIndex,
                    overParentIndex,
                    overChildIndex,
                });

                // 異なるParent間でもドロップインジケーターを表示（拡張）
                if (activeParentIndex === overParentIndex) {
                    // 同一Parent内での移動 - ドラッグ中の要素自体は除外
                    if (activeChildIndex !== overChildIndex) {
                        const position =
                            activeChildIndex < overChildIndex
                                ? "after"
                                : "before";

                        console.log(
                            "🎯 フォーム: 同一Parent内でのChild移動インジケーター",
                            {
                                targetId: over.id,
                                position,
                            }
                        );

                        setDragState(prev => ({
                            ...prev,
                            dropIndicator: {
                                targetId: over.id as string,
                                position,
                            },
                        }));
                    }
                } else {
                    // 異なるParent間での移動（新機能）
                    console.log(
                        "🎯 フォーム: 異なるParent間でのChild移動インジケーター",
                        {
                            fromParent: activeParentIndex,
                            toParent: overParentIndex,
                            targetId: over.id,
                        }
                    );

                    // 異なるParentへの移動では常に"before"ポジションを使用
                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: {
                            targetId: over.id as string,
                            position: "before",
                        },
                    }));
                }
            }
        } else if (isDraggingChild && !isOverChild) {
            // Child要素を親要素/コンテナにドラッグ（先頭/末尾挿入）
            const activeIdStr = active.id as string;
            const overIdStr = over.id as string;

            // サイドバーChild要素かどうかの判定
            const isActiveSidebarChild = sidebarChildPattern.test(activeIdStr);

            if (!isActiveSidebarChild && !isOverSidebar) {
                // フォーム内でのChild要素をコンテナにドラッグした場合のみインジケーターを表示
                if (overIdStr.endsWith("-container")) {
                    // コンテナIDから親IDを抽出
                    const targetParentId = overIdStr.replace("-container", "");

                    const targetParent = parentFields.find(
                        field => field.id === targetParentId
                    );
                    if (targetParent) {
                        const targetParentIndex = parentFields.findIndex(
                            field => field.id === targetParentId
                        );
                        const targetParentData = getValues(
                            `parentArray.${targetParentIndex}`
                        );

                        // マウス位置による先頭/末尾判定
                        const rect = event.active.rect.current.translated;
                        const overRect = event.over?.rect;

                        let isInsertAtEnd = true; // デフォルトは末尾挿入

                        if (overRect && rect) {
                            // ドロップターゲットの上半分なら先頭挿入、下半分なら末尾挿入
                            const overCenter =
                                overRect.top + overRect.height / 2;
                            const dragCenter = rect.top + rect.height / 2;
                            isInsertAtEnd = dragCenter > overCenter;
                        }

                        if (targetParentData.childArray.length > 0) {
                            const targetChildIndex = isInsertAtEnd
                                ? targetParentData.childArray.length - 1 // 末尾の子要素
                                : 0; // 先頭の子要素
                            const targetChildId = `${targetParentIndex}-${targetChildIndex}`;
                            const position = isInsertAtEnd ? "after" : "before";

                            // ドラッグ中の要素自体は除外
                            if (targetChildId !== active.id) {
                                console.log(
                                    "🎯 フォーム: 位置別挿入インジケーター",
                                    {
                                        targetParentId,
                                        targetChildId,
                                        position,
                                        isInsertAtEnd,
                                        dragCenter: rect
                                            ? rect.top + rect.height / 2
                                            : "undefined",
                                        overCenter: overRect
                                            ? overRect.top + overRect.height / 2
                                            : "undefined",
                                    }
                                );

                                setDragState(prev => ({
                                    ...prev,
                                    dropIndicator: {
                                        targetId: targetChildId,
                                        position,
                                    },
                                }));
                            }
                        } else {
                            // 子要素がない場合は親要素IDを使用してドロップ位置を設定
                            const position = isInsertAtEnd ? "after" : "before";
                            console.log("🎯 フォーム: 空の親要素への挿入", {
                                targetParentId,
                                position,
                                isInsertAtEnd,
                            });
                            setDragState(prev => ({
                                ...prev,
                                dropIndicator: {
                                    targetId: targetParentId,
                                    position,
                                },
                            }));
                        }
                    }
                }
            }
        }
    };

    // ドラッグ終了ハンドラー
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            setDragState({
                activeId: null,
                draggedItem: null,
                dropIndicator: null,
                sidebarActiveId: null,
                sidebarDraggedItem: null,
            });
            return;
        }

        const isDraggingChild = childIdPattern.test(active.id as string);

        if (!isDraggingChild) {
            // Parent要素の移動処理
            handleParentMove(active, over);
        } else {
            // Child要素の移動処理 - dropIndicatorの位置情報を利用
            const dropPosition = dragState.dropIndicator?.position;
            const dropIndicatorTargetId = dragState.dropIndicator?.targetId;
            // "inside"は除外して、"before"または"after"のみを渡す
            const validPosition =
                dropPosition === "inside" ? undefined : dropPosition;
            handleChildMove(active, over, validPosition, dropIndicatorTargetId);
        }

        // 状態をクリーンアップ
        setDragState({
            activeId: null,
            draggedItem: null,
            dropIndicator: null,
            sidebarActiveId: null,
            sidebarDraggedItem: null,
        });
    };

    // Parent要素移動の処理

    // サイドバー専用のドラッグオーバーハンドラー
    const handleSidebarDragOver = (event: DragOverEvent) => {
        const { over, active } = event;

        console.log("🎯 サイドバー: handleSidebarDragOver called:", {
            activeId: active.id,
            overId: over?.id,
            event,
        });

        if (!over) {
            setDragState(prev => ({ ...prev, dropIndicator: null }));
            return;
        }

        // 自分自身の上にドラッグしている場合はインジケーターを表示しない
        if (active.id === over.id) {
            setDragState(prev => ({ ...prev, dropIndicator: null }));
            return;
        }

        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;

        // サイドバーChild要素かどうかの判定
        const isActiveSidebarChild = sidebarChildPattern.test(activeIdStr);
        const isOverSidebarChild = sidebarChildPattern.test(overIdStr);

        console.log("🎯 サイドバー: ドロップインジケーター判定:", {
            isActiveSidebarChild,
            isOverSidebarChild,
            activeId: active.id,
            overId: over.id,
        });

        if (isActiveSidebarChild && isOverSidebarChild) {
            // サイドバー内でのChild要素ドラッグ
            const [activeParentIndex] = activeIdStr
                .replace("sidebar-", "")
                .split("-")
                .map(Number);
            const [overParentIndex, overChildIndex] = overIdStr
                .replace("sidebar-", "")
                .split("-")
                .map(Number);

            console.log("🎯 サイドバー: Child要素間のドラッグ:", {
                activeParentIndex,
                overParentIndex,
                overChildIndex,
            });

            // 同一Parent内または異なるParent間でもドロップインジケーターを表示（拡張）
            if (activeParentIndex === overParentIndex) {
                // 同一Parent内での移動 - ドラッグ中の要素自体は除外
                const [, activeChildIndex] = activeIdStr
                    .replace("sidebar-", "")
                    .split("-")
                    .map(Number);

                // ドラッグ中の要素自体は除外
                if (activeChildIndex !== overChildIndex) {
                    const position =
                        activeChildIndex < overChildIndex ? "after" : "before";

                    console.log(
                        "🎯 サイドバー: 同一Parent内Child ドロップインジケーター表示:",
                        {
                            targetId: over.id,
                            position,
                            activeChildIndex,
                            overChildIndex,
                        }
                    );

                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: {
                            targetId: over.id as string,
                            position,
                        },
                    }));
                }
            } else {
                // 異なるParent間での移動（新機能）
                console.log(
                    "🎯 サイドバー: 異なるParent間Child移動インジケーター:",
                    {
                        fromParent: activeParentIndex,
                        toParent: overParentIndex,
                        targetId: over.id,
                    }
                );

                // 異なるParentへの移動では常に"before"ポジションを使用
                setDragState(prev => ({
                    ...prev,
                    dropIndicator: {
                        targetId: over.id as string,
                        position: "before",
                    },
                }));
            }
        } else if (!isActiveSidebarChild && !isOverSidebarChild) {
            // サイドバー内でのParent要素ドラッグ
            const activeOriginalId = activeIdStr.replace("sidebar-", "");
            const overOriginalId = overIdStr.replace("sidebar-", "");

            const activeIndex = parentFields.findIndex(
                field => field.id === activeOriginalId
            );
            const overIndex = parentFields.findIndex(
                field => field.id === overOriginalId
            );

            console.log("🎯 サイドバー: Parent ドロップインジケーター:", {
                activeId: activeOriginalId,
                overId: overOriginalId,
                activeIndex,
                overIndex,
            });

            if (activeIndex !== -1 && overIndex !== -1) {
                const position = activeIndex < overIndex ? "after" : "before";

                console.log(
                    "🎯 サイドバー: Parent ドロップインジケーター表示:",
                    {
                        targetId: over.id,
                        position,
                    }
                );

                setDragState(prev => ({
                    ...prev,
                    dropIndicator: {
                        targetId: over.id as string,
                        position,
                    },
                }));
            }
        } else if (isActiveSidebarChild && !isOverSidebarChild) {
            // サイドバーChild要素をコンテナにドラッグした場合のみインジケーターを表示

            // コンテナパターンをチェック
            const sidebarContainerPattern = /^sidebar-(.+)-container$/;
            let targetParentId: string | null = null;

            if (sidebarContainerPattern.test(overIdStr)) {
                // コンテナにドロップした場合のみ処理
                const containerMatch = overIdStr.match(sidebarContainerPattern);
                targetParentId = containerMatch?.[1] || null;

                if (targetParentId) {
                    const targetParentIndex = parentFields.findIndex(
                        field => field.id === targetParentId
                    );
                    if (targetParentIndex !== -1) {
                        const targetParentData = getValues(
                            `parentArray.${targetParentIndex}`
                        );

                        // マウス位置による先頭/末尾判定
                        const rect = event.active.rect.current.translated;
                        const overRect = event.over?.rect;

                        let isInsertAtEnd = true; // デフォルトは末尾挿入

                        if (overRect && rect) {
                            // ドロップターゲットの上半分なら先頭挿入、下半分なら末尾挿入
                            const overCenter =
                                overRect.top + overRect.height / 2;
                            const dragCenter = rect.top + rect.height / 2;
                            isInsertAtEnd = dragCenter > overCenter;
                        }

                        if (targetParentData.childArray.length > 0) {
                            const targetChildIndex = isInsertAtEnd
                                ? targetParentData.childArray.length - 1 // 末尾の子要素
                                : 0; // 先頭の子要素
                            const targetChildId = `sidebar-${targetParentIndex}-${targetChildIndex}`;
                            const position = isInsertAtEnd ? "after" : "before";

                            // ドラッグ中の要素自体は除外
                            if (targetChildId !== active.id) {
                                console.log(
                                    "🎯 サイドバー: 位置別挿入インジケーター",
                                    {
                                        targetParentId,
                                        targetChildId,
                                        position,
                                        isInsertAtEnd,
                                        dragCenter: rect
                                            ? rect.top + rect.height / 2
                                            : "undefined",
                                        overCenter: overRect
                                            ? overRect.top + overRect.height / 2
                                            : "undefined",
                                    }
                                );

                                setDragState(prev => ({
                                    ...prev,
                                    dropIndicator: {
                                        targetId: targetChildId,
                                        position,
                                    },
                                }));
                            }
                        } else {
                            // 子要素がない場合はインジケーターをクリア
                            console.log("🎯 サイドバー: 空の親要素への挿入");
                            setDragState(prev => ({
                                ...prev,
                                dropIndicator: null,
                            }));
                        }
                    } else {
                        console.log(
                            "🎯 サイドバー: 対象親要素が見つかりません",
                            {
                                targetParentId,
                            }
                        );
                        setDragState(prev => ({
                            ...prev,
                            dropIndicator: null,
                        }));
                    }
                } else {
                    console.log("🎯 サイドバー: 無効なドロップターゲット", {
                        overIdStr,
                    });
                    setDragState(prev => ({ ...prev, dropIndicator: null }));
                }
            }
        } else {
            // その他の無効なドラッグ
            console.log("🎯 サイドバー: 無効なドラッグ組み合わせ");
            setDragState(prev => ({ ...prev, dropIndicator: null }));
        }
    };

    // サイドバー専用のドラッグハンドラー
    const handleSidebarDragStart = (event: DragStartEvent) => {
        const { active } = event;

        console.log("🎯 サイドバー: ドラッグ開始", {
            activeId: active.id,
            activeType: typeof active.id,
        });

        setDragState(prev => ({
            ...prev,
            sidebarActiveId: active.id as string,
        }));

        const activeIdStr = active.id as string;

        // サイドバーのChild要素かどうかの判定
        const isSidebarChild = sidebarChildPattern.test(activeIdStr);

        if (isSidebarChild) {
            // "sidebar-0-1" -> [0, 1]
            const [parentIndex, childIndex] = activeIdStr
                .replace("sidebar-", "")
                .split("-")
                .map(Number);

            console.log("🎯 サイドバー: Child要素をドラッグ中", {
                parentIndex,
                childIndex,
            });
            setDragState(prev => ({
                ...prev,
                sidebarDraggedItem: {
                    type: "child",
                    parentIndex,
                    childIndex,
                    data: watchedData.parentArray[parentIndex].childArray[
                        childIndex
                    ],
                },
            }));
        } else {
            // Parent要素のドラッグ（既存の処理）
            const parentIndex = parentFields.findIndex(
                field => field.id === activeIdStr.replace(/^sidebar-/, "")
            );
            if (parentIndex !== -1) {
                console.log(
                    "🎯 サイドバー: Parent要素をドラッグ中",
                    parentIndex
                );
                setDragState(prev => ({
                    ...prev,
                    sidebarDraggedItem: {
                        type: "parent",
                        parentIndex,
                        data: watchedData.parentArray[parentIndex],
                    },
                }));
            }
        }
    };

    const handleSidebarDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        console.log("サイドバー: ドラッグ終了", {
            activeId: active.id,
            overId: over?.id,
        });

        // overId が存在しない場合は無効なドロップ
        if (!over) {
            console.log("サイドバー: ドロップターゲットなし");
            setDragState(prev => ({
                ...prev,
                sidebarActiveId: null,
                sidebarDraggedItem: null,
                dropIndicator: null,
            }));
            return;
        }

        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;

        // サイドバーChild要素かどうかの判定
        const isActiveChild = sidebarChildPattern.test(activeIdStr);
        const isOverChild = sidebarChildPattern.test(overIdStr);

        if (isActiveChild && isOverChild) {
            // サイドバーChild要素の移動処理
            console.log("サイドバー: Child要素移動処理");
            const dropPosition = dragState.dropIndicator?.position;
            const dropIndicatorTargetId = dragState.dropIndicator?.targetId;
            const validPosition =
                dropPosition === "inside" ? undefined : dropPosition;
            handleSidebarChildMove(
                active,
                over,
                validPosition,
                dropIndicatorTargetId
            );
        } else if (isActiveChild && !isOverChild) {
            // Child要素をコンテナにドロップ（末尾挿入）
            const containerPattern = /^sidebar-(.+)-container$/;
            const containerMatch = overIdStr.match(containerPattern);

            if (containerMatch) {
                const targetParentId = containerMatch[1];
                console.log("サイドバー: コンテナドロップ処理", {
                    activeId: activeIdStr,
                    targetParentId,
                });

                // ターゲット親のインデックスを取得
                const targetParentIndex = parentFields.findIndex(
                    field => field.id === targetParentId
                );

                if (targetParentIndex !== -1) {
                    console.log("サイドバー: 位置指定挿入実行", {
                        targetParentIndex,
                        dropPosition: dragState.dropIndicator?.position,
                    });
                    // dropIndicatorの位置情報を渡す
                    const dropPosition = dragState.dropIndicator?.position;
                    const validPosition =
                        dropPosition === "inside" ? undefined : dropPosition;
                    handleSidebarChildToParentEnd(
                        active,
                        targetParentIndex,
                        validPosition
                    );
                }
            }
        } else if (!isActiveChild && !isOverChild) {
            // サイドバーParent要素の移動処理（既存の処理）
            console.log("サイドバー: Parent要素移動処理");

            // sidebar-プレフィックスを削除して元のIDを取得
            const activeOriginalId = activeIdStr.replace(/^sidebar-/, "");
            const overOriginalId = overIdStr.replace(/^sidebar-/, "");

            console.log("サイドバー: ID変換", {
                activeId: active.id,
                overId: over.id,
                activeOriginalId,
                overOriginalId,
            });

            // インデックスを取得
            const activeIndex = parentFields.findIndex(
                field => field.id === activeOriginalId
            );
            const overIndex = parentFields.findIndex(
                field => field.id === overOriginalId
            );

            console.log("サイドバー: インデックス", {
                activeIndex,
                overIndex,
            });

            // 有効なインデックスで、かつ位置が異なる場合のみ移動を実行
            if (
                activeIndex !== -1 &&
                overIndex !== -1 &&
                activeIndex !== overIndex
            ) {
                console.log("サイドバー: Parent移動処理を実行");
                move(activeIndex, overIndex);
            } else {
                console.log("サイドバー: 移動不要または無効な移動", {
                    reason:
                        activeIndex === -1
                            ? "activeIndex not found"
                            : overIndex === -1
                              ? "overIndex not found"
                              : "same index",
                });
            }
        }

        // サイドバーの状態をクリーンアップ
        setDragState(prev => ({
            ...prev,
            sidebarActiveId: null,
            sidebarDraggedItem: null,
            dropIndicator: null,
        }));
    };

    const onSubmit = (data: Data) => {
        console.log("Submitted data:", data);
        window.alert("Form submitted! Check console for data.");
    };

    return {
        register,
        handleSubmit,
        parentFields,
        watchedData,
        addParent,
        addChild,
        removeChild,
        removeParent,
        onSubmit,
        // ドラッグ関連
        formSensors,
        sidebarSensors,
        sidebarCollisionDetection,
        dragHandlers: {
            onDragStart: handleDragStart,
            onDragOver: handleDragOver,
            onDragEnd: handleDragEnd,
            onSidebarDragStart: handleSidebarDragStart,
            onSidebarDragOver: handleSidebarDragOver,
            onSidebarDragEnd: handleSidebarDragEnd,
        },
        dragState,
    };
}
