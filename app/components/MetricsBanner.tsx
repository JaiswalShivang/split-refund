"use client";

import React from "react";
import { BatchMetrics } from "../types";
import { ShieldCheck, CheckCircle2, AlertTriangle, ShieldAlert, Clock, IndianRupee } from "lucide-react";

interface MetricsBannerProps {
  metrics: BatchMetrics | null;
  onSelectProtectedFilter?: () => void;
}

export const MetricsBanner: React.FC<MetricsBannerProps> = ({ metrics, onSelectProtectedFilter }) => {
  if (!metrics || metrics.total_cases_processed === 0) {
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Dispute Batch Ready for Decision Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                55 dispute cases loaded with 3-source telemetry data. Click &quot;Run Batch Evaluation&quot; to attribute fault and calculate split reversals.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {/* Auto Resolved */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Auto-Resolved</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-white">{metrics.auto_resolved_count}</span>
          <span className="text-xs font-semibold text-emerald-400">({metrics.auto_resolved_rate}%)</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${metrics.auto_resolved_rate}%` }}
          />
        </div>
      </div>

      {/* Innocent Parties Protected - Key Showcase Metric */}
      <div
        onClick={onSelectProtectedFilter}
        className="rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-3.5 backdrop-blur-sm relative overflow-hidden group cursor-pointer hover:border-indigo-400 transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-indigo-300">Innocent Protected</span>
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-bold tracking-tight text-white">{metrics.innocent_protected_count}</span>
          <span className="text-xs font-bold text-indigo-300">Merchants/Riders</span>
        </div>
        <p className="mt-1 text-[11px] font-mono font-medium text-emerald-400 flex items-center gap-0.5">
          <IndianRupee className="h-3 w-3" />
          <span>{metrics.innocent_protected_amount.toLocaleString("en-IN")} saved</span>
        </p>
      </div>

      {/* Needs Review Gate */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Human Review Gate</span>
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-white">{metrics.needs_review_count}</span>
          <span className="text-[11px] text-amber-400/80">Confidence &lt; 60%</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Escalated to controller</p>
      </div>

      {/* Fraud Pattern Suspects */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3.5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Fraud Suspects</span>
          <ShieldAlert className="h-4 w-4 text-rose-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-white">{metrics.fraud_suspect_count}</span>
          <span className="text-[11px] text-rose-400/80">&ge; 4 disputes/mo</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Policy abuse hold</p>
      </div>

      {/* Controller Time Saved */}
      <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3.5 backdrop-blur-sm col-span-2 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Time Saved</span>
          <Clock className="h-4 w-4 text-purple-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-bold tracking-tight text-white">{metrics.estimated_time_saved_hours}</span>
          <span className="text-xs text-purple-300">hours</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Instant AI vs 24h manual</p>
      </div>
    </div>
  );
};
