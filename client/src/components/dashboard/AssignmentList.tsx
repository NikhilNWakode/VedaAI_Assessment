"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "./EmptyState";
import { AssignmentCard } from "./AssignmentCard";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import type { Assignment } from "@/types";

export function AssignmentList({ assignments }: { assignments: Assignment[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  if (assignments.length === 0) {
    return <EmptyState />;
  }

  const filtered = assignments.filter((a) => {
    const matchesSearch =
      !search ||
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.topic.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your AI-generated question papers
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Filter dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-none bg-transparent text-sm text-gray-700 outline-none"
            >
              <option value="all">Filter By</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="queued">Queued</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((a) => (
          <AssignmentCard key={a._id} assignment={a} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          No assignments match your search.
        </div>
      )}

      <div className="h-24"></div>

      {/* Sticky bottom CTA with blur fade */}
      <div className="fixed right-0 bottom-16 left-0 z-20 flex flex-col items-center lg:bottom-0 lg:left-[328px]">
        {/* Gradient fade */}
        <div className="pointer-events-none h-16 w-full bg-gradient-to-t from-[#F5F5F7] to-transparent" />
        {/* Button */}
        <div className="w-full bg-[#F5F5F7] pb-5 pt-0 flex justify-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 text-white" />
            Create Assignment
          </Link>
        </div>
      </div>
    </div>
  );
}
