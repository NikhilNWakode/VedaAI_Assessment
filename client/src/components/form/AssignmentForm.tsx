"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/store/formStore";
import { createAssignment } from "@/lib/api";
import { StepIndicator } from "./StepIndicator";
import { DifficultySelector } from "./DifficultySelector";
import { QuestionTypeSelector } from "./QuestionTypeSelector";
import { FileUpload } from "./FileUpload";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowLeft, ArrowRight, Mic } from "lucide-react";
import toast from "react-hot-toast";

const STEP_LABELS = ["Basic Details", "Assignment Details"];

export function AssignmentForm() {
  const router = useRouter();
  const store = useFormStore();
  const [submitting, setSubmitting] = useState(false);

  const validateStep1 = (): string | null => {
    if (!store.subject.trim()) return "Subject is required";
    if (!store.topic.trim()) return "Topic is required";
    if (!store.dueDate) return "Due date is required";
    return null;
  };

  const validateStep2 = (): string | null => {
    if (store.questionTypeRows.length === 0) return "Add at least one question type";
    if (store.getTotalQuestions() < 1) return "Total questions must be at least 1";
    return null;
  };

  const handleNext = () => {
    const error = validateStep1();
    if (error) {
      toast.error(error);
      return;
    }
    store.setStep(2);
  };

  const handlePrevious = () => {
    store.setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateStep2();
    if (error) {
      toast.error(error);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      const marksForSelected: Record<string, number> = {};
      const questionTypes: string[] = [];
      for (const row of store.questionTypeRows) {
        questionTypes.push(row.type);
        marksForSelected[row.type] = row.marks;
      }

      const data = {
        subject: store.subject,
        topic: store.topic,
        questionTypes,
        numberOfQuestions: store.getTotalQuestions(),
        marksPerQuestion: marksForSelected,
        difficulty: store.difficulty,
        dueDate: new Date(store.dueDate).toISOString(),
        additionalInstructions: store.additionalInstructions || undefined,
      };

      formData.append("data", JSON.stringify(data));

      if (store.file) {
        formData.append("file", store.file);
      }

      const result = await createAssignment(formData);
      store.reset();
      toast.success("Assessment generation started!");
      router.push(`/assessment/${result.assignmentId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step indicator */}
      <StepIndicator
        currentStep={store.step}
        totalSteps={2}
        labels={STEP_LABELS}
      />

      {/* Step 1: Basic Details */}
      {store.step === 1 && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-bold text-gray-900">
              Basic Details
            </h2>

            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={store.subject}
                  onChange={(e) => store.setField("subject", e.target.value)}
                  placeholder="e.g., Mathematics"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Topic */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Topic <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={store.topic}
                  onChange={(e) => store.setField("topic", e.target.value)}
                  placeholder="e.g., Quadratic Equations"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Difficulty */}
              <DifficultySelector />

              {/* Due Date */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Due Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={store.dueDate}
                  onChange={(e) => store.setField("dueDate", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>

          {/* Next button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Assignment Details */}
      {store.step === 2 && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-bold text-gray-900">
              Assignment Details
            </h2>

            <div className="space-y-5">
              {/* File Upload */}
              <FileUpload />

              {/* Question Types */}
              <QuestionTypeSelector />

              {/* Additional Information */}
              <div>
                <label className="mb-2.5 block text-sm font-semibold text-gray-800">
                  Additional Information
                </label>
                <div className="relative">
                  <textarea
                    value={store.additionalInstructions}
                    onChange={(e) =>
                      store.setField("additionalInstructions", e.target.value)
                    }
                    placeholder="Add any specific instructions for the AI generator..."
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    title="Voice input (coming soon)"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Assessment
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
