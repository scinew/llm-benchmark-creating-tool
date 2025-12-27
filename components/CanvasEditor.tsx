"use client";

import { useState, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Text, Transformer } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import type { Stage as StageType } from "konva/lib/Stage";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";

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

export default function CanvasEditor({
  elements,
  selectedId,
  onSelect,
  onChange,
  gridSize = 20,
  showGrid = true,
}: CanvasEditorProps) {
  const stageRef = useRef<StageType>(null);
  const transformerRef = useRef<TransformerType | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
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
    (e: KonvaEventObject<MouseEvent>, elementId: string) => {
      e.cancelBubble = true;
      onSelect(elementId);
    },
    [onSelect]
  );

  const handleStageClick = useCallback(() => {
    onSelect(null);
  }, [onSelect]);

  const handleDragMove = useCallback(
    (elementId: string, newPos: { x: number; y: number }) => {
      const updatedElements = elements.map((el) => {
        if (el.id === elementId) {
          const snappedPos = showGrid
            ? {
                x: Math.round(newPos.x / gridSize) * gridSize,
                y: Math.round(newPos.y / gridSize) * gridSize,
              }
            : newPos;
          return { ...el, ...snappedPos };
        }
        return el;
      });
      onChange(updatedElements);
    },
    [elements, gridSize, showGrid, onChange]
  );

  const handleTransform = useCallback(() => {
    const transformer = transformerRef.current;
    if (!transformer || !selectedId) return;

    const node = transformer.nodes()[0];
    if (!node) return;

    const updatedElements = elements.map((el) => {
      if (el.id === selectedId) {
        return {
          ...el,
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * node.scaleX()),
          height: Math.max(20, node.height() * node.scaleY()),
        };
      }
      return el;
    });

    node.scaleX(1);
    node.scaleY(1);
    onChange(updatedElements);
  }, [elements, selectedId, onChange]);

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <div className="relative w-full h-full bg-gray-100 dark:bg-zinc-800">
      <Stage
        ref={stageRef}
        width={800}
        height={600}
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
              {Array.from({
                length: Math.ceil(800 / gridSize) + 1,
              }).map((_, i) => (
                <Rect
                  key={`v-${i}`}
                  x={i * gridSize}
                  y={0}
                  width={1}
                  height={600}
                  fill="#e5e7eb"
                />
              ))}
              {Array.from({
                length: Math.ceil(600 / gridSize) + 1,
              }).map((_, i) => (
                <Rect
                  key={`h-${i}`}
                  x={0}
                  y={i * gridSize}
                  width={800}
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
                onDragMove: (e: KonvaEventObject<DragEvent>) =>
                  handleDragMove(element.id, {
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
                    fill={element.fill || "#3b82f6"}
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
                    text={element.text || "Text"}
                    fontSize={element.fontSize || 16}
                    fill={element.fill || "#000000"}
                    width={element.width}
                  />
                );
              }

              return null;
            })}

          {selectedElement && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox: { width: number; height: number; x: number; y: number }, 
                           newBox: { width: number; height: number; x: number; y: number }) => {
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}
              onTransform={handleTransform}
            />
          )}
        </Layer>
      </Stage>

      <div className="absolute top-4 right-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-2 flex gap-2 border border-zinc-200 dark:border-zinc-700">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
          onClick={() => setStageScale(Math.min(5, stageScale * 1.2))}
        >
          Zoom In
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
          onClick={() => setStageScale(Math.max(0.1, stageScale * 0.8))}
        >
          Zoom Out
        </button>
        <button
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors dark:bg-gray-600 dark:hover:bg-gray-700"
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