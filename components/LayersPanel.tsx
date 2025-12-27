"use client";

import { useCallback, useMemo } from "react";
import type { DragEvent } from "react";
import type { CanvasElement } from "./CanvasEditor";

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, newIndex: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export default function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onToggle,
  onDelete,
  onReorder,
  showGrid,
  onToggleGrid,
}: LayersPanelProps) {
  const handleDragStart = useCallback(
    (e: DragEvent<HTMLElement>, elementId: string): void => {
      e.dataTransfer.setData("text/plain", elementId);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>, targetId: string): void => {
      e.preventDefault();

      const draggedId = e.dataTransfer.getData("text/plain");
      if (!draggedId || draggedId === targetId) return;

      const draggedIndex = elements.findIndex((el) => el.id === draggedId);
      const targetIndex = elements.findIndex((el) => el.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      onReorder(draggedId, targetIndex);
    },
    [elements, onReorder]
  );

  const moveElement = useCallback(
    (id: string, direction: "up" | "down"): void => {
      const currentIndex = elements.findIndex((el) => el.id === id);
      if (currentIndex === -1) return;

      if (direction === "up" && currentIndex < elements.length - 1) {
        onReorder(id, currentIndex + 1);
        return;
      }

      if (direction === "down" && currentIndex > 0) {
        onReorder(id, currentIndex - 1);
      }
    },
    [elements, onReorder]
  );

  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => b.zIndex - a.zIndex);
  }, [elements]);

  return (
    <div className="flex h-full flex-col rounded-lg bg-white shadow-md">
      <div className="border-b px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-800">Layers</h3>
      </div>

      <div className="border-b bg-gray-50 p-3">
        <label className="flex cursor-pointer items-center space-x-2">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={onToggleGrid}
            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show Grid</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {elements.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No layers yet. Add elements using the toolbar.
          </div>
        ) : (
          <div className="space-y-1">
            {sortedElements.map((element) => (
              <LayerItem
                key={element.id}
                element={element}
                isSelected={element.id === selectedId}
                onSelect={() => onSelect(element.id)}
                onToggle={() => onToggle(element.id)}
                onDelete={() => onDelete(element.id)}
                onMoveUp={() => moveElement(element.id, "up")}
                onMoveDown={() => moveElement(element.id, "down")}
                draggable
                onDragStart={(e) => handleDragStart(e, element.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, element.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LayerItemProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLElement>) => void;
  onDragOver?: (e: DragEvent<HTMLElement>) => void;
  onDrop?: (e: DragEvent<HTMLElement>) => void;
}

function LayerItem({
  element,
  isSelected,
  onSelect,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: LayerItemProps) {
  const layerPreview = getLayerPreview(element);
  const label =
    element.type === "text"
      ? (element.text ?? "Text")
      : `${element.type} ${element.id.slice(0, 4)}`;

  return (
    <div
      className={`group flex cursor-pointer items-center justify-between rounded p-2 transition-colors ${
        isSelected ? "bg-blue-100" : "hover:bg-gray-100"
      }`}
      onClick={onSelect}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex min-w-0 flex-1 items-center space-x-2">
        <button
          type="button"
          className="cursor-move rounded p-1 hover:bg-gray-200"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          ⋮⋮
        </button>

        <button
          type="button"
          className="rounded p-1 hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {element.visible ? "👁️" : "🚫"}
        </button>

        <div className="opacity-50 transition-opacity group-hover:opacity-100">
          {layerPreview}
        </div>

        <span className="truncate text-sm text-gray-800">{label}</span>
      </div>

      <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          className="rounded p-1 hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
        >
          ▲
        </button>
        <button
          type="button"
          className="rounded p-1 hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
        >
          ▼
        </button>
        <button
          type="button"
          className="rounded p-1 text-red-600 hover:bg-red-200"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function getLayerPreview(element: CanvasElement) {
  if (element.type === "rectangle") {
    return (
      <div
        className="h-4 w-4 rounded"
        style={{ backgroundColor: element.fill ?? "#3b82f6" }}
      />
    );
  }

  if (element.type === "text") {
    return (
      <div
        className="text-xs font-medium"
        style={{ color: element.fill ?? "#000000" }}
      >
        T
      </div>
    );
  }

  return null;
}
