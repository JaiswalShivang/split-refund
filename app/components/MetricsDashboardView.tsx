"use client";

import React from "react";
import { BatchMetrics } from "../types";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Store,
  Bike,
  Smartphone,
  User,
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
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-12 text-center backdrop-blur-md">
        <TrendingUp className="h-12 w-12 text-indigo-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-semibold text-white">No Evaluation Analytics Available Yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Run the batch evaluation across the 55 dispute cases to generate aggregate revenue recovery metrics, fault distributions, and audit statistics.
        </p>
        <button
          onClick={onRunBatchEvaluate}
          disabled={isEvaluating}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 transition disabled:opacity-50"
        >
          <Sparkles className={`h-4 w-4 ${isEvaluating ? "animate-spin" : ""}`} />
          <span>{isEvaluating ? "Evaluating 55 Cases..." : "Run Batch Evaluation"}</span>
        </button>
      </div>
    );
  }

  const dist = metrics.attribution_distribution;

  return (
    <div className="space-y-5">
      {/* HERO REVENUE RECOVERY CALLOUT (The Single Strongest Pitch Beat) */}
      <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-950 p-6 backdrop-blur-md relative overflow-hidden shadow-2xl shadow-indigo-950/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <span>Measured Revenue Recovery &amp; Merchant Defense</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Protected ₹{metrics.innocent_protected_amount.toLocaleString("en-IN")} from Unfair Merchant Chargebacks
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In <strong className="text-white">{metrics.innocent_protected_count} cases</strong>, a naive &quot;refund customer from restaurant&quot; policy would have unfairly penalized an innocent merchant. The Reasoning Agent analyzed machine telemetry and correctly attributed fault to logistics transit and platform dispatch instead.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="rounded-xl border border-indigo-500/30 bg-slate-950/80 p-4 flex flex-col items-center justify-center shrink-0 min-w-[200px]">
            <span className="text-xs text-slate-400 font-medium">Auto-Resolution Rate</span>
            <span className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
              {metrics.auto_resolved_rate}%
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              {metrics.auto_resolved_count} of {metrics.total_cases_processed} disputes auto-settled
            </span>
          </div>
        </div>
      </div>

      {/* CORE KPI GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Processed */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-sm">
          <span className="text-[11px] text-slate-400 block">Total Processed</span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {metrics.total_cases_processed}
          </span>
          <span className="text-[10px] text-slate-500">Curated batch</span>
        </div>

        {/* Auto-Resolved */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 block">Auto-Resolved</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {metrics.auto_resolved_count}
          </span>
          <span className="text-[10px] text-emerald-400/80">{metrics.auto_resolved_rate}% rate</span>
        </div>

        {/* Needs Review */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-400 block">Needs Review</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {metrics.needs_review_count}
          </span>
          <span className="text-[10px] text-amber-400/80">Confidence &lt; 60%</span>
        </div>

        {/* Fraud Suspects */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-rose-400 block">Fraud Suspects</span>
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {metrics.fraud_suspect_count}
          </span>
          <span className="text-[10px] text-rose-400/80">Repeat offenders</span>
        </div>

        {/* Total Refunds */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-sm">
          <span className="text-[11px] text-slate-400 block">Refunds Reversal</span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            ₹{metrics.total_refunds_processed.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-slate-500">Route reversals</span>
        </div>

        {/* Hours Saved */}
        <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-purple-300 block">Time Saved</span>
            <Clock className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {metrics.estimated_time_saved_hours} hrs
          </span>
          <span className="text-[10px] text-purple-400/80">Controller hours</span>
        </div>
      </div>

      {/* FAULT ATTRIBUTION DISTRIBUTION BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Average Fault Split across Entire Batch */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-1">
            Aggregate Fault Attribution Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Average responsibility percentage across the entire dispute dataset
          </p>

          <div className="space-y-3 text-xs">
            {/* Restaurant */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Store className="h-3.5 w-3.5 text-orange-400" /> Restaurant Fault (Kitchen SLA Bottlenecks)
                </span>
                <span className="font-mono font-bold text-orange-400">{dist.restaurant}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-700" style={{ width: `${dist.restaurant}%` }} />
              </div>
            </div>

            {/* Delivery Partner */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Bike className="h-3.5 w-3.5 text-sky-400" /> Delivery Partner Fault (Transit Delays/Spillage)
                </span>
                <span className="font-mono font-bold text-sky-400">{dist.delivery_partner}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-sky-500 transition-all duration-700" style={{ width: `${dist.delivery_partner}%` }} />
              </div>
            </div>

            {/* Customer */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="h-3.5 w-3.5 text-emerald-400" /> Customer-Initiated (Remorse &amp; Cancellations)
                </span>
                <span className="font-mono font-bold text-emerald-400">{dist.customer}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${dist.customer}%` }} />
              </div>
            </div>

            {/* Platform */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Smartphone className="h-3.5 w-3.5 text-purple-400" /> Platform Infrastructure (Dispatch Outages)
                </span>
                <span className="font-mono font-bold text-purple-400">{dist.platform}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-700" style={{ width: `${dist.platform}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Quality & Confidence Overview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Decision Pipeline Accuracy &amp; Guardrails
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Multi-tier confidence scoring and hard-coded safety overrides
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <span className="text-[11px] text-slate-400 block">Average Confidence</span>
                <span className="text-xl font-bold font-mono text-indigo-300 mt-1 block">
                  {metrics.average_confidence}%
                </span>
                <span className="text-[10px] text-slate-500">Across all 55 decisions</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <span className="text-[11px] text-slate-400 block">Turnaround Time</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                  &lt; 1.2 sec
                </span>
                <span className="text-[10px] text-slate-500">vs 24h manual queue</span>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-3 text-xs text-slate-300">
              <p className="font-semibold text-indigo-300 mb-0.5">Automated Safety Policy:</p>
              <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                <li>Confidence &lt; 60% automatically escalates to human controller review.</li>
                <li>Users with &ge; 4 monthly claims trigger Fraud Suspect holds.</li>
                <li>All currency math executed deterministically in Go (zero LLM arithmetic hallucination).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED DEMO SHOWCASES (Judge Walkthrough Jump Cards) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          Curated Demo Showcases for Presentation
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Click any case below to open its full dual-truth dossier and audit trail
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Showcase 1: Innocent Merchant Protected */}
          <div
            onClick={() => onSelectCase("ord_1016")}
            className="group cursor-pointer rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-950 p-4 transition hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/40"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                ord_1016
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition" />
            </div>
            <h4 className="text-xs font-bold text-white mt-2 group-hover:text-emerald-300 transition">
              1. Innocent Merchant Protected
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Customer blamed restaurant for cold food; telemetry proves 54m transit delay. Saved ₹490 for Cream Stone.
            </p>
          </div>

          {/* Showcase 2: Repeat Offender Fraud */}
          <div
            onClick={() => onSelectCase("ord_1041")}
            className="group cursor-pointer rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-950/30 to-slate-950 p-4 transition hover:border-rose-400 hover:shadow-lg hover:shadow-rose-950/40"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300">
                ord_1041
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-rose-400 transition" />
            </div>
            <h4 className="text-xs font-bold text-white mt-2 group-hover:text-rose-300 transition">
              2. Repeat Offender Fraud Gate
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Customer filed 6th claim this month despite verified 16m hot delivery. Automatically placed on fraud review hold.
            </p>
          </div>

          {/* Showcase 3: Platform Glitch Absorption */}
          <div
            onClick={() => onSelectCase("ord_1046")}
            className="group cursor-pointer rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-slate-950 p-4 transition hover:border-purple-400 hover:shadow-lg hover:shadow-purple-950/40"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300">
                ord_1046
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-400 transition" />
            </div>
            <h4 className="text-xs font-bold text-white mt-2 group-hover:text-purple-300 transition">
              3. Platform Glitch Absorption
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Platform dispatch outage delayed rider assignment by 37m. Platform absorbs 100% reversal, protecting merchant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
