// src/features/abacus/components/AbacusBoard.tsx
import React, { useState } from "react";

interface AbacusBoardProps {
  rows?: number;
  beadsPerRow?: number;
}

type ClusterSide = "left" | "right";

interface DragState {
  rowIndex: number;
  pointerId: number;
  pointerType: string;
  startX: number;
  rowWidth: number;
  startRightCount: number;
  clusterSide: ClusterSide;
  clusterSize: number;
  clusterStartIndex: number;
  clusterEndIndex: number;
  moved: boolean;
}

export const AbacusBoard: React.FC<AbacusBoardProps> = ({
  rows = 8,
  beadsPerRow = 10,
}) => {
  // 每一排只記「右邊有幾顆珠子」
  const [rightCounts, setRightCounts] = useState<number[]>(
    () => Array.from({ length: rows }, () => 0)
  );
  const [dragState, setDragState] = useState<DragState | null>(null);

  // debug：記錄最後一次被抓到的是哪一顆，如 R1B5
  const [lastDraggedBead, setLastDraggedBead] = useState<string | null>(null);

  const updateRightCount = (rowIndex: number, newCount: number) => {
    const clamped = Math.max(0, Math.min(beadsPerRow, newCount));
    setRightCounts((prev) => {
      const next = [...prev];
      next[rowIndex] = clamped;
      return next;
    });
  };

  /**
   * 只接受「真的點到珠子」的情況：
   * - 有找到 .abacus-bead => 回傳對應 index
   * - 沒有 => 回傳 -1（代表不要啟動拖曳）
   */
  const hitBeadIndex = (e: React.PointerEvent<HTMLDivElement>): number => {
    const rawTarget = e.target as HTMLElement | null;
    const beadElement = rawTarget?.closest(
      ".abacus-bead"
    ) as HTMLElement | null;

    if (beadElement && beadElement.dataset.beadIndex != null) {
      const idx = Number(beadElement.dataset.beadIndex);
      if (!Number.isNaN(idx)) {
        return Math.max(0, Math.min(beadsPerRow - 1, idx));
      }
    }

    // 沒點到珠子：直接回 -1，不做任何動作
    return -1;
  };

  const handleTrackPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    rowIndex: number
  ) => {
    e.preventDefault(); // 避免被當成捲動

    const rect = e.currentTarget.getBoundingClientRect();
    const beadIndex = hitBeadIndex(e);

    // 如果沒點到珠子（例如點在灰線／空白處），直接忽略
    if (beadIndex < 0) {
      return;
    }

    const currentRight = rightCounts[rowIndex];
    const firstRightIndex = beadsPerRow - currentRight; // 右邊第一顆 index

    // debug: 記錄是哪一顆
    setLastDraggedBead(`R${rowIndex + 1}B${beadIndex + 1}`);

    let clusterSide: ClusterSide;
    let clusterStart: number;
    let clusterEnd: number;

    if (currentRight === 0) {
      // 全在左邊：點到哪顆，就從那顆一路到最右
      clusterSide = "left";
      clusterStart = beadIndex;
      clusterEnd = beadsPerRow - 1;
    } else if (currentRight === beadsPerRow) {
      // 全在右邊：點到哪顆，就從最左一路到那顆
      clusterSide = "right";
      clusterStart = 0;
      clusterEnd = beadIndex;
    } else if (beadIndex < firstRightIndex) {
      // 有部分在右邊，點到左區：這顆 ~ 左區最右
      clusterSide = "left";
      clusterStart = beadIndex;
      clusterEnd = firstRightIndex - 1;
    } else {
      // 點到右區：右區最左 ~ 這顆
      clusterSide = "right";
      clusterStart = firstRightIndex;
      clusterEnd = beadIndex;
    }

    const clusterSize = clusterEnd - clusterStart + 1;

    setDragState({
      rowIndex,
      pointerId: e.pointerId,
      pointerType: e.pointerType || "mouse",
      startX: e.clientX,
      rowWidth: rect.width || 1,
      startRightCount: currentRight,
      clusterSide,
      clusterSize,
      clusterStartIndex: clusterStart,
      clusterEndIndex: clusterEnd,
      moved: false,
    });

    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handleTrackPointerMove = (
    e: React.PointerEvent<HTMLDivElement>,
    rowIndex: number
  ) => {
    if (!dragState) return;
    if (dragState.pointerId !== e.pointerId) return;
    if (dragState.rowIndex !== rowIndex) return;

    // mouse / pen 用 buttons 判斷，touch 不檢查（iPad buttons 常為 0）
    if (
      (dragState.pointerType === "mouse" ||
        dragState.pointerType === "pen") &&
      !(e.buttons & 1)
    ) {
      return;
    }

    e.preventDefault();

    const deltaX = e.clientX - dragState.startX;

    // 依 pointer 類型調整門檻：觸控再更敏感
    const ratio =
      dragState.pointerType === "touch" ? 0.01 : 0.08; // touch 約 1%，mouse 約 8%
    const baseThreshold = dragState.rowWidth * ratio;
    const threshold = Math.max(
      dragState.pointerType === "touch" ? 3 : 10,
      baseThreshold
    );

    // 同一次拖曳只處理一次變化
    if (dragState.moved) {
      return;
    }

    if (dragState.clusterSide === "left" && deltaX > threshold) {
      // 把這坨左邊珠子整坨推到右邊
      const newRight =
        dragState.startRightCount + dragState.clusterSize;
      updateRightCount(rowIndex, newRight);
      setDragState({ ...dragState, moved: true });
    } else if (dragState.clusterSide === "right" && deltaX < -threshold) {
      // 把右邊那坨拉回左邊
      const newRight =
        dragState.startRightCount - dragState.clusterSize;
      updateRightCount(rowIndex, newRight);
      setDragState({ ...dragState, moved: true });
    }
  };

  const clearDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState || dragState.pointerId !== e.pointerId) return;

    // 如果在 pointermove 階段還沒成功觸發移動，
    // 在 pointerup 再給一次「超級寬鬆」的判定，避免小滑動被吃掉
    if (!dragState.moved) {
      const deltaX = e.clientX - dragState.startX;

      const miniThreshold = 3; // 大約滑一點點就算
      if (dragState.clusterSide === "left" && deltaX > miniThreshold) {
        const newRight =
          dragState.startRightCount + dragState.clusterSize;
        updateRightCount(dragState.rowIndex, newRight);
      } else if (
        dragState.clusterSide === "right" &&
        deltaX < -miniThreshold
      ) {
        const newRight =
          dragState.startRightCount - dragState.clusterSize;
        updateRightCount(dragState.rowIndex, newRight);
      }
    }

    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    setDragState(null);
  };

  const total = rightCounts.reduce((sum, v) => sum + v, 0);

  return (
    <div className="abacus-board">
      {rightCounts.map((rightCount, rowIndex) => {
        const firstRightIndex = beadsPerRow - rightCount;

        return (
          <div
            key={rowIndex}
            className={`abacus-row abacus-row-color-${rowIndex % 8}`}
          >
            <div
              className="abacus-row-track"
              onPointerDown={(e) => handleTrackPointerDown(e, rowIndex)}
              onPointerMove={(e) => handleTrackPointerMove(e, rowIndex)}
              onPointerUp={clearDrag}
              onPointerCancel={clearDrag}
              onPointerLeave={clearDrag}
            >
              <div className="abacus-row-line" />
              <div className="abacus-row-beads">
                {Array.from({ length: beadsPerRow }, (_, beadIndex) => {
                  const isRight = beadIndex >= firstRightIndex;

                  const isActiveCluster =
                    !!dragState &&
                    dragState.rowIndex === rowIndex &&
                    beadIndex >= dragState.clusterStartIndex &&
                    beadIndex <= dragState.clusterEndIndex;

                  let beadClass = "abacus-bead";
                  if (isRight) beadClass += " abacus-bead--right";
                  if (isActiveCluster) beadClass += " abacus-bead--active";

                  return (
                    <div
                      key={beadIndex}
                      className={beadClass}
                      data-bead-index={beadIndex}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      <div className="abacus-total-label">
        算盤現在是：<strong>{total}</strong>
        {lastDraggedBead && (
          <span style={{ marginLeft: 12 }}>
            （剛剛拉動：<strong>{lastDraggedBead}</strong>）
          </span>
        )}
      </div>
    </div>
  );
};