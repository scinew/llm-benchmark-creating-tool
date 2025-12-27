"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layer, Rect, Stage, Text, Transformer } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import type {
  Box,
  Transformer as KonvaTransformer,
} from "konva/lib/shapes/Transformer";

export interface CanvasElement {
  id: string;
  type: "rectangle" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  visible: boolean;
  zIndex: number;
}

interface CanvasEditorProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (elements: CanvasElement[]) => void;
  gridSize?: number;
  showGrid?: boolean;
}

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;
const MIN_ELEMENT_SIZE = 20;

export default function CanvasEditor({
  elements,
  selectedId,
  onSelect,
  onChange,
  gridSize = 20,
  showGrid = true,
}: CanvasEditorProps) {
  const stageRef = useRef<KonvaStage | null>(null);
  const transformerRef = useRef<KonvaTransformer | null>(null);

  const [stageScale, setStageScale] = useState<number>(1);
  const [stagePos, setStagePos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const selectedElement = useMemo(() => {
    if (!selectedId) return null;
    return elements.find((el) => el.id === selectedId) ?? null;
  }, [elements, selectedId]);

  useEffect((): void => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;

    if (!stage || !transformer) return;

    if (!selectedId) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    const selectedNode = stage.findOne(`#${selectedId}`);

    transformer.nodes(selectedNode ? [selectedNode] : []);
    transformer.getLayer()?.batchDraw();
  }, [elements, selectedId]);

  const boundBoxFunc = useCallback((oldBox: Box, newBox: Box): Box => {
    if (newBox.width < MIN_ELEMENT_SIZE || newBox.height < MIN_ELEMENT_SIZE) {
      return oldBox;
    }

    return newBox;
  }, []);

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>): void => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const delta = e.evt.deltaY > 0 ? 0.95 : 1.05;
    const newScale = Math.max(0.1, Math.min(5, oldScale * delta));

    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, []);

  const handleElementClick = useCallback(
    (e: KonvaEventObject<MouseEvent>, elementId: string): void => {
      e.cancelBubble = true;
      onSelect(elementId);
    },
    [onSelect]
  );

  const handleStageClick = useCallback((): void => {
    onSelect(null);
  }, [onSelect]);

  const handleDragEnd = useCallback(
    (elementId: string, newPos: { x: number; y: number }): void => {
      const updatedElements = elements.map((el) => {
        if (el.id !== elementId) return el;

        const snappedPos = showGrid
          ? {
              x: Math.round(newPos.x / gridSize) * gridSize,
              y: Math.round(newPos.y / gridSize) * gridSize,
            }
          : newPos;

        return { ...el, ...snappedPos };
      });

      onChange(updatedElements);
    },
    [elements, gridSize, showGrid, onChange]
  );

  const handleTransformEnd = useCallback((): void => {
    const transformer = transformerRef.current;
    if (!transformer || !selectedId) return;

    const node = transformer.nodes()[0];
    if (!node) return;

    const updatedElements = elements.map((el) => {
      if (el.id !== selectedId) return el;

      return {
        ...el,
        x: node.x(),
        y: node.y(),
        width: Math.max(MIN_ELEMENT_SIZE, node.width() * node.scaleX()),
        height: Math.max(MIN_ELEMENT_SIZE, node.height() * node.scaleY()),
      };
    });

    node.scaleX(1);
    node.scaleY(1);

    onChange(updatedElements);
  }, [elements, selectedId, onChange]);

  const verticalLineIndices = useMemo(() => {
    const count = Math.ceil(STAGE_WIDTH / gridSize) + 1;
    return [...Array(count).keys()];
  }, [gridSize]);

  const horizontalLineIndices = useMemo(() => {
    const count = Math.ceil(STAGE_HEIGHT / gridSize) + 1;
    return [...Array(count).keys()];
  }, [gridSize]);

  return (
    <div className="relative h-full w-full bg-gray-100 dark:bg-zinc-800">
      <Stage
        ref={stageRef}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        className="border border-gray-300 dark:border-zinc-600"
      >
        <Layer>
          {showGrid && (
            <>
              {verticalLineIndices.map((i) => (
                <Rect
                  key={`v-${i}`}
                  x={i * gridSize}
                  y={0}
                  width={1}
                  height={STAGE_HEIGHT}
                  fill="#e5e7eb"
                />
              ))}
              {horizontalLineIndices.map((i) => (
                <Rect
                  key={`h-${i}`}
                  x={0}
                  y={i * gridSize}
                  width={STAGE_WIDTH}
                  height={1}
                  fill="#e5e7eb"
                />
              ))}
            </>
          )}

          {elements
            .filter((el) => el.visible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => {
              const isSelected = element.id === selectedId;
              const commonProps = {
                id: element.id,
                x: element.x,
                y: element.y,
                draggable: true,
                onClick: (e: KonvaEventObject<MouseEvent>) =>
                  handleElementClick(e, element.id),
                onDragEnd: (e: KonvaEventObject<DragEvent>) =>
                  handleDragEnd(element.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  }),
              };

              if (element.type === "rectangle") {
                return (
                  <Rect
                    key={element.id}
                    {...commonProps}
                    width={element.width}
                    height={element.height}
                    fill={element.fill ?? "#3b82f6"}
                    stroke={isSelected ? "#1e40af" : "#1e3a8a"}
                    strokeWidth={isSelected ? 3 : 1}
                  />
                );
              }

              if (element.type === "text") {
                return (
                  <Text
                    key={element.id}
                    {...commonProps}
                    text={element.text ?? "Text"}
                    fontSize={element.fontSize ?? 16}
                    fill={element.fill ?? "#000000"}
                    width={element.width}
                  />
                );
              }

              return null;
            })}

          {selectedElement && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={boundBoxFunc}
              onTransformEnd={handleTransformEnd}
            />
          )}
        </Layer>
      </Stage>

      <div className="absolute top-4 right-4 flex gap-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
        <button
          type="button"
          className="rounded bg-blue-500 px-3 py-1 text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          onClick={() => setStageScale(Math.min(5, stageScale * 1.2))}
        >
          Zoom In
        </button>
        <button
          type="button"
          className="rounded bg-blue-500 px-3 py-1 text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          onClick={() => setStageScale(Math.max(0.1, stageScale * 0.8))}
        >
          Zoom Out
        </button>
        <button
          type="button"
          className="rounded bg-gray-500 px-3 py-1 text-white transition-colors hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
          onClick={() => {
            setStageScale(1);
            setStagePos({ x: 0, y: 0 });
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
