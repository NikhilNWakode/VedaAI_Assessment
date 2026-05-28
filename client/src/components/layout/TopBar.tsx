"use client";

import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  ChevronDown,
  ArrowLeft,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
}

interface Breadcrumb {
  title: string;
  mobileTitle: string;
  icon: LucideIcon;
  back: string | null;
}

function getBreadcrumb(pathname: string): Breadcrumb {
  if (pathname === "/")
    return { title: "Assignment", mobileTitle: "Assignments", icon: LayoutGrid, back: null };
  if (pathname === "/create")
    return { title: "Assignment", mobileTitle: "Create Assignment", icon: LayoutGrid, back: "/" };
  if (pathname.startsWith("/assessment/"))
    return { title: "Create New", mobileTitle: "Create Assignment", icon: Sparkles, back: "/" };
  return { title: "Assignment", mobileTitle: "Assignments", icon: LayoutGrid, back: "/" };
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const { title, mobileTitle, icon: Icon, back } = getBreadcrumb(pathname);

  return (
    <>
      {/* ===== Mobile TopBar (two rows) ===== */}
      <div className="fixed top-0 right-0 left-0 z-30 bg-white lg:hidden">
        {/* Row 1: Logo + bell + avatar + hamburger */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl">
              <Image src="/logo.png" alt="VedaAI" fill className="object-cover" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Veda<span className="text-orange-500">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="relative p-1 text-gray-700 hover:text-gray-900">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-500" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm font-semibold text-white">
              T
            </div>
            <button
              onClick={onMenuClick}
              className="p-1 text-gray-700 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Row 2: Back arrow + page title — with progressive blur */}
        <div className="mobile-breadcrumb flex items-center px-5 py-[18px]">
          <div className="flex h-12 w-full items-center gap-3">
            <Link
              href={back || "/"}
              className="flex items-center text-gray-800 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-base font-semibold text-gray-800">{mobileTitle}</h1>
          </div>
        </div>
      </div>

      {/* ===== Desktop TopBar (single floating bar) ===== */}
      <div className="fixed top-3 right-3 left-[328px] z-30 hidden lg:block">
        <header className="mx-auto flex h-14 max-w-[1100px] items-center justify-between rounded-2xl bg-white/75 pl-6 pr-3 backdrop-blur-md">
          {/* Left side */}
          <div className="flex flex-1 items-center gap-2">
            {/* Back arrow */}
            {back && (
              <Link
                href={back}
                className="flex items-center text-black hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}

            {/* Icon + breadcrumb */}
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-[#A9A9A9]" />
              <h1 className="text-base font-semibold tracking-tight text-[#A9A9A9]">
                {title}
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex h-10 items-center gap-3">
            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-black/5">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button className="flex items-center gap-2 rounded-lg py-1.5 pr-1 pl-1.5 hover:bg-black/5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
                T
              </div>
              <span className="text-sm font-medium text-gray-700">Teacher</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </header>
      </div>
    </>
  );
}
