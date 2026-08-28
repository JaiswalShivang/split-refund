"use client";

import React from "react";
import { BatchMetrics } from "../types";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Play,
  Store,
  Bike,
  Smartphone,
  User,
  Cpu,
  Layers,
} from "lucide-react";

interface MetricsDashboardViewProps {
  metrics: BatchMetrics | null;
  onSelectCase: (orderId: string) => void;
  onRunBatchEvaluate: () => void;
  isEvaluating: boolean;
}

export const MetricsDashboardView: React.FC<MetricsDashboardViewProps> = ({
  metrics,
  onSelectCase,
  onRunBatchEvaluate,
  isEvaluating,
}) => {
  if (!metrics || metrics.total_cases_processed === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <TrendingUp className="h-10 w-10 text-blue-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Settlement Analytics Available Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Execute the batch pipeline across all 55 dispute cases to generate aggregate revenue recovery metrics, fault distributions, and audit ledger statistics.
        </p>
        <button
          onClick={onRunBatchEvaluate}
          disabled={isEvaluating}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50"
        >
          <Play className={`h-4 w-4 fill-current ${isEvaluating ? "animate-spin" : ""}`} />
          <span>{isEvaluating ? "Evaluating 55 Cases..." : "Run Batch Settlement Pipeline"}</span>
        </button>
      </div>
    );
  }

  const dist = metrics.attribution_distribution;

  return (
    <div className="space-y-5">
      {/* HERO REVENUE RECOVERY CALLOUT (The Single Strongest Pitch Beat) */}
      <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Verified Revenue Recovery &amp; Innocent Merchant Defense</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
              Prevented ₹{metrics.innocent_protected_amount.toLocaleString("en-IN")} in Unfair Merchant &amp; Delivery Partner Chargebacks
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              In <strong className="text-slate-900">{metrics.innocent_protected_count} dispute cases</strong>, a standard blanket &quot;refund customer from merchant split&quot; rule would have unfairly penalized an innocent party. The Dispute Engine analyzed machine telemetry ground truth and correctly attributed fault to Delivery Partner transit and Platform dispatch instead.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col items-center justify-center shrink-0 min-w-[200px] shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Autonomous Settlement Rate</span>
            <span className="text-3xl font-extrabold font-mono text-emerald-700 mt-1">
              {metrics.auto_resolved_rate}%
            </span>
            <span className="text-[11px] text-slate-500 mt-1">
              {metrics.auto_resolved_count} of {metrics.total_cases_processed} settled autonomously
            </span>
          </div>
        </div>
      </div>

      {/* CORE KPI GRID WITH PLAIN-ENGLISH SUBTITLES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Processed */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Ingested</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {metrics.total_cases_processed}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1">
            Curated 55 dispute batch
          </span>
        </div>

        {/* Autonomous Settlements */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Autonomous</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {metrics.auto_resolved_count}
          </span>
          <span className="text-[10px] text-emerald-700 mt-1 border-t border-emerald-100 pt-1">
            {metrics.auto_resolved_rate}% settled without adjuster
          </span>
        </div>

        {/* Ambiguous Holds */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Ambiguous Holds</span>
            <AlertCircle className="h-3.5 w-3.5 text-[#D97706]" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {metrics.needs_review_count}
          </span>
          <span className="text-[10px] text-amber-800 mt-1 border-t border-amber-100 pt-1">
            Confidence &lt; 60%; held for adjuster
          </span>
        </div>

        {/* High-Velocity Flags */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Abuse Watch</span>
            <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {metrics.fraud_suspect_count}
          </span>
          <span className="text-[10px] text-rose-800 mt-1 border-t border-rose-100 pt-1">
            &ge;4 claims/mo; flagged for hold
          </span>
        </div>

        {/* Gross Customer Refunds */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Refunds Debited</span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            ₹{metrics.total_refunds_processed.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1">
            Total Route split reversals
          </span>
        </div>

        {/* Time Saved */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hours Saved</span>
            <Clock className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {metrics.estimated_time_saved_hours}h
          </span>
          <span className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1 font-mono">
            vs 12 min/case manual baseline
          </span>
        </div>
      </div>

      {/* FINANCIAL LEDGER DISAMBIGUATION & RECONCILIATION CARD */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs mt-0.5">
            ₹
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Financial Ledger Reconciliation: Gross Customer Refunds vs. Innocent Capital Preserved</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="rounded-lg bg-white border border-slate-200 p-2.5 shadow-2xs">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  1. Gross Customer Refunds Debited (₹{metrics.total_refunds_processed.toLocaleString("en-IN")})
                </span>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  The actual rupee refund volume returned to customers for valid order defects, debited proportionally across at-fault Merchant, Delivery Partner, and Platform escrow accounts.
                </p>
              </div>
              <div className="rounded-lg bg-white border border-emerald-200 p-2.5 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  2. Innocent Capital Preserved (₹{metrics.innocent_protected_amount.toLocaleString("en-IN")})
                </span>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  The revenue safeguarded for innocent partners who would have been charged 100% under legacy blanket merchant chargeback policies, but were cleared by objective telemetry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAULT ATTRIBUTION DISTRIBUTION & SAFETY GUARDRAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aggregate Responsibility Allocation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Aggregate Marketplace Fault Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Average responsibility percentage allocated across the entire 55-dispute dataset
          </p>

          <div className="space-y-3.5 text-xs">
            {/* Merchant Prep */}
            <div>
              <div className="flex justify-between items-center text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Store className="h-3.5 w-3.5 text-[#D97706]" /> Merchant Prep Fault (Kitchen SLA Exceeded)
                </span>
                <span className="font-mono font-bold text-[#B45309]">{dist.restaurant}%</span>
              </div>
              <div className="h-2 w-full rounded bg-slate-100 border border-slate-200 overflow-hidden">
                <div className="h-full bg-[#D97706] transition-all duration-500" style={{ width: `${dist.restaurant}%` }} />
              </div>
            </div>

            {/* Delivery Partner Transit */}
            <div>
              <div className="flex justify-between items-center text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Bike className="h-3.5 w-3.5 text-[#0284C7]" /> Delivery Partner Transit Fault (Logistics &amp; Spillage)
                </span>
                <span className="font-mono font-bold text-[#0369A1]">{dist.delivery_partner}%</span>
              </div>
              <div className="h-2 w-full rounded bg-slate-100 border border-slate-200 overflow-hidden">
                <div className="h-full bg-[#0284C7] transition-all duration-500" style={{ width: `${dist.delivery_partner}%` }} />
              </div>
            </div>

            {/* Customer Remorse */}
            <div>
              <div className="flex justify-between items-center text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="h-3.5 w-3.5 text-emerald-600" /> Customer Remorse (Non-Refundable)
                </span>
                <span className="font-mono font-bold text-[#047857]">{dist.customer}%</span>
              </div>
              <div className="h-2 w-full rounded bg-slate-100 border border-slate-200 overflow-hidden">
                <div className="h-full bg-[#059669] transition-all duration-500" style={{ width: `${dist.customer}%` }} />
              </div>
            </div>

            {/* Platform Outage */}
            <div>
              <div className="flex justify-between items-center text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Smartphone className="h-3.5 w-3.5 text-[#7C3AED]" /> Platform Infrastructure (Dispatch Outages)
                </span>
                <span className="font-mono font-bold text-[#6D28D9]">{dist.platform}%</span>
              </div>
              <div className="h-2 w-full rounded bg-slate-100 border border-slate-200 overflow-hidden">
                <div className="h-full bg-[#7C3AED] transition-all duration-500" style={{ width: `${dist.platform}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Engine Guardrails & Performance Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Deterministic Guardrails &amp; Precision
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Multi-tier confidence gates and mathematical split-reversal guarantees
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500 block font-medium">Average Confidence</span>
                <span className="text-xl font-bold font-mono text-blue-700 mt-1 block">
                  {metrics.average_confidence}%
                </span>
                <span className="text-[10px] text-slate-400">Telemetry alignment index</span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500 block font-medium">Decision Turnaround</span>
                <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
                  &lt; 1.2 sec
                </span>
                <span className="text-[10px] text-slate-400">vs 12m manual review</span>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs text-slate-700">
              <p className="font-semibold text-blue-900 mb-1 flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-blue-600" />
                Deterministic Settlement Rules:
              </p>
              <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                <li>Confidence &lt; 60% automatically holds funds for human adjuster verification.</li>
                <li>Users with &ge; 4 claims in 30 days trigger policy abuse watch hold.</li>
                <li>All currency arithmetic computed strictly in Go (zero LLM arithmetic hallucination).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED DEMO SHOWCASES (Judge Walkthrough Jump Cards) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600" />
          Featured Presentation Showcases
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Select any case below to inspect its dual-source telemetry dossier and causal attribution verdict
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Showcase 1: Innocent Merchant Protected */}
          <div
            onClick={() => onSelectCase("ord_1016")}
            className="group cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50/30 p-4 transition hover:border-emerald-400 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                ord_1016
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-emerald-800 transition">
              1. Innocent Merchant Protected
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
              Customer claimed food was ice-cold upon arrival; telemetry proved a 54m Delivery Partner transit delay. Saved ₹490 for Merchant (Cream Stone).
            </p>
          </div>

          {/* Showcase 2: Repeat Offender Abuse Watch */}
          <div
            onClick={() => onSelectCase("ord_1041")}
            className="group cursor-pointer rounded-lg border border-rose-200 bg-rose-50/30 p-4 transition hover:border-rose-400 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-800 border border-rose-200">
                ord_1041
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600 transition" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-rose-800 transition">
              2. High-Velocity Claim Flag
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
              Customer filed 6th claim in 30 days despite verified 16m hot delivery. Automatically placed on abuse watch hold.
            </p>
          </div>

          {/* Showcase 3: Platform Outage Absorption */}
          <div
            onClick={() => onSelectCase("ord_1046")}
            className="group cursor-pointer rounded-lg border border-purple-200 bg-purple-50/30 p-4 transition hover:border-purple-400 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-800 border border-purple-200">
                ord_1046
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-purple-800 transition">
              3. Platform Outage Absorption
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
              Platform auto-dispatch outage delayed Delivery Partner pickup by 37m. Platform absorbs 100% reversal, sparing Merchant and Delivery Partner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
