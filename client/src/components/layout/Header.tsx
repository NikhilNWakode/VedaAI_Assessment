"use client";

import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">VedaAI</span>
        </Link>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Assessment
        </Link>
      </div>
    </header>
  );
}
