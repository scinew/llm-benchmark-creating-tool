"use client";

import { CanvasElement } from "./CanvasEditor";

interface InspectorPanelProps {
  selectedElement: CanvasElement | null;
  onUpdate: (element: CanvasElement) => void;
}

export default function InspectorPanel({ selectedElement, onUpdate }: InspectorPanelProps) {
  const handleChange = (field: string, value: string) => {
    if (!selectedElement) return;
    
    const updatedElement = { ...selectedElement };
    
    switch (field) {
      case "x":
        updatedElement.x = parseInt(value) || 0;
        break;
      case "y":
        updatedElement.y = parseInt(value) || 0;
        break;
      case "width":
        updatedElement.width = Math.max(20, parseInt(value) || 20);
        break;
      case "height":
        updatedElement.height = Math.max(20, parseInt(value) || 20);
        break;
      case "fill":
        updatedElement.fill = value;
        setColorText(value);
        break;
      case "text":
        updatedElement.text = value;
        break;
      case "fontSize":
        updatedElement.fontSize = Math.max(8, parseInt(value) || 8);
        break;
    }
    
    onUpdate(updatedElement);
  };

  if (!selectedElement) {
    return (
      <div className="h-full bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Properties</h3>
        <div className="text-gray-500 text-center py-8">
          Select an element to view properties
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-lg shadow-md">
      <div className="px-4 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
      </div>
      
      <div className="p-4 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <div className="text-sm text-gray-900 capitalize bg-gray-50 p-2 rounded">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="width" className="text-sm font-medium text-gray-700">
              Width
            </label>
            <input
              id="width"
              type="number"
              value={selectedElement.width}
              onChange={(e) => handleChange("width", e.target.value)}
              min="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="height" className="text-sm font-medium text-gray-700">
              Height
            </label>
            <input
              id="height"
              type="number"
              value={selectedElement.height}
              onChange={(e) => handleChange("height", e.target.value)}
              min="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {selectedElement.type === "text" && (
          <>
            <div className="space-y-2">
              <label htmlFor="text" className="text-sm font-medium text-gray-700">
                Text Content
              </label>
              <textarea
               id="text"
               value={selectedElement.text || ""}
               onChange={(e) => handleChange("text", e.target.value)}
               rows={2}
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>

              <div className="space-y-2">
              <label htmlFor="fontSize" className="text-sm font-medium text-gray-700">
               Font Size
              </label>
              <input
               id="fontSize"
               type="number"
               value={selectedElement.fontSize || 16}
               onChange={(e) => handleChange("fontSize", e.target.value)}
               min="8"
               max="100"
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              value={selectedElement.fill || "#3b82f6"}
              onChange={(e) => handleChange("fill", e.target.value)}
              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
              type="text"
              value={selectedElement.fill || "#3b82f6"}
              onChange={(e) => handleChange("fill", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
        </div>

        {selectedElement.type === "rectangle" && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-md">
            <div className="text-sm font-medium text-gray-700">Appearance</div>
            <div className="text-xs text-gray-600 grid grid-cols-2 gap-1">
              <div>Width: {selectedElement.width}px</div>
              <div>Height: {selectedElement.height}px</div>
              <div>Position: ({selectedElement.x}, {selectedElement.y})</div>
              <div>Layer: #{selectedElement.zIndex + 1}</div>
            </div>
          </div>
        )}

        {selectedElement.type === "text" && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-md">
            <div className="text-sm font-medium text-gray-700">Typography</div>
            <div className="text-xs text-gray-600 grid grid-cols-2 gap-1">
              <div>Size: {selectedElement.fontSize}px</div>
              <div>Position: ({selectedElement.x}, {selectedElement.y})</div>
              <div className="col-span-2">✎ {selectedElement.text?.substring(0, 20)}{selectedElement.text && selectedElement.text?.length > 20 ? "..." : ""}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}