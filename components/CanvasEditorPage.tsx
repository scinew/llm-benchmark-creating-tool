"use client";

import { useState, useCallback, useMemo } from "react";
import CanvasEditor, { CanvasElement } from "./CanvasEditor";
import LayersPanel from "./LayersPanel";
import InspectorPanel from "./InspectorPanel";
import EditorToolbar from "./EditorToolbar";

export default function CanvasEditorPage() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTool, setActiveTool] = useState<"select" | "rectangle" | "text">("select");
  const [showGrid, setShowGrid] = useState(true);

  const saveToHistory = useCallback(
    (newElements: CanvasElement[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const handleElementChange = useCallback(
    (newElements: CanvasElement[]) => {
      setElements(newElements);
      saveToHistory(newElements);
    },
    [saveToHistory]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      setSelectedId(null);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      setSelectedId(null);
    }
  }, [history, historyIndex]);

  const addElement = useCallback(
    (type: "rectangle" | "text", props: Partial<CanvasElement> = {}) => {
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

  const addRectangle = useCallback(() => {
    addElement("rectangle");
  }, [addElement]);

  const addText = useCallback(() => {
    addElement("text");
  }, [addElement]);

  const updateElement = useCallback(
    (updatedElement: CanvasElement) => {
      const newElements = elements.map((el) =>
        el.id === updatedElement.id ? updatedElement : el
      );
      handleElementChange(newElements);
    },
    [elements, handleElementChange]
  );

  const deleteElement = useCallback(
    (id: string) => {
      const newElements = elements.filter((el) => el.id !== id);
      handleElementChange(newElements);
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [elements, selectedId, handleElementChange]
  );

  const toggleElement = useCallback(
    (id: string) => {
      const newElements = elements.map((el) =>
        el.id === id ? { ...el, visible: !el.visible } : el
      );
      handleElementChange(newElements);
    },
    [elements, handleElementChange]
  );

  const reorderElement = useCallback(
    (id: string, newIndex: number) => {
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

  const handleExport = useCallback(() => {
    const exportData = {
      elements: elements.map(({ id, ...element }) => element),
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

  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedId) || null,
    [elements, selectedId]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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

      <div className="flex-1 flex overflow-hidden p-4">
        <div className="w-64 flex-shrink-0 mr-4">
          <LayersPanel
            elements={elements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggle={toggleElement}
            onDelete={deleteElement}
            onReorder={reorderElement}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
          />
        </div>

        <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-md p-4 overflow-auto">
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

        <div className="w-80 flex-shrink-0 ml-4">
          <InspectorPanel
            selectedElement={selectedElement}
            onUpdate={updateElement}
          />
        </div>
      </div>
    </div>
  );
}