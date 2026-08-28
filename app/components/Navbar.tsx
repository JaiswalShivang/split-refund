"use client";

import React from "react";
import { Shield, FileSpreadsheet, Layers, BarChart2, RotateCcw, Play } from "lucide-react";
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
    <header className="sticky top-0 z-40 w-full border-b border-[#242D3D] bg-[#0C111D]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F2430] border border-[#334155] text-blue-400 shadow-sm">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                Split-Refund
              </span>
              <span className="rounded border border-blue-500/30 bg-blue-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300 font-mono">
                Razorpay Route Settlement
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Marketplace Dispute Fault Attribution &amp; Split Reversal Engine
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 rounded-lg border border-[#242D3D] bg-[#161B26] p-1">
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "queue"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1F2430]"
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Dispute Queue</span>
          </button>

          <button
            onClick={() => setActiveTab("detail")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "detail"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1F2430]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Case Deep Dive</span>
            {selectedOrderId && (
              <span className="rounded bg-[#0C111D] px-1.5 py-0.5 text-[10px] font-mono text-blue-300 border border-blue-900/50">
                {selectedOrderId}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "metrics"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1F2430]"
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Settlement Analytics</span>
            {metrics && metrics.innocent_protected_count > 0 && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </nav>

        {/* Global Pipeline Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            title="Reset Simulation Ledger"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#242D3D] bg-[#161B26] text-slate-400 transition hover:border-[#334155] hover:text-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onBatchEvaluate}
            disabled={isEvaluatingBatch}
            className="flex items-center gap-2 rounded-lg bg-[#2563EB] hover:bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
          >
            <Play className={`h-3 w-3 fill-current ${isEvaluatingBatch ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">
              {isEvaluatingBatch ? "Evaluating 55 Cases..." : "Run Batch Pipeline"}
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
