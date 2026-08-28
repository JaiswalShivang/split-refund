"use client";

import React from "react";
import { ShieldCheck, ListOrdered, Sparkles, BarChart3, RefreshCw, Layers } from "lucide-react";
import { BatchMetrics } from "../types";

interface NavbarProps {
  activeTab: "queue" | "detail" | "metrics";
  setActiveTab: (tab: "queue" | "detail" | "metrics") => void;
  selectedOrderId: string | null;
  metrics: BatchMetrics | null;
  isEvaluatingBatch: boolean;
  onBatchEvaluate: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedOrderId,
  metrics,
  isEvaluatingBatch,
  onBatchEvaluate,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                Split-Refund
              </span>
              <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                Razorpay Route AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Automated Fault Attribution &amp; Reversal Decision Engine
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "queue"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            <span>Case Queue</span>
          </button>

          <button
            onClick={() => setActiveTab("detail")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "detail"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Case Deep Dive</span>
            {selectedOrderId && (
              <span className="rounded bg-indigo-950/80 px-1.5 py-0.2 text-[10px] font-mono text-indigo-300 border border-indigo-500/30">
                {selectedOrderId}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "metrics"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Revenue Analytics</span>
            {metrics && metrics.innocent_protected_count > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Global Action CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            title="Reset Simulation Decisions"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={onBatchEvaluate}
            disabled={isEvaluatingBatch}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isEvaluatingBatch ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">
              {isEvaluatingBatch ? "Evaluating 55 Cases..." : "Run Batch Evaluation"}
            </span>
            <span className="sm:hidden">
              {isEvaluatingBatch ? "Running..." : "Evaluate"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
