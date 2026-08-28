"use client";

import React, { useState } from "react";
import { AssembledCase, EvaluationDecision, FaultAttribution, HumanOverride } from "../types";
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Copy,
  Check,
  Store,
  Bike,
  IndianRupee,
  FileText,
  Sliders,
  X,
  ChevronDown,
} from "lucide-react";

interface CaseDetailViewProps {
  assembledCase: AssembledCase | null;
  decision: EvaluationDecision | null;
  allCases: AssembledCase[];
  onSelectCase: (orderId: string) => void;
  onBackToQueue: () => void;
  onEvaluateCase: (orderId: string) => void;
  onSaveOverride: (orderId: string, override: HumanOverride) => void;
  isEvaluating: boolean;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  assembledCase,
  decision,
  allCases,
  onSelectCase,
  onBackToQueue,
  onEvaluateCase,
  onSaveOverride,
  isEvaluating,
}) => {
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);

  // Override modal form state
  const [overrideFault, setOverrideFault] = useState<FaultAttribution>({
    restaurant: decision?.fault_attribution.restaurant ?? 0,
    delivery_partner: decision?.fault_attribution.delivery_partner ?? 0,
    platform: decision?.fault_attribution.platform ?? 0,
    customer: decision?.fault_attribution.customer ?? 0,
  });
  const [overrideNotes, setOverrideNotes] = useState("");
  const [reviewerName, setReviewerName] = useState("Senior Controller");

  if (!assembledCase) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-slate-800 bg-slate-950/60 p-8">
        <FileText className="h-12 w-12 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-white">No Case Selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Please select a dispute case from the Case Queue to inspect the telemetry dossier and AI reasoning.
        </p>
        <button
          onClick={onBackToQueue}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Case Queue</span>
        </button>
      </div>
    );
  }

  const { order, complaint, delivery_event } = assembledCase;

  const handleCopyMemo = () => {
    if (decision?.justification_memo) {
      navigator.clipboard.writeText(decision.justification_memo);
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    }
  };

  const handleOpenOverride = () => {
    setOverrideFault({
      restaurant: decision?.fault_attribution.restaurant ?? 50,
      delivery_partner: decision?.fault_attribution.delivery_partner ?? 50,
      platform: decision?.fault_attribution.platform ?? 0,
      customer: decision?.fault_attribution.customer ?? 0,
    });
    setOverrideNotes(decision?.reasoning ? `Adjusted from: ${decision.reasoning}` : "");
    setIsOverrideOpen(true);
  };

  const handleSaveOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOverride(order.order_id, {
      overridden_by: reviewerName,
      overridden_at: new Date().toISOString(),
      fault_attribution: overrideFault,
      reviewer_notes: overrideNotes,
      approved_status: "MANUALLY_OVERRIDDEN",
    });
    setIsOverrideOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar & Case Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToQueue}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Queue</span>
          </button>

          {/* Quick Case Switcher */}
          <div className="relative">
            <select
              value={order.order_id}
              onChange={(e) => onSelectCase(e.target.value)}
              className="appearance-none rounded-lg border border-slate-800 bg-slate-950/90 py-1.5 pl-3 pr-8 text-xs font-mono text-indigo-300 focus:border-indigo-500 focus:outline-none"
            >
              {allCases.map((c) => (
                <option key={c.order.order_id} value={c.order.order_id}>
                  {c.order.order_id} — {c.order.restaurant_name} (₹{c.order.total_amount})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {decision && (
            <button
              onClick={handleOpenOverride}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:text-white"
            >
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              <span>Manual Override</span>
            </button>
          )}

          <button
            onClick={() => onEvaluateCase(order.order_id)}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isEvaluating ? "animate-spin" : ""}`} />
            <span>{isEvaluating ? "Evaluating..." : decision ? "Re-Evaluate Case" : "Evaluate with AI Agent"}</span>
          </button>
        </div>
      </div>

      {/* Case Header Dossier Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950 p-5 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg font-mono font-bold text-white tracking-tight">
                {order.order_id}
              </span>
              <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-xs font-medium text-slate-300">
                {complaint.dispute_category.replace(/_/g, " ").toUpperCase()}
              </span>
              {decision?.status === "AUTO_RESOLVED" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Auto-Resolved by AI
                </span>
              )}
              {decision?.status === "NEEDS_HUMAN_REVIEW" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  Human Review Recommended (Confidence &lt; 60%)
                </span>
              )}
              {decision?.status === "FRAUD_SUSPECT_REVIEW" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                  <ShieldAlert className="h-3 w-3" />
                  Fraud Suspect Safety Gate
                </span>
              )}
              {decision?.status === "MANUALLY_OVERRIDDEN" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                  Controller Manually Overridden
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span>Customer: <strong className="text-slate-200">{order.customer_name}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Store className="h-3.5 w-3.5 text-orange-400" />
                <strong className="text-slate-200">{order.restaurant_name}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Bike className="h-3.5 w-3.5 text-sky-400" />
                <strong className="text-slate-200">{order.delivery_partner_name}</strong>
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex md:flex-col items-center md:items-end justify-between gap-1 shrink-0">
            <span className="text-[11px] text-slate-400">Total Transaction</span>
            <div className="text-xl font-bold font-mono text-white flex items-center gap-0.5">
              <IndianRupee className="h-4 w-4 text-slate-400" />
              <span>{order.total_amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Initial Split Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-300">Original Razorpay Route Split:</span>
            <span>Sum: ₹{order.total_amount}</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
            {order.split.map((s, idx) => (
              <div
                key={idx}
                style={{ width: `${s.percentage}%` }}
                title={`${s.party}: ₹${s.amount} (${s.percentage.toFixed(1)}%)`}
                className={`transition-all duration-500 ${
                  s.party === "restaurant"
                    ? "bg-orange-500"
                    : s.party === "delivery_partner"
                    ? "bg-sky-500"
                    : "bg-purple-500"
                }`}
              />
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
            {order.split.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1 font-mono">
                <span
                  className={`h-2 w-2 rounded-full ${
                    s.party === "restaurant"
                      ? "bg-orange-500"
                      : s.party === "delivery_partner"
                      ? "bg-sky-500"
                      : "bg-purple-500"
                  }`}
                />
                <span className="capitalize text-slate-300 font-sans">{s.party.replace("_", " ")}:</span>
                <span className="text-white font-semibold">₹{s.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DUAL TRUTH INSPECTOR (The Two Sources of Truth) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source 1: Customer Claim */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/20 text-rose-400 text-xs font-bold">
                  🗣️
                </div>
                <h4 className="text-xs font-semibold text-slate-200">
                  What The Customer Claimed
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Filed: {new Date(complaint.filed_at).toLocaleTimeString()}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-200 italic leading-relaxed">
              &quot;{complaint.customer_text}&quot;
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-950/40 p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Requested Remedy</span>
                <span className="font-semibold text-white capitalize">
                  {complaint.requested_action.replace("_", " ")}
                </span>
              </div>
              <div className="rounded-lg bg-slate-950/40 p-2 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Past 30d Disputes</span>
                <span
                  className={`font-semibold ${
                    complaint.customer_dispute_history_count >= 4
                      ? "text-rose-400 flex items-center gap-1"
                      : "text-slate-300"
                  }`}
                >
                  {complaint.customer_dispute_history_count} claims
                  {complaint.customer_dispute_history_count >= 4 && (
                    <span className="text-[10px] text-rose-400 font-normal">(High Risk)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-500">
            Subjective claim submitted via mobile application dispute interface.
          </div>
        </div>

        {/* Source 2: Objective Telemetry Recorded */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-bold">
                  🛰️
                </div>
                <h4 className="text-xs font-semibold text-slate-200">
                  What Machine Telemetry Recorded
                </h4>
              </div>
              <span className="text-[10px] rounded bg-indigo-500/10 px-2 py-0.5 text-indigo-300 border border-indigo-500/20 font-mono">
                Objective Ground Truth
              </span>
            </div>

            {/* Telemetry Timeline metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Kitchen Prep vs SLA */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Store className="h-3 w-3 text-orange-400" /> Kitchen Prep
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">SLA: {delivery_event.expected_prep_time_minutes}m</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span
                    className={`text-lg font-bold font-mono ${
                      delivery_event.kitchen_prep_time_minutes > delivery_event.expected_prep_time_minutes + 10
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {delivery_event.kitchen_prep_time_minutes}
                  </span>
                  <span className="text-xs text-slate-400">mins</span>
                </div>
              </div>

              {/* Rider Transit vs SLA */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Bike className="h-3 w-3 text-sky-400" /> Rider Transit
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">SLA: {delivery_event.expected_transit_time_minutes}m</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span
                    className={`text-lg font-bold font-mono ${
                      delivery_event.transit_time_minutes > delivery_event.expected_transit_time_minutes + 15
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {delivery_event.transit_time_minutes}
                  </span>
                  <span className="text-xs text-slate-400">mins</span>
                </div>
              </div>
            </div>

            {/* Delay Source Flag */}
            <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">Telemetry Delay Flag:</span>
                <span className="font-mono text-indigo-300 font-semibold text-[11px]">
                  {delivery_event.delay_source_flag}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-300">
                {delivery_event.telemetry_notes}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-500">
            Cryptographically signed timestamps recorded via Merchant POS &amp; Rider GPS.
          </div>
        </div>
      </div>

      {/* REASONING AGENT OUTPUT CENTER */}
      {decision ? (
        <div className="space-y-4">
          {/* Innocent Party Protected Callout (If Applicable) */}
          {decision.is_innocent_party_protected && (
            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/60 p-4 backdrop-blur-md shadow-lg shadow-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    🛡️ Innocent {decision.protected_party_type === "restaurant" ? "Merchant" : "Delivery Partner"} Protected
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    A naive policy would have deducted 100% (₹{decision.protected_amount}) from{" "}
                    <strong className="text-white">{decision.protected_party_name}</strong>. The Reasoning Agent correctly identified telemetry evidence attributing fault to logistics transit, saving the merchant ₹{decision.protected_amount}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fault Attribution Stacked Bar Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  AI Fault Attribution Split
                </h3>
                <p className="text-xs text-slate-400">
                  Responsibility attribution determined by dispute investigation pipeline
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Confidence Score:</span>
                <span
                  className={`text-sm font-mono font-bold rounded-lg px-2 py-0.5 ${
                    decision.confidence >= 80
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : decision.confidence >= 60
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {decision.confidence}%
                </span>
              </div>
            </div>

            {/* Stacked Horizontal Bar */}
            <div className="flex h-6 w-full overflow-hidden rounded-xl bg-slate-950 p-1 border border-slate-800">
              {decision.fault_attribution.restaurant > 0 && (
                <div
                  style={{ width: `${decision.fault_attribution.restaurant}%` }}
                  title={`Restaurant: ${decision.fault_attribution.restaurant}%`}
                  className="h-full rounded-lg bg-orange-500 transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white"
                >
                  {decision.fault_attribution.restaurant >= 15 ? `${decision.fault_attribution.restaurant}%` : ""}
                </div>
              )}
              {decision.fault_attribution.delivery_partner > 0 && (
                <div
                  style={{ width: `${decision.fault_attribution.delivery_partner}%` }}
                  title={`Delivery Partner: ${decision.fault_attribution.delivery_partner}%`}
                  className="h-full rounded-lg bg-sky-500 transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white"
                >
                  {decision.fault_attribution.delivery_partner >= 15 ? `${decision.fault_attribution.delivery_partner}%` : ""}
                </div>
              )}
              {decision.fault_attribution.platform > 0 && (
                <div
                  style={{ width: `${decision.fault_attribution.platform}%` }}
                  title={`Platform: ${decision.fault_attribution.platform}%`}
                  className="h-full rounded-lg bg-purple-500 transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white"
                >
                  {decision.fault_attribution.platform >= 15 ? `${decision.fault_attribution.platform}%` : ""}
                </div>
              )}
              {decision.fault_attribution.customer > 0 && (
                <div
                  style={{ width: `${decision.fault_attribution.customer}%` }}
                  title={`Customer: ${decision.fault_attribution.customer}%`}
                  className="h-full rounded-lg bg-emerald-500 transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white"
                >
                  {decision.fault_attribution.customer >= 15 ? `${decision.fault_attribution.customer}%` : ""}
                </div>
              )}
            </div>

            {/* Legends */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-2.5">
                <span className="text-[10px] text-orange-400 font-semibold block">Restaurant</span>
                <span className="text-base font-bold text-white font-mono">{decision.fault_attribution.restaurant}%</span>
              </div>
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-2.5">
                <span className="text-[10px] text-sky-400 font-semibold block">Delivery Partner</span>
                <span className="text-base font-bold text-white font-mono">{decision.fault_attribution.delivery_partner}%</span>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-2.5">
                <span className="text-[10px] text-purple-400 font-semibold block">Platform</span>
                <span className="text-base font-bold text-white font-mono">{decision.fault_attribution.platform}%</span>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                <span className="text-[10px] text-emerald-400 font-semibold block">Customer</span>
                <span className="text-base font-bold text-white font-mono">{decision.fault_attribution.customer}%</span>
              </div>
            </div>
          </div>

          {/* Reasoning & Justification Memos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Investigator Case Notes */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
                Agent Case Notes (Investigation Analysis)
              </h4>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 leading-relaxed font-sans">
                {decision.reasoning}
              </div>
            </div>

            {/* Dispute-Defense Justification Memo */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Formal Audit Justification Memo
                  </h4>
                  <button
                    onClick={handleCopyMemo}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {copiedMemo ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedMemo ? "Copied!" : "Copy Memo"}</span>
                  </button>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 leading-relaxed font-sans italic">
                  &quot;{decision.justification_memo}&quot;
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                Audit trail memo ready for presentation in merchant/rider chargeback portals.
              </p>
            </div>
          </div>

          {/* Route Reversal Settlement Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md">
            <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Deterministic Split-Reversal Calculations (Razorpay Route)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Exact rupee deductions calculated in Go math engine based on fault attribution
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Refund to Customer</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  ₹{decision.total_refund_to_customer.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-medium text-slate-400 bg-slate-900/40 uppercase">
                <tr>
                  <th className="py-2.5 pl-4 pr-2">Party</th>
                  <th className="py-2.5 px-3">Original Split</th>
                  <th className="py-2.5 px-3">Fault %</th>
                  <th className="py-2.5 px-3">Reversal Amount (Debit)</th>
                  <th className="py-2.5 pr-4 pl-2 text-right">Net Retained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {decision.reversals.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/30 transition">
                    <td className="py-2.5 pl-4 pr-2 font-sans font-medium text-white flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          r.party === "restaurant"
                            ? "bg-orange-500"
                            : r.party === "delivery_partner"
                            ? "bg-sky-500"
                            : "bg-purple-500"
                        }`}
                      />
                      <span>{r.party_name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">₹{r.original_amount}</td>
                    <td className="py-2.5 px-3 text-indigo-400 font-semibold">{r.fault_percentage}%</td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">
                      {r.reversal_amount > 0 ? `-₹${r.reversal_amount}` : "₹0.00"}
                    </td>
                    <td className="py-2.5 pr-4 pl-2 text-right text-emerald-400 font-bold">
                      ₹{r.net_retained}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-8 text-center backdrop-blur-md">
          <Sparkles className="h-10 w-10 text-indigo-400 mx-auto mb-2 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">
            Ready to Reason Over Case {order.order_id}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Click &quot;Evaluate with AI Agent&quot; above to attribute fault across parties and compute the deterministic split reversals.
          </p>
          <button
            onClick={() => onEvaluateCase(order.order_id)}
            disabled={isEvaluating}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isEvaluating ? "animate-spin" : ""}`} />
            <span>{isEvaluating ? "Evaluating..." : "Run AI Evaluation Now"}</span>
          </button>
        </div>
      )}

      {/* Human Controller Manual Override Modal */}
      {isOverrideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Manual Controller Override</h3>
              </div>
              <button
                onClick={() => setIsOverrideOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOverrideSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Reviewer Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1.5 px-3 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Sliders for percentages */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-orange-400 font-semibold">Restaurant Fault %</span>
                  <span className="font-mono">{overrideFault.restaurant}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overrideFault.restaurant}
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    const rem = 100 - r;
                    setOverrideFault({ ...overrideFault, restaurant: r, delivery_partner: rem, platform: 0, customer: 0 });
                  }}
                  className="w-full accent-orange-500"
                />

                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-sky-400 font-semibold">Delivery Partner Fault %</span>
                  <span className="font-mono">{overrideFault.delivery_partner}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overrideFault.delivery_partner}
                  onChange={(e) => {
                    const dp = Number(e.target.value);
                    const rem = 100 - dp;
                    setOverrideFault({ ...overrideFault, delivery_partner: dp, restaurant: rem, platform: 0, customer: 0 });
                  }}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reviewer Audit Notes</label>
                <textarea
                  rows={3}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Explain why the AI fault split is being adjusted..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(false)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Apply &amp; Recalculate Reversals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
