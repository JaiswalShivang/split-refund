"use client";

import React from "react";
import { BatchMetrics } from "../types";
import { ShieldCheck, CheckCircle2, AlertCircle, ShieldAlert, Clock, IndianRupee } from "lucide-react";

interface MetricsBannerProps {
  metrics: BatchMetrics | null;
  onSelectProtectedFilter?: () => void;
}

export const MetricsBanner: React.FC<MetricsBannerProps> = ({ metrics, onSelectProtectedFilter }) => {
  if (!metrics || metrics.total_cases_processed === 0) {
    return (
      <div className="rounded-xl border border-[#242D3D] bg-[#161B26] p-4 text-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1F2430] border border-[#334155] text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                55 Marketplace Dispute Cases Ready for Settlement Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Each case contains verified 3-source telemetry: Customer Claim, Merchant POS Timestamps, and Delivery Partner GPS Traces.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Unfair Chargebacks Prevented (Key Causal Showcase) */}
      <div
        onClick={onSelectProtectedFilter}
        className="rounded-xl border border-emerald-500/40 bg-[#161B26] p-3.5 cursor-pointer hover:border-emerald-400 transition flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Chargebacks Prevented
          </span>
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1 text-xl font-bold font-mono text-white">
            <IndianRupee className="h-4 w-4 text-emerald-400 self-center" />
            <span>{metrics.innocent_protected_amount.toLocaleString("en-IN")}</span>
          </div>
          <p className="text-[11px] font-semibold text-emerald-300 mt-0.5">
            {metrics.innocent_protected_count} innocent merchants &amp; delivery partners spared
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-[#242D3D] text-[10px] text-slate-400 leading-tight">
          Saved from unfair 100% deduction when telemetry proved Delivery Partner transit delay.
        </div>
      </div>

      {/* 2. Autonomous Settlements */}
      <div className="rounded-xl border border-[#242D3D] bg-[#161B26] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Autonomous Settlements
          </span>
          <CheckCircle2 className="h-4 w-4 text-blue-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">{metrics.auto_resolved_count}</span>
            <span className="text-xs font-semibold text-blue-400">({metrics.auto_resolved_rate}%)</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Conclusive telemetry evidence
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-[#242D3D] text-[10px] text-slate-400 leading-tight">
          Confidence &gt; 80%; split reversals calculated and posted without human delay.
        </div>
      </div>

      {/* 3. Ambiguous Evidence Holds */}
      <div className="rounded-xl border border-[#D97706]/40 bg-[#161B26] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#F59E0B] uppercase tracking-wider">
            Ambiguous Evidence Holds
          </span>
          <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">{metrics.needs_review_count}</span>
            <span className="text-[11px] text-amber-400 font-mono">Confidence &lt; 60%</span>
          </div>
          <p className="text-[11px] text-amber-200/90 mt-0.5">
            Held for controller sign-off
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-[#242D3D] text-[10px] text-slate-400 leading-tight">
          Complex multi-factor delays; funds held until adjuster verifies evidence.
        </div>
      </div>

      {/* 4. High-Frequency Claim Holds */}
      <div className="rounded-xl border border-rose-500/30 bg-[#161B26] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            High-Velocity Claim Holds
          </span>
          <ShieldAlert className="h-4 w-4 text-rose-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">{metrics.fraud_suspect_count}</span>
            <span className="text-[11px] text-rose-300 font-mono">&ge; 4 claims/30d</span>
          </div>
          <p className="text-[11px] text-rose-200/90 mt-0.5">
            Abuse watch audit hold
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-[#242D3D] text-[10px] text-slate-400 leading-tight">
          Automatic hold on repeat claimants to prevent refund policy exploitation.
        </div>
      </div>

      {/* 5. Turnaround Efficiency */}
      <div className="rounded-xl border border-[#242D3D] bg-[#161B26] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Turnaround Efficiency
          </span>
          <Clock className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">{metrics.estimated_time_saved_hours}</span>
            <span className="text-xs font-medium text-slate-300">hours saved</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5 font-mono">
            1.2s AI vs. 12m manual baseline
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-[#242D3D] text-[10px] text-slate-400 leading-tight">
          Calculated against standard 12 min manual adjuster review per case.
        </div>
      </div>
    </div>
  );
};
