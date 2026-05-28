"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getAssignment } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import { useAssessmentStore } from "@/store/assessmentStore";
import { PaperHeader } from "@/components/assessment/PaperHeader";
import { SectionBlock } from "@/components/assessment/SectionBlock";
import { AnswerKey } from "@/components/assessment/AnswerKey";
import { Spinner } from "@/components/ui/Spinner";
import { Download, RefreshCw, ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import { downloadAssessmentPdf } from "@/lib/pdfExport";
import toast from "react-hot-toast";
import type { Assignment } from "@/types";

export default function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { status, setStatus, setPaper, setError, error } =
    useAssessmentStore();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useSocket(id);

  const fetchAssignment = async () => {
    try {
      const data = await getAssignment(id);
      setAssignment(data);
      setStatus(data.status);
      if (data.generatedPaper) {
        setPaper(data.generatedPaper);
      }
      if (data.error) {
        setError(data.error);
      }
    } catch {
      toast.error("Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (status === "completed") {
      fetchAssignment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleDownloadPDF = async () => {
    try {
      const filename = assignment
        ? `${assignment.subject}-${assignment.topic}-paper`
        : "question-paper";
      await downloadAssessmentPdf("paper-content", filename);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Failed to download PDF");
    }
  };

  const handleRegenerate = async () => {
    try {
      const formData = new FormData();
      const data = {
        subject: assignment!.subject,
        topic: assignment!.topic,
        questionTypes: assignment!.questionTypes,
        numberOfQuestions: assignment!.numberOfQuestions,
        marksPerQuestion: assignment!.marksPerQuestion,
        difficulty: assignment!.difficulty,
        dueDate: assignment!.dueDate,
        additionalInstructions: assignment!.additionalInstructions,
      };
      formData.append("data", JSON.stringify(data));

      const { createAssignment: create } = await import("@/lib/api");
      const result = await create(formData);
      toast.success("Regenerating assessment...");
      router.push(`/assessment/${result.assignmentId}`);
    } catch {
      toast.error("Failed to regenerate");
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-orange-500" />
      </div>
    );
  }

  /* ---------- Processing / Queued ---------- */
  if (status === "queued" || status === "processing") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
          <Spinner className="h-10 w-10 text-orange-500" />
          <Sparkles className="absolute -right-1 -top-1 h-6 w-6 text-orange-400" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">
            {status === "queued"
              ? "In Queue..."
              : "Generating Your Paper..."}
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-gray-500">
            {status === "queued"
              ? "Your assessment is waiting to be processed."
              : "AI is crafting your question paper. This may take a moment."}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2">
          <div
            className={`h-2 w-16 rounded-full ${
              status === "queued" ? "bg-orange-500" : "bg-orange-200"
            }`}
          />
          <div
            className={`h-2 w-16 rounded-full ${
              status === "processing" ? "bg-orange-500" : "bg-orange-200"
            }`}
          />
          <div className="h-2 w-16 rounded-full bg-orange-200" />
        </div>
      </div>
    );
  }

  /* ---------- Failed ---------- */
  if (status === "failed") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Generation Failed
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-gray-500">
            {error || "An unexpected error occurred."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ---------- No paper ---------- */
  if (!assignment?.generatedPaper) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">No generated paper found.</p>
      </div>
    );
  }

  const paper = assignment.generatedPaper;

  /* ---------- Success — Paper view ---------- */
  return (
    <div className="space-y-4">
      {/* Dark banner */}
      <div className="no-print px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-[32px] bg-[#303030] px-4 py-6 sm:gap-6 sm:px-8" style={{ boxShadow: "0 32px 48px 0 rgba(0,0,0,0.20), 0 16px 48px 0 rgba(0,0,0,0.12)" }}>
          <p className="text-sm font-bold leading-relaxed text-white">
            Certainly, Teacher! Here are customized Question Paper for your {assignment?.subject} classes on the {assignment?.topic} chapters:
          </p>
          <div className="flex items-center gap-3">
            {/* Mobile: icon only */}
            <button
              onClick={handleDownloadPDF}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 sm:hidden"
            >
              <Download className="h-5 w-5" />
            </button>
            {/* Desktop: full pill button */}
            <button
              onClick={handleDownloadPDF}
              className="hidden h-11 items-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-[#303030] transition-colors hover:bg-gray-100 sm:flex"
            >
              <Image src="/Frame.svg" alt="Download" width={17} height={19} />
              Download as PDF
            </button>
            <button
              onClick={handleRegenerate}
              className="hidden h-11 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:flex"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Paper */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div
          id="paper-content"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
          className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm sm:px-12"
        >
          <PaperHeader paper={paper} />

          {paper.sections.map((section) => (
            <SectionBlock key={section.sectionLabel} section={section} />
          ))}

          {/* End of paper divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-gray-300" />
            <span className="text-xs font-medium tracking-wide text-gray-400 uppercase">
              End of Question Paper
            </span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Answer Key */}
          <AnswerKey paper={paper} />
        </div>
      </div>
    </div>
  );
}
