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
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                55 Marketplace Dispute Cases Ready for Settlement Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
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
      {/* 1. Innocent Capital Preserved (Unfair Chargebacks Prevented) */}
      <div
        onClick={onSelectProtectedFilter}
        className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 cursor-pointer hover:border-emerald-300 hover:shadow-sm transition flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Innocent Capital Preserved
          </span>
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1 text-xl font-bold font-mono text-slate-900">
            <IndianRupee className="h-4 w-4 text-emerald-600 self-center" />
            <span>{metrics.innocent_protected_amount.toLocaleString("en-IN")}</span>
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
            {metrics.innocent_protected_count} innocent partners spared from chargebacks
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-emerald-100 text-[10px] text-slate-600 leading-tight">
          Partner earnings saved from wrongful 100% deductions when telemetry cleared them.
        </div>
      </div>

      {/* 2. Autonomous Settlements */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Autonomous Settlements
          </span>
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">{metrics.auto_resolved_count}</span>
            <span className="text-xs font-semibold text-blue-600">({metrics.auto_resolved_rate}%)</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Conclusive telemetry evidence
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 leading-tight">
          Confidence &gt; 80%; split reversals calculated and posted without human delay.
        </div>
      </div>

      {/* 3. Ambiguous Evidence Holds */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
            Ambiguous Evidence Holds
          </span>
          <AlertCircle className="h-4 w-4 text-[#D97706]" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">{metrics.needs_review_count}</span>
            <span className="text-[11px] text-amber-700 font-mono font-medium">Confidence &lt; 60%</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-0.5">
            Held for controller sign-off
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-amber-100 text-[10px] text-slate-600 leading-tight">
          Complex multi-factor delays; funds held until adjuster verifies evidence.
        </div>
      </div>

      {/* 4. High-Frequency Claim Holds */}
      <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
            High-Velocity Claim Holds
          </span>
          <ShieldAlert className="h-4 w-4 text-rose-600" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">{metrics.fraud_suspect_count}</span>
            <span className="text-[11px] text-rose-700 font-mono font-medium">&ge; 4 claims/30d</span>
          </div>
          <p className="text-[11px] text-rose-800 font-medium mt-0.5">
            Abuse watch audit hold
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-rose-100 text-[10px] text-slate-600 leading-tight">
          Automatic hold on repeat claimants to prevent refund policy exploitation.
        </div>
      </div>

      {/* 5. Turnaround Efficiency */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Turnaround Efficiency
          </span>
          <Clock className="h-4 w-4 text-slate-500" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-slate-900">{metrics.estimated_time_saved_hours}</span>
            <span className="text-xs font-medium text-slate-600">hours saved</span>
          </div>
          <p className="text-[11px] text-slate-700 mt-0.5 font-mono">
            1.2s AI vs. 12m manual baseline
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 leading-tight">
          Calculated against standard 12 min manual adjuster review per case.
        </div>
      </div>
    </div>
  );
};
