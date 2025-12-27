"use client";

import { CanvasElement } from "./CanvasEditor";

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
  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    e.dataTransfer.setData("text/plain", elementId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== targetId) {
      const draggedIndex = elements.findIndex((el) => el.id === draggedId);
      const targetIndex = elements.findIndex((el) => el.id === targetId);
      if (draggedIndex !== -1 && targetIndex !== -1) {
        onReorder(draggedId, targetIndex);
      }
    }
  };

  const moveElement = (id: string, direction: "up" | "down") => {
    const currentIndex = elements.findIndex((el) => el.id === id);
    if (currentIndex === -1) return;

    if (direction === "up" && currentIndex < elements.length - 1) {
      onReorder(id, currentIndex + 1);
    } else if (direction === "down" && currentIndex > 0) {
      onReorder(id, currentIndex - 1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md">
      <div className="px-4 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Layers</h3>
      </div>
      
      <div className="p-3 border-b bg-gray-50">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={onToggleGrid}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show Grid</span>
        </label>
      </div>


              {elements.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500">
                  No layers yet. Add elements using the toolbar.
            </div>
              ) : (
        <div className="space-y-1 px-2">
            {[...elements]
                    .sort((a, b) => b.zIndex - a.zIndex)
          .map((element) => (
        <LayerItem
                      key={element.id}
                element={element}
            isSelected={element.id === selectedId}
            onSelect={() => onSelect(element.id)}
                    onToggle={() => onToggle(element.id)}
            onDelete={() => onDelete(element.id)}
            onMoveUp={() => moveElement(element.id, "up")}
              onMoveDown={() => moveElement(element.id, "down")}
                draggable={true}
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
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
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
  const getLayerPreview = () => {
    if (element.type === "rectangle") {
      return (
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: element.fill || "#3b82f6" }}
        />
      );
    }
    if (element.type === "text") {
      return (
        <div
          className="text-xs font-medium"
          style={{ color: element.fill || "#000000" }}
        >
          T
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
        isSelected ? "bg-blue-100" : "hover:bg-gray-100"
      }`}
      onClick={(e) => {
        if (!e.defaultPrevented) onSelect();
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <button
          className="p-1 hover:bg-gray-200 rounded cursor-move"
          onMouseDown={(e) => e.stopPropagation()}
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            if (onDragStart) onDragStart(e);
          }}
        >
          ⋮⋮
        </button>
        
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {element.visible ? "👁️" : "🚫"}
        </button>
        
        <div className="opacity-50 group-hover:opacity-100">{getLayerPreview()}</div>
        
        <span className="text-sm text-gray-800 truncate">
          {element.type === "text" ? element.text || "Text" : `${element.type} ${element.id.slice(0, 4)}`}
        </span>
      </div>
      
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
        >
          ▲
        </button>
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
        >
          ▼
        </button>
        <button
          className="p-1 hover:bg-red-200 rounded text-red-600"
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