"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  Sparkles,
  BookOpen,
  Settings,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { listAssignments } from "@/lib/api";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "My Groups", href: "#", icon: Users },
  { label: "Assignments", href: "/", icon: FileText, badge: true },
  { label: "AI Teacher's Toolkit", href: "#", icon: Sparkles },
  { label: "My Library", href: "#", icon: BookOpen },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [assignmentCount, setAssignmentCount] = useState<number | null>(null);

  useEffect(() => {
    listAssignments()
      .then((data) => setAssignmentCount(data.length))
      .catch(() => setAssignmentCount(null));
  }, [pathname]); // re-fetch whenever route changes (e.g. after create/delete)

  return (
    <aside className="sidebar-container flex w-[304px] flex-col justify-between rounded-2xl bg-white p-6">
      {/* Logo */}
      <div className="flex items-center justify-between pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg">
            <Image
              src="/logo.png"
              alt="VedaAI Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Veda<span className="text-orange-500">AI</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Create Assignment CTA */}
      <div className="pb-4">
        <Link href="/create" onClick={onClose} className="create-assignment-btn">
          <Sparkles />
          <span>Create Assignment</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 pt-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href) && item.href !== "#";
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] ${
                  isActive ? "text-orange-500" : "text-gray-400"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && assignmentCount !== null && assignmentCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                  {assignmentCount > 99 ? "99+" : assignmentCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-100 py-3">
        <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900">
          <Settings className="h-[18px] w-[18px] text-gray-400" />
          Settings
        </button>
      </div>

      {/* School info card */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-800">
              Delhi Public School
            </p>
            <p className="text-[10px] text-gray-400">Academic Year 2025-26</p>
          </div>
        </div>
      </div>
    </aside>
  );
}