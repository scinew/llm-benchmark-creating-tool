"use client";

import { useCallback, useMemo, useState } from "react";
import CanvasEditor, { type CanvasElement } from "./CanvasEditor";
import EditorToolbar from "./EditorToolbar";
import InspectorPanel from "./InspectorPanel";
import LayersPanel from "./LayersPanel";

type ToolId = "select" | "rectangle" | "text";

export default function CanvasEditorPage() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [activeTool, setActiveTool] = useState<ToolId>("select");
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const saveToHistory = useCallback(
    (newElements: CanvasElement[]): void => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const handleElementChange = useCallback(
    (newElements: CanvasElement[]): void => {
      setElements(newElements);
      saveToHistory(newElements);
    },
    [saveToHistory]
  );

  const handleUndo = useCallback((): void => {
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setElements(history[newIndex] ?? []);
    setSelectedId(null);
  }, [history, historyIndex]);

  const handleRedo = useCallback((): void => {
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setElements(history[newIndex] ?? []);
    setSelectedId(null);
  }, [history, historyIndex]);

  const addElement = useCallback(
    (type: CanvasElement["type"], props: Partial<CanvasElement> = {}): void => {
      const newElement: CanvasElement = {
        id: `element-${Date.now()}`,
        type,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 150,
        width: type === "text" ? 150 : 120,
        height: type === "text" ? 30 : 80,
        fill: type === "text" ? "#000000" : "#3b82f6",
        text: type === "text" ? "New Text" : undefined,
        fontSize: type === "text" ? 16 : undefined,
        visible: true,
        zIndex: elements.length,
        ...props,
      };

      const newElements = [...elements, newElement];

      handleElementChange(newElements);
      setSelectedId(newElement.id);
      setActiveTool("select");
    },
    [elements, handleElementChange]
  );

  const addRectangle = useCallback((): void => {
    addElement("rectangle");
  }, [addElement]);

  const addText = useCallback((): void => {
    addElement("text");
  }, [addElement]);

  const updateElement = useCallback(
    (updatedElement: CanvasElement): void => {
      const newElements = elements.map((el) =>
        el.id === updatedElement.id ? updatedElement : el
      );
      handleElementChange(newElements);
    },
    [elements, handleElementChange]
  );

  const deleteElement = useCallback(
    (id: string): void => {
      const newElements = elements.filter((el) => el.id !== id);
      handleElementChange(newElements);

      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [elements, selectedId, handleElementChange]
  );

  const toggleElement = useCallback(
    (id: string): void => {
      const newElements = elements.map((el) =>
        el.id === id ? { ...el, visible: !el.visible } : el
      );
      handleElementChange(newElements);
    },
    [elements, handleElementChange]
  );

  const reorderElement = useCallback(
    (id: string, newIndex: number): void => {
      const element = elements.find((el) => el.id === id);
      if (!element) return;

      const otherElements = elements.filter((el) => el.id !== id);
      const updatedElements = [
        ...otherElements.slice(0, newIndex),
        element,
        ...otherElements.slice(newIndex),
      ].map((el, index) => ({ ...el, zIndex: index }));

      handleElementChange(updatedElements);
    },
    [elements, handleElementChange]
  );

  const handleExport = useCallback((): void => {
    const exportData = {
      elements,
      version: "1.0",
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `benchmark-design-${Date.now()}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }, [elements]);

  const selectedElement = useMemo(() => {
    return elements.find((el) => el.id === selectedId) ?? null;
  }, [elements, selectedId]);

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <EditorToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onAddText={addText}
        onAddRectangle={addRectangle}
      />

      <div className="flex flex-1 overflow-hidden p-4">
        <div className="mr-4 w-64 flex-shrink-0">
          <LayersPanel
            elements={elements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggle={toggleElement}
            onDelete={deleteElement}
            onReorder={reorderElement}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid((prev) => !prev)}
          />
        </div>

        <div className="flex flex-1 items-center justify-center overflow-auto rounded-lg bg-white p-4 shadow-md">
          <div className="relative">
            <CanvasEditor
              elements={elements}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={handleElementChange}
              showGrid={showGrid}
            />
          </div>
        </div>

        <div className="ml-4 w-80 flex-shrink-0">
          <InspectorPanel
            selectedElement={selectedElement}
            onUpdate={updateElement}
          />
        </div>
      </div>
    </div>
  );
}
