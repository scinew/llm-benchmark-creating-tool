"use client";

import { useState } from "react";

export interface BenchmarkConfig {
  promptTemplate: string;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput?: string;
  }>;
  evaluationCriteria: Array<{
    id: string;
    name: string;
    weight: number;
    description: string;
  }>;
  selectedProviders: string[];
}

interface BenchmarkConfigFormProps {
  initialConfig?: Partial<BenchmarkConfig>;
  onSave: (config: BenchmarkConfig) => Promise<void>;
  availableProviders?: string[];
}

const defaultConfig: BenchmarkConfig = {
  promptTemplate: "You are a helpful AI assistant. {input}",
  testCases: [
    { id: "1", input: "What is 2+2?", expectedOutput: "4" },
    {
      id: "2",
      input: "What is the capital of France?",
      expectedOutput: "Paris",
    },
  ],
  evaluationCriteria: [
    {
      id: "1",
      name: "Accuracy",
      weight: 1.0,
      description: "How correct is the response?",
    },
  ],
  selectedProviders: [],
};

export function BenchmarkConfigForm({
  initialConfig,
  onSave,
  availableProviders = ["openai", "anthropic", "google"],
}: BenchmarkConfigFormProps) {
  const [config, setConfig] = useState<BenchmarkConfig>({
    ...defaultConfig,
    ...initialConfig,
    testCases: initialConfig?.testCases || defaultConfig.testCases,
    evaluationCriteria:
      initialConfig?.evaluationCriteria || defaultConfig.evaluationCriteria,
  });
  const [isSaving, setIsSaving] = useState(false);

  const addTestCase = () => {
    setConfig((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { id: crypto.randomUUID(), input: "", expectedOutput: "" },
      ],
    }));
  };

  const removeTestCase = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((tc) => tc.id !== id),
    }));
  };

  const updateTestCase = (
    id: string,
    field: "input" | "expectedOutput",
    value: string
  ) => {
    setConfig((prev) => ({
      ...prev,
      testCases: prev.testCases.map((tc) =>
        tc.id === id ? { ...tc, [field]: value } : tc
      ),
    }));
  };

  const addCriterion = () => {
    setConfig((prev) => ({
      ...prev,
      evaluationCriteria: [
        ...prev.evaluationCriteria,
        { id: crypto.randomUUID(), name: "", weight: 1.0, description: "" },
      ],
    }));
  };

  const removeCriterion = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.filter((ec) => ec.id !== id),
    }));
  };

  const updateCriterion = (
    id: string,
    field: "name" | "weight" | "description",
    value: string | number
  ) => {
    setConfig((prev) => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.map((ec) =>
        ec.id === id ? { ...ec, [field]: value } : ec
      ),
    }));
  };

  const toggleProvider = (provider: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedProviders: prev.selectedProviders.includes(provider)
        ? prev.selectedProviders.filter((p) => p !== provider)
        : [...prev.selectedProviders, provider],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Providers Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Select Models/Providers
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableProviders.map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => toggleProvider(provider)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                config.selectedProviders.includes(provider)
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {provider}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Template Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Prompt Template
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Use {"{input}"} as a placeholder for the test case input
        </p>
        <textarea
          value={config.promptTemplate}
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, promptTemplate: e.target.value }))
          }
          rows={3}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="You are a helpful AI assistant. {input}"
        />
      </div>

      {/* Test Cases Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Test Cases
          </h3>
          <button
            type="button"
            onClick={addTestCase}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Add Test Case
          </button>
        </div>
        <div className="space-y-3">
          {config.testCases.map((testCase, index) => (
            <div
              key={testCase.id}
              className="flex items-start gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-zinc-100 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
                {index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={testCase.input}
                  onChange={(e) =>
                    updateTestCase(testCase.id, "input", e.target.value)
                  }
                  placeholder="Test input..."
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:ring-2 focus:ring-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <input
                  type="text"
                  value={testCase.expectedOutput || ""}
                  onChange={(e) =>
                    updateTestCase(
                      testCase.id,
                      "expectedOutput",
                      e.target.value
                    )
                  }
                  placeholder="Expected output (optional)..."
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:ring-2 focus:ring-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTestCase(testCase.id)}
                className="flex-shrink-0 p-1.5 text-zinc-500 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Criteria Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Evaluation Criteria
          </h3>
          <button
            type="button"
            onClick={addCriterion}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Add Criterion
          </button>
        </div>
        <div className="space-y-3">
          {config.evaluationCriteria.map((criterion, index) => (
            <div
              key={criterion.id}
              className="flex items-start gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-zinc-100 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
                {index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) =>
                      updateCriterion(criterion.id, "name", e.target.value)
                    }
                    placeholder="Criterion name..."
                    className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:ring-2 focus:ring-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={criterion.weight}
                    onChange={(e) =>
                      updateCriterion(
                        criterion.id,
                        "weight",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-20 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:ring-2 focus:ring-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    title="Weight (0-1)"
                  />
                </div>
                <input
                  type="text"
                  value={criterion.description}
                  onChange={(e) =>
                    updateCriterion(criterion.id, "description", e.target.value)
                  }
                  placeholder="Description..."
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:ring-2 focus:ring-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <button
                type="button"
                onClick={() => removeCriterion(criterion.id)}
                className="flex-shrink-0 p-1.5 text-zinc-500 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-zinc-900 px-6 py-2.5 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSaving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
