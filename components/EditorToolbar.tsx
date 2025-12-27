"use client";

type ToolId = "select" | "rectangle" | "text";

interface EditorToolbarProps {
  activeTool: ToolId;
  onToolChange: (tool: ToolId) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddText: () => void;
  onAddRectangle: () => void;
}

interface ToolButton {
  id: ToolId;
  icon: string;
  label: string;
  action: () => void;
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
  const tools: ToolButton[] = [
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
    <div className="border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={tool.action}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors ${
                activeTool === tool.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title={tool.label}
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="hidden text-sm font-medium sm:inline">
                {tool.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors ${
              canUndo
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "cursor-not-allowed bg-gray-50 text-gray-400"
            }`}
            title="Undo"
          >
            <span className="text-lg">↶</span>
            <span className="hidden text-sm font-medium sm:inline">Undo</span>
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors ${
              canRedo
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "cursor-not-allowed bg-gray-50 text-gray-400"
            }`}
            title="Redo"
          >
            <span className="text-lg">↷</span>
            <span className="hidden text-sm font-medium sm:inline">Redo</span>
          </button>

          <button
            type="button"
            onClick={onExport}
            className="flex items-center space-x-2 rounded-lg bg-green-500 px-3 py-2 text-white transition-colors hover:bg-green-600"
            title="Export"
          >
            <span className="text-lg">⬇</span>
            <span className="hidden text-sm font-medium sm:inline">Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}
