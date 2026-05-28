"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16">
      <div className="flex max-w-[486px] flex-col items-center gap-8">
        {/* Illustration */}
        <div className="relative h-[300px] w-[300px]">
          <Image
            src="/fileflaticon.svg"
            alt="No assignments"
            fill
            className="object-contain"
          />
        </div>

        {/* Text content */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-center text-xl font-bold leading-[140%] tracking-tight text-gray-900">
            No assignments yet
          </h2>
          <p className="max-w-[486px] text-center text-base font-normal leading-[140%] tracking-tight text-gray-500">
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and let
            AI assist with grading.
          </p>
        </div>

        {/* CTA button */}
        <Link
          href="/create"
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Create Your First Assignment
        </Link>
      </div>
    </div>
  );
}
