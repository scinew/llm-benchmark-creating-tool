"use client";

import { useState } from "react";

interface RunFormProps {
  projectId: string;
  availableModels: string[];
  initialConfig?: Record<string, unknown>;
  onRunCreated?: () => void;
}

export function RunForm({
  projectId,
  availableModels,
  initialConfig,
  onRunCreated,
}: RunFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const selectAll = () => {
    setSelectedModels(availableModels);
  };

  const clearSelection = () => {
    setSelectedModels([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || `Run ${new Date().toLocaleDateString()}`,
          config: initialConfig || {},
          selectedModels,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create run");
      }

      onRunCreated?.();
      setName("");
      setSelectedModels([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="runName"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Run Name (optional)
        </label>
        <input
          type="text"
          id="runName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Run ${new Date().toLocaleDateString()}`}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:ring-2 focus:ring-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Select Models *
          </label>
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={selectAll}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Select All
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-2 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900">
          {availableModels.map((model) => (
            <label
              key={model}
              className={`flex cursor-pointer items-center gap-2 rounded p-2 transition-colors ${
                selectedModels.includes(model)
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedModels.includes(model)}
                onChange={() => toggleModel(model)}
                className="sr-only"
              />
              <span className="truncate text-sm">{model}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {selectedModels.length} model(s) selected
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || selectedModels.length === 0}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "Creating..."
          : `Run Benchmark (${selectedModels.length} models)`}
      </button>
    </form>
  );
}
