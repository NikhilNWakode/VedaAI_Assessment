"use client";

import { useCallback } from "react";
import { useFormStore } from "@/store/formStore";
import { Upload, X, FileText } from "lucide-react";

export function FileUpload() {
  const { file, setFile } = useFormStore();

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (dropped?.type === "application/pdf") {
        setFile(dropped);
      }
    },
    [setFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  return (
    <div>
      <label className="mb-2.5 block text-sm font-semibold text-gray-800">
        Upload Reference Material (PDF)
      </label>
      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
            <FileText className="h-4 w-4 text-orange-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800">
              {file.name}
            </p>
            <p className="text-xs text-gray-400">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 transition-colors hover:border-orange-400 hover:bg-orange-50/30"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Upload className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">
            Drag & drop your file here, or{" "}
            <label className="cursor-pointer font-semibold text-orange-500 hover:text-orange-600">
              browse
              <input
                type="file"
                accept=".pdf"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </p>
          <p className="mt-1.5 text-xs text-gray-400">
            PDF files only, max 10MB
          </p>
        </div>
      )}
    </div>
  );
}
