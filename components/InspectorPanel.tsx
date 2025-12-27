"use client";

import type { CanvasElement } from "./CanvasEditor";

interface InspectorPanelProps {
  selectedElement: CanvasElement | null;
  onUpdate: (element: CanvasElement) => void;
}

type EditableField =
  | "x"
  | "y"
  | "width"
  | "height"
  | "fill"
  | "text"
  | "fontSize";

export default function InspectorPanel({
  selectedElement,
  onUpdate,
}: InspectorPanelProps) {
  const handleChange = (field: EditableField, value: string): void => {
    if (!selectedElement) return;

    const updatedElement: CanvasElement = { ...selectedElement };

    switch (field) {
      case "x":
        updatedElement.x = Number.parseInt(value, 10) || 0;
        break;
      case "y":
        updatedElement.y = Number.parseInt(value, 10) || 0;
        break;
      case "width":
        updatedElement.width = Math.max(20, Number.parseInt(value, 10) || 20);
        break;
      case "height":
        updatedElement.height = Math.max(20, Number.parseInt(value, 10) || 20);
        break;
      case "fill":
        updatedElement.fill = value;
        break;
      case "text":
        updatedElement.text = value;
        break;
      case "fontSize":
        updatedElement.fontSize = Math.max(8, Number.parseInt(value, 10) || 8);
        break;
      default:
        break;
    }

    onUpdate(updatedElement);
  };

  if (!selectedElement) {
    return (
      <div className="h-full rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Properties</h3>
        <div className="py-8 text-center text-gray-500">
          Select an element to view properties
        </div>
      </div>
    );
  }

  const textPreview = selectedElement.text ?? "";

  return (
    <div className="h-full rounded-lg bg-white shadow-md">
      <div className="border-b px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
      </div>

      <div className="space-y-4 overflow-y-auto p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <div className="rounded bg-gray-50 p-2 text-sm text-gray-900 capitalize">
            {selectedElement.type}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="x" className="text-sm font-medium text-gray-700">
              X Position
            </label>
            <input
              id="x"
              type="number"
              value={selectedElement.x}
              onChange={(e) => handleChange("x", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="y" className="text-sm font-medium text-gray-700">
              Y Position
            </label>
            <input
              id="y"
              type="number"
              value={selectedElement.y}
              onChange={(e) => handleChange("y", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label
              htmlFor="width"
              className="text-sm font-medium text-gray-700"
            >
              Width
            </label>
            <input
              id="width"
              type="number"
              value={selectedElement.width}
              onChange={(e) => handleChange("width", e.target.value)}
              min={20}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="height"
              className="text-sm font-medium text-gray-700"
            >
              Height
            </label>
            <input
              id="height"
              type="number"
              value={selectedElement.height}
              onChange={(e) => handleChange("height", e.target.value)}
              min={20}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {selectedElement.type === "text" && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="text"
                className="text-sm font-medium text-gray-700"
              >
                Text Content
              </label>
              <textarea
                id="text"
                value={selectedElement.text ?? ""}
                onChange={(e) => handleChange("text", e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="fontSize"
                className="text-sm font-medium text-gray-700"
              >
                Font Size
              </label>
              <input
                id="fontSize"
                type="number"
                value={selectedElement.fontSize ?? 16}
                onChange={(e) => handleChange("fontSize", e.target.value)}
                min={8}
                max={100}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label htmlFor="fill" className="text-sm font-medium text-gray-700">
            {selectedElement.type === "text" ? "Text Color" : "Fill Color"}
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="fill"
              type="color"
              value={selectedElement.fill ?? "#3b82f6"}
              onChange={(e) => handleChange("fill", e.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-gray-300"
            />
            <input
              type="text"
              value={selectedElement.fill ?? "#3b82f6"}
              onChange={(e) => handleChange("fill", e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {selectedElement.type === "rectangle" && (
          <div className="rounded-md bg-gray-50 p-3">
            <div className="text-sm font-medium text-gray-700">Appearance</div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <div>Width: {selectedElement.width}px</div>
              <div>Height: {selectedElement.height}px</div>
              <div>
                Position: ({selectedElement.x}, {selectedElement.y})
              </div>
              <div>Layer: #{selectedElement.zIndex + 1}</div>
            </div>
          </div>
        )}

        {selectedElement.type === "text" && (
          <div className="rounded-md bg-gray-50 p-3">
            <div className="text-sm font-medium text-gray-700">Typography</div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <div>Size: {selectedElement.fontSize ?? 16}px</div>
              <div>
                Position: ({selectedElement.x}, {selectedElement.y})
              </div>
              <div className="col-span-2">
                ✎ {textPreview.substring(0, 20)}
                {textPreview.length > 20 ? "..." : ""}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
