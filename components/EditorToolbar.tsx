"use client";

interface EditorToolbarProps {
  activeTool: "select" | "rectangle" | "text";
  onToolChange: (tool: "select" | "rectangle" | "text") => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddText: () => void;
  onAddRectangle: () => void;
}

export default function EditorToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onExport,
  canUndo,
  canRedo,
  onAddText,
  onAddRectangle,
}: EditorToolbarProps) {
  const tools = [
    {
      id: "select",
      icon: "↖",
      label: "Select",
      action: () => onToolChange("select"),
    },
    {
      id: "rectangle",
      icon: "▢",
      label: "Rectangle",
      action: onAddRectangle,
    },
    {
      id: "text",
      icon: "T",
      label: "Text",
      action: onAddText,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={tool.action}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                activeTool === tool.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title={tool.label}
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="text-sm font-medium hidden sm:inline">
                {tool.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              canUndo
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
            title="Undo"
          >
            <span className="text-lg">↶</span>
            <span className="text-sm font-medium hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              canRedo
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
            title="Redo"
          >
            <span className="text-lg">↷</span>
            <span className="text-sm font-medium hidden sm:inline">Redo</span>
          </button>

          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            title="Export"
          >
            <span className="text-lg">⬇</span>
            <span className="text-sm font-medium hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}