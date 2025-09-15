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
import {
    isChildId,
    isSidebarChildId,
    isSidebarContainerId,
    sidebarContainerPattern,
} from "../lib/drag-patterns";
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

    // フォーム専用のドラッグ開始ハンドラー
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setDragState(prev => ({
            ...prev,
            activeId: active.id as string,
        }));

        const activeIdStr = active.id as string;

        // フォームのChild要素かどうかの判定
        const isFormChild = isChildId(activeIdStr);

        if (isFormChild) {
            // Child要素のドラッグ
            const [parentIndex, childIndex] = activeIdStr
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
            // Parent要素のドラッグ
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

    // フォーム専用のドラッグ中ハンドラー
    const handleDragOver = (event: DragOverEvent) => {
        const { over, active } = event;

        // ドロップ先が存在しない場合はインジケーターをクリア
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

        const isActiveFormChild = isChildId(activeIdStr);
        const isOverFormChild = isChildId(overIdStr);

        if (isActiveFormChild && isOverFormChild) {
            // フォーム内でのChild要素ドラッグのみ処理
            const [activeParentIndex, activeChildIndex] = activeIdStr
                .split("-")
                .map(Number);
            const [overParentIndex, overChildIndex] = overIdStr
                .split("-")
                .map(Number);

            if (activeParentIndex === overParentIndex) {
                // 同一Parent内での移動 - ドラッグ中の要素自体は除外
                if (activeChildIndex !== overChildIndex) {
                    const position =
                        activeChildIndex < overChildIndex ? "after" : "before";

                    console.log("handleDragOver Same Parent", {
                        active,
                        over,
                        activeIdStr,
                        overIdStr,
                        position,
                    });

                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: {
                            targetId: overIdStr,
                            position,
                        },
                    }));
                }
            } else {
                // 異なるParentへの移動 - マウス位置に基づいてbefore/afterを判定
                const rect = event.active.rect.current.translated;
                const overRect = event.over?.rect;

                let position: "before" | "after" = "before"; // デフォルトは先頭挿入

                if (overRect && rect) {
                    // 末尾要素の場合は挿入範囲を拡張

                    // 最後の子要素の場合、要素の中央より下ならafter挿入
                    const overCenter = overRect.top + overRect.height * 0.4;
                    const dragCenter = rect.top + rect.height / 2;
                    position = dragCenter > overCenter ? "after" : "before";
                }

                console.log("handleDragOver Different Parent", {
                    active,
                    over,
                    activeIdStr,
                    overIdStr,
                    position,
                });

                setDragState(prev => ({
                    ...prev,
                    dropIndicator: {
                        targetId: overIdStr,
                        position,
                    },
                }));
            }
        } else if (!isActiveFormChild && !isOverFormChild) {
            // フォーム内でのParent要素ドラッグのみ処理
            const activeIndex = parentFields.findIndex(
                field => field.id === active.id
            );
            const overIndex = parentFields.findIndex(
                field => field.id === over.id
            );

            if (activeIndex !== -1 && overIndex !== -1) {
                const position = activeIndex < overIndex ? "after" : "before";

                console.log("handleDragOver Parent", {
                    active,
                    over,
                    activeIdStr,
                    overIdStr,
                    position,
                });

                setDragState(prev => ({
                    ...prev,
                    dropIndicator: {
                        targetId: overIdStr,
                        position,
                    },
                }));
            }
        } else if (isActiveFormChild && !isOverFormChild) {
            // フォーム内でのChild要素をコンテナにドラッグ（先頭/末尾挿入）
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
                        const overCenter = overRect.top + overRect.height / 2;
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
                            console.log("handleDragOver To Container", {
                                active,
                                over,
                                activeIdStr,
                                overIdStr,
                                targetChildId,
                                position,
                            });

                            setDragState(prev => ({
                                ...prev,
                                dropIndicator: {
                                    targetId: targetChildId,
                                    position,
                                },
                            }));
                        }
                    } else {
                        console.log("handleDragOver To Container No Children", {
                            active,
                            over,
                            activeIdStr,
                            overIdStr,
                            targetParentId,
                        });

                        // 子要素がない場合は親要素IDを使用してドロップ位置を設定
                        // TODO: 現状親要素のインジケーターが表示されるので、コンテナにインジケーターを表示するように変更する
                        setDragState(prev => ({
                            ...prev,
                            dropIndicator: null,
                        }));
                    }
                } else {
                    console.log("handleDragOver To Container Invalid Parent", {
                        active,
                        over,
                        activeIdStr,
                        overIdStr,
                        targetParentId,
                    });

                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: null,
                    }));
                }
            }
        } else {
            console.log("handleDragOver Invalid Drag", {
                active,
                over,
                activeIdStr,
                overIdStr,
            });

            // その他の無効なドラッグ
            setDragState(prev => ({ ...prev, dropIndicator: null }));
        }
    };

    // フォーム専用のドラッグ終了ハンドラー
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

        const activeIdStr = active.id as string;
        const isDraggingChild = isChildId(activeIdStr);

        if (!isDraggingChild) {
            console.log("handleDragEnd Parent", { active, over, activeIdStr });

            // フォーム内のParent要素の移動処理
            handleParentMove(active, over);
        } else {
            console.log("handleDragEnd Child", {
                active,
                over,
                activeIdStr,
                dragState,
            });

            // フォーム内のChild要素の移動処理 - dropIndicatorの位置情報を利用
            const dropPosition = dragState.dropIndicator?.position;
            const dropIndicatorTargetId = dragState.dropIndicator?.targetId;
            handleChildMove(active, over, dropPosition, dropIndicatorTargetId);
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

    // サイドバー専用のドラッグハンドラー
    const handleSidebarDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setDragState(prev => ({
            ...prev,
            sidebarActiveId: active.id as string,
        }));

        const activeIdStr = active.id as string;

        // サイドバーのChild要素かどうかの判定
        const isSidebarChild = isSidebarChildId(activeIdStr);

        if (isSidebarChild) {
            // Child要素のドラッグ
            const [parentIndex, childIndex] = activeIdStr
                .replace(/^sidebar-/, "")
                .split("-")
                .map(Number);

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
            // Parent要素のドラッグ
            const parentIndex = parentFields.findIndex(
                field => field.id === activeIdStr.replace(/^sidebar-/, "")
            );
            if (parentIndex !== -1) {
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

    // サイドバー専用のドラッグ中ハンドラー
    const handleSidebarDragOver = (event: DragOverEvent) => {
        const { over, active } = event;

        // // ドロップ先が存在しない場合はインジケーターをクリア
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
        const isActiveSidebarChild = isSidebarChildId(activeIdStr);
        const isOverSidebarChild = isSidebarChildId(overIdStr);

        if (isActiveSidebarChild && isOverSidebarChild) {
            // サイドバー内でのChild要素ドラッグ
            const [activeParentIndex, activeChildIndex] = activeIdStr
                .replace("sidebar-", "")
                .split("-")
                .map(Number);
            const [overParentIndex, overChildIndex] = overIdStr
                .replace("sidebar-", "")
                .split("-")
                .map(Number);

            if (activeParentIndex === overParentIndex) {
                // 同一Parent内での移動 - ドラッグ中の要素自体は除外
                if (activeChildIndex !== overChildIndex) {
                    const position =
                        activeChildIndex < overChildIndex ? "after" : "before";

                    console.log("handleSidebarDragOver Same Parent", {
                        active,
                        over,
                        activeIdStr,
                        overIdStr,
                        position,
                    });

                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: {
                            targetId: overIdStr,
                            position,
                        },
                    }));
                }
            } else {
                // 異なるParentへの移動 - マウス位置に基づいてbefore/afterを判定
                const rect = event.active.rect.current.translated;
                const overRect = event.over?.rect;

                let position: "before" | "after" = "before"; // デフォルトは先頭挿入

                if (overRect && rect) {
                    // ドロップターゲットの上半分なら先頭挿入、下半分なら末尾挿入
                    const overCenter = overRect.top + overRect.height / 2;
                    const dragCenter = rect.top + rect.height / 2;
                    position = dragCenter > overCenter ? "after" : "before";
                }

                console.log("handleSidebarDragOver Different Parent", {
                    active,
                    over,
                    activeIdStr,
                    overIdStr,
                    position,
                });

                setDragState(prev => ({
                    ...prev,
                    dropIndicator: {
                        targetId: overIdStr,
                        position,
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

            if (activeIndex !== -1 && overIndex !== -1) {
                const position = activeIndex < overIndex ? "after" : "before";

                console.log("handleSidebarDragOver Parent", {
                    active,
                    over,
                    activeIdStr,
                    overIdStr,
                    position,
                });

                setDragState(prev => ({
                    ...prev,
                    dropIndicator: {
                        targetId: overIdStr,
                        position,
                    },
                }));
            }
        } else if (isActiveSidebarChild && !isOverSidebarChild) {
            // サイドバーChild要素をコンテナにドラッグした場合のみインジケーターを表示

            // コンテナパターンをチェック
            let targetParentId: string | null = null;

            if (isSidebarContainerId(overIdStr)) {
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
                            if (targetChildId !== activeIdStr) {
                                console.log(
                                    "handleSidebarDragOver To Container",
                                    {
                                        active,
                                        over,
                                        activeIdStr,
                                        overIdStr,
                                        targetChildId,
                                        position,
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
                            console.log(
                                "handleSidebarDragOver To Container No Children",
                                {
                                    active,
                                    over,
                                    activeIdStr,
                                    overIdStr,
                                    targetParentId,
                                }
                            );

                            // 子要素がない場合はインジケーターをクリア
                            // TODO: コンテナにインジケーターを表示するように変更する
                            setDragState(prev => ({
                                ...prev,
                                dropIndicator: null,
                            }));
                        }
                    } else {
                        console.log(
                            "handleSidebarDragOver To Container Invalid Parent",
                            {
                                active,
                                over,
                                activeIdStr,
                                overIdStr,
                                targetParentId,
                            }
                        );

                        setDragState(prev => ({
                            ...prev,
                            dropIndicator: null,
                        }));
                    }
                } else {
                    console.log(
                        "handleSidebarDragOver To Container Invalid Parent",
                        {
                            active,
                            over,
                            activeIdStr,
                            overIdStr,
                            targetParentId,
                        }
                    );

                    setDragState(prev => ({ ...prev, dropIndicator: null }));
                }
            }
        } else {
            console.log("handleSidebarDragOver Invalid Drag", {
                active,
                over,
                activeIdStr,
                overIdStr,
            });

            // その他の無効なドラッグ
            setDragState(prev => ({ ...prev, dropIndicator: null }));
        }
    };

    // サイドバー専用のドラッグ終了ハンドラー
    const handleSidebarDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // overId が存在しない場合は無効なドロップ
        if (!over) {
            return;
        }

        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;

        // サイドバーChild要素かどうかの判定
        const isActiveChild = isSidebarChildId(activeIdStr);
        const isOverChild = isSidebarChildId(overIdStr);
        const isOverContainer = isSidebarContainerId(overIdStr);

        if (isActiveChild && (isOverChild || isOverContainer)) {
            // サイドバーChild要素の移動処理（子要素またはコンテナへのドロップ）
            const dropPosition = dragState.dropIndicator?.position;
            const dropIndicatorTargetId = dragState.dropIndicator?.targetId;

            console.log("handleSidebarDragEnd Child", {
                active,
                over,
                activeIdStr,
                overIdStr,
                isOverChild,
                isOverContainer,
                dragState,
            });

            handleSidebarChildMove(
                active,
                over,
                dropPosition,
                dropIndicatorTargetId
            );
        } else if (!isActiveChild && !isOverChild && !isOverContainer) {
            // サイドバーParent要素の移動処理（既存の処理）

            // sidebar-プレフィックスを削除して元のIDを取得
            const activeOriginalId = activeIdStr.replace(/^sidebar-/, "");
            const overOriginalId = overIdStr.replace(/^sidebar-/, "");

            // インデックスを取得
            const activeIndex = parentFields.findIndex(
                field => field.id === activeOriginalId
            );
            const overIndex = parentFields.findIndex(
                field => field.id === overOriginalId
            );

            console.log("handleSidebarDragEnd Parent", {
                active,
                over,
                activeIndex,
                overIndex,
            });

            // 有効なインデックスで、かつ位置が異なる場合のみ移動を実行
            if (
                activeIndex !== -1 &&
                overIndex !== -1 &&
                activeIndex !== overIndex
            ) {
                move(activeIndex, overIndex);
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
