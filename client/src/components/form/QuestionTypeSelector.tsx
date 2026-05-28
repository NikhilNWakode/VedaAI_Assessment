"use client";

import { useFormStore, type QuestionTypeRow } from "@/store/formStore";
import { QUESTION_TYPE_LABELS, type QuestionType } from "@/types";
import { Plus, X, Minus } from "lucide-react";

const allTypes: QuestionType[] = ["mcq", "short_answer", "long_answer", "true_false"];

function CounterControl({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="counter-btn"
        disabled={value <= min}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-8 text-center text-sm font-semibold text-gray-800">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="counter-btn"
        disabled={value >= max}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

export function QuestionTypeSelector() {
  const { questionTypeRows, addQuestionTypeRow, removeQuestionTypeRow, updateQuestionTypeRow } =
    useFormStore();

  const usedTypes = questionTypeRows.map((r) => r.type);
  const canAdd = usedTypes.length < allTypes.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-800">
          Question Types
        </label>
      </div>

      {/* Column headers */}
      {questionTypeRows.length > 0 && (
        <div className="grid grid-cols-[1fr_100px_100px_32px] items-center gap-3 px-1 text-[11px] font-medium tracking-wide text-gray-400 uppercase">
          <span>Type</span>
          <span className="text-center">No. of Ques.</span>
          <span className="text-center">Marks</span>
          <span />
        </div>
      )}

      {/* Rows */}
      <div className="space-y-3">
        {questionTypeRows.map((row) => (
          <QuestionRow
            key={row.id}
            row={row}
            usedTypes={usedTypes}
            onUpdate={(updates) => updateQuestionTypeRow(row.id, updates)}
            onRemove={() => removeQuestionTypeRow(row.id)}
          />
        ))}
      </div>

      {/* Add button */}
      {canAdd && (
        <button
          type="button"
          onClick={addQuestionTypeRow}
          className="flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-orange-400 hover:text-orange-500"
        >
          <Plus className="h-4 w-4" />
          Add Question Type
        </button>
      )}

      {/* Totals */}
      {questionTypeRows.length > 0 && <TotalSummary />}
    </div>
  );
}

function QuestionRow({
  row,
  usedTypes,
  onUpdate,
  onRemove,
}: {
  row: QuestionTypeRow;
  usedTypes: QuestionType[];
  onUpdate: (updates: Partial<Omit<QuestionTypeRow, "id">>) => void;
  onRemove: () => void;
}) {
  const available = allTypes.filter((t) => t === row.type || !usedTypes.includes(t));

  return (
    <div className="grid grid-cols-[1fr_100px_100px_32px] items-center gap-3">
      {/* Type dropdown */}
      <select
        value={row.type}
        onChange={(e) => onUpdate({ type: e.target.value as QuestionType })}
        className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
      >
        {available.map((t) => (
          <option key={t} value={t}>
            {QUESTION_TYPE_LABELS[t]}
          </option>
        ))}
      </select>

      {/* Count */}
      <div className="flex justify-center">
        <CounterControl
          value={row.count}
          min={1}
          max={30}
          onChange={(v) => onUpdate({ count: v })}
        />
      </div>

      {/* Marks */}
      <div className="flex justify-center">
        <CounterControl
          value={row.marks}
          min={1}
          max={20}
          onChange={(v) => onUpdate({ marks: v })}
        />
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function TotalSummary() {
  const { getTotalQuestions, getTotalMarks } = useFormStore();

  return (
    <div className="flex items-center gap-6 rounded-xl bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">
          Total Questions:
        </span>
        <span className="text-sm font-bold text-gray-900">
          {getTotalQuestions()}
        </span>
      </div>
      <div className="h-4 w-px bg-gray-300" />
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">
          Total Marks:
        </span>
        <span className="text-sm font-bold text-gray-900">
          {getTotalMarks()}
        </span>
      </div>
    </div>
  );
}
