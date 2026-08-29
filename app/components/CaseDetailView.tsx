"use client";

import React, { useState } from "react";
import { AssembledCase, EvaluationDecision, FaultAttribution, HumanOverride } from "../types";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Gavel,
  Copy,
  Check,
  Store,
  Bike,
  IndianRupee,
  FileText,
  Sliders,
  X,
  ChevronDown,
  Scale,
  UserCheck,
  Info,
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
  const [reviewerName, setReviewerName] = useState("Lead Dispute Adjuster");

  if (!assembledCase) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-slate-200 bg-white p-8 shadow-xs">
        <FileText className="h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Case Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Select a dispute case from the Dispute Queue to inspect the telemetry dossier and causal attribution.
        </p>
        <button
          onClick={onBackToQueue}
          className="mt-4 flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Dispute Queue</span>
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
    setOverrideNotes(decision?.reasoning ? `Adjusted from engine finding: ${decision.reasoning}` : "");
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToQueue}
            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dispute Queue</span>
          </button>

          {/* Quick Case Switcher */}
          <div className="relative">
            <select
              value={order.order_id}
              onChange={(e) => onSelectCase(e.target.value)}
              className="appearance-none rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-8 text-xs font-mono text-blue-700 font-medium focus:border-blue-500 focus:bg-white focus:outline-none shadow-xs"
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
              title="Human-in-the-loop oversight: Adjusters can manually override autonomous rulings within 72 hours if new evidence emerges"
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50"
            >
              <Sliders className="h-3.5 w-3.5 text-blue-600" />
              <span>Adjuster Override</span>
            </button>
          )}

          <button
            onClick={() => onEvaluateCase(order.order_id)}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50"
          >
            <Play className={`h-3 w-3 fill-current ${isEvaluating ? "animate-spin" : ""}`} />
            <span>{isEvaluating ? "Analyzing Telemetry..." : decision ? "Re-Run Attribution Engine" : "Run Attribution Engine Now"}</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg font-mono font-bold text-slate-900 tracking-tight">
                {order.order_id}
              </span>
              <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {complaint.dispute_category.replace(/_/g, " ").toUpperCase()}
              </span>
              {decision?.status === "AUTO_RESOLVED" && (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Autonomous Settlement (Conclusive Ground Truth)
                </span>
              )}
              {decision?.status === "NEEDS_HUMAN_REVIEW" && (
                <span className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                  <AlertCircle className="h-3.5 w-3.5 text-[#D97706]" />
                  Ambiguous Evidence Hold (Confidence &lt; 60%)
                </span>
              )}
              {decision?.status === "FRAUD_SUSPECT_REVIEW" && (
                <span className="inline-flex items-center gap-1 rounded border border-rose-300 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-800">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                  High-Velocity Claim Hold (&ge;4 disputes/30d)
                </span>
              )}
              {decision?.status === "MANUALLY_OVERRIDDEN" && (
                <span className="inline-flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
                  Adjuster Manual Override Applied
                </span>
              )}
            </div>

            {decision?.status === "AUTO_RESOLVED" && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200/80 rounded-md px-2.5 py-1 max-w-2xl">
                <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>
                  Autonomous settlements are reversible via <strong>Adjuster Override</strong> within a 72-hour dispute window if new telemetry or counterparty appeals emerge.
                </span>
              </div>
            )}

            <div className="mt-2.5 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span>Customer: <strong className="text-slate-900">{order.customer_name}</strong></span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Store className="h-3.5 w-3.5 text-[#D97706]" />
                Merchant: <strong className="text-slate-900">{order.restaurant_name}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Bike className="h-3.5 w-3.5 text-[#0284C7]" />
                Delivery Partner: <strong className="text-slate-900">{order.delivery_partner_name}</strong>
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex md:flex-col items-center md:items-end justify-between gap-1 shrink-0">
            <span className="text-[11px] text-slate-500 font-medium">Total Dispute Transaction</span>
            <div className="text-xl font-bold font-mono text-slate-900 flex items-center gap-0.5">
              <IndianRupee className="h-4 w-4 text-slate-500" />
              <span>{order.total_amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Initial Split Ledger Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700">Original Razorpay Route Escrow Split:</span>
            <span className="font-mono text-slate-900">Sum: ₹{order.total_amount.toFixed(2)}</span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded bg-slate-100 border border-slate-200">
            {order.split.map((s, idx) => (
              <div
                key={idx}
                style={{ width: `${s.percentage}%` }}
                title={`${s.party === "restaurant" ? "Merchant" : s.party === "delivery_partner" ? "Delivery Partner" : "Platform"}: ₹${s.amount} (${s.percentage.toFixed(1)}%)`}
                className={`transition-all duration-300 ${s.party === "restaurant"
                  ? "bg-[#D97706]"
                  : s.party === "delivery_partner"
                    ? "bg-[#0284C7]"
                    : "bg-[#7C3AED]"
                  }`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
            {order.split.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 font-mono">
                <span
                  className={`h-2 w-2 rounded-full ${s.party === "restaurant"
                    ? "bg-[#D97706]"
                    : s.party === "delivery_partner"
                      ? "bg-[#0284C7]"
                      : "bg-[#7C3AED]"
                    }`}
                />
                <span className="text-slate-700 font-sans">
                  {s.party === "restaurant" ? "Merchant" : s.party === "delivery_partner" ? "Delivery Partner" : "Platform"}:
                </span>
                <span className="text-slate-900 font-semibold">₹{s.amount.toFixed(2)}</span>
                <span className="text-slate-400 font-sans">({s.percentage.toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DUAL TRUTH INSPECTOR (Side-by-Side Claim vs Telemetry) */}
      <div className="space-y-2">
        {/* Panel Framing Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Scale className="h-4 w-4 text-blue-600" />
            <span>Dual-Source Ground Truth Inspector</span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            The agent weighs objective delivery telemetry against subjective customer claims when accounts conflict.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source 1: Customer Claim */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    🗣️
                  </span>
                  <h4 className="text-xs font-semibold text-slate-900">
                    What The Customer Claimed
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Filed: {new Date(complaint.filed_at).toLocaleTimeString()}
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-800 italic leading-relaxed">
                &quot;{complaint.customer_text}&quot;
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Requested Remedy</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {complaint.requested_action.replace("_", " ")}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Past 30d Claims</span>
                  <span
                    className={`font-semibold ${complaint.customer_dispute_history_count >= 4
                      ? "text-rose-600 flex items-center gap-1"
                      : "text-slate-800"
                      }`}
                  >
                    {complaint.customer_dispute_history_count} disputes
                    {complaint.customer_dispute_history_count >= 4 && (
                      <span className="text-[10px] text-rose-600 font-normal">(High Risk Hold)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
              Subjective statement submitted via consumer mobile dispute form.
            </div>
          </div>

          {/* Source 2: Objective Telemetry Ground Truth */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                    🛰️
                  </span>
                  <h4 className="text-xs font-semibold text-slate-900">
                    What Machine Telemetry Recorded
                  </h4>
                </div>
                <span className="text-[10px] rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-blue-700 font-mono font-medium">
                  Signed Ground Truth
                </span>
              </div>

              {/* Telemetry Timeline Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Merchant Prep vs SLA */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 flex items-center gap-1 font-medium">
                      <Store className="h-3 w-3 text-[#D97706]" /> Merchant Prep Time
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">SLA: {delivery_event.expected_prep_time_minutes}m</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span
                      className={`text-lg font-bold font-mono ${delivery_event.kitchen_prep_time_minutes > delivery_event.expected_prep_time_minutes + 10
                        ? "text-rose-600"
                        : "text-emerald-700"
                        }`}
                    >
                      {delivery_event.kitchen_prep_time_minutes}
                    </span>
                    <span className="text-xs text-slate-500">mins</span>
                  </div>
                </div>

                {/* Delivery Partner Transit vs SLA */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 flex items-center gap-1 font-medium">
                      <Bike className="h-3 w-3 text-[#0284C7]" /> Delivery Partner Transit Time
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">SLA: {delivery_event.expected_transit_time_minutes}m</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span
                      className={`text-lg font-bold font-mono ${delivery_event.transit_time_minutes > delivery_event.expected_transit_time_minutes + 15
                        ? "text-rose-600"
                        : "text-emerald-700"
                        }`}
                    >
                      {delivery_event.transit_time_minutes}
                    </span>
                    <span className="text-xs text-slate-500">mins</span>
                  </div>
                </div>
              </div>

              {/* Delay Source Flag */}
              <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-600 font-medium">Telemetry Delay Tag:</span>
                  <span className="font-mono text-blue-700 font-semibold text-[11px]">
                    {delivery_event.delay_source_flag}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-700">
                  {delivery_event.telemetry_notes}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
              Verified timestamps from Merchant POS terminal &amp; Delivery Partner GPS hardware.
            </div>
          </div>
        </div>
      </div>

      {decision ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
                  <Gavel className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Final Attribution</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dual-truth telemetry ground truth synthesis and deterministic split-reversal allocation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {decision.status === "AUTO_RESOLVED" && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>AUTONOMOUS VERDICT ISSUED</span>
                  </span>
                )}
                {decision.status === "NEEDS_HUMAN_REVIEW" && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                    <AlertCircle className="h-3.5 w-3.5 text-[#D97706]" />
                    <span>AMBIGUOUS HOLD FOR ADJUSTER</span>
                  </span>
                )}
                {decision.status === "FRAUD_SUSPECT_REVIEW" && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                    <span>POLICY ABUSE WATCH HOLD</span>
                  </span>
                )}
                {decision.status === "MANUALLY_OVERRIDDEN" && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">
                    <span>ADJUSTER MANUAL OVERRIDE</span>
                  </span>
                )}
                <span
                  className={`text-xs font-mono font-bold rounded px-2.5 py-1 border ${decision.confidence >= 80
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : decision.confidence >= 60
                      ? "bg-amber-50 text-amber-900 border-amber-300"
                      : "bg-rose-50 text-rose-800 border-rose-300"
                    }`}
                >
                  Confidence: {decision.confidence}%
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-slate-800 leading-relaxed shadow-2xs">
              <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-blue-700 font-bold">Causal Justification:</span>
                <span className="font-mono text-slate-600 text-[11px] bg-white border border-slate-200 rounded px-1.5 py-0.5">
                  {decision.primary_cause.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <p className="text-slate-800 text-xs font-medium leading-relaxed">{decision.reasoning}</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex h-7 w-full overflow-hidden rounded-lg bg-slate-100 p-1 border border-slate-200">
                {decision.fault_attribution.restaurant > 0 && (
                  <div
                    style={{ width: `${decision.fault_attribution.restaurant}%` }}
                    className="h-full rounded bg-[#D97706] transition-all duration-500 flex items-center justify-center text-[10px] font-mono font-bold text-white"
                  >
                    {decision.fault_attribution.restaurant >= 10 ? `Merchant: ${decision.fault_attribution.restaurant}%` : ""}
                  </div>
                )}
                {decision.fault_attribution.delivery_partner > 0 && (
                  <div
                    style={{ width: `${decision.fault_attribution.delivery_partner}%` }}
                    className="h-full rounded bg-[#0284C7] transition-all duration-500 flex items-center justify-center text-[10px] font-mono font-bold text-white"
                  >
                    {decision.fault_attribution.delivery_partner >= 10 ? `Delivery Partner: ${decision.fault_attribution.delivery_partner}%` : ""}
                  </div>
                )}
                {decision.fault_attribution.platform > 0 && (
                  <div
                    style={{ width: `${decision.fault_attribution.platform}%` }}
                    className="h-full rounded bg-[#7C3AED] transition-all duration-500 flex items-center justify-center text-[10px] font-mono font-bold text-white"
                  >
                    {decision.fault_attribution.platform >= 10 ? `Platform: ${decision.fault_attribution.platform}%` : ""}
                  </div>
                )}
                {decision.fault_attribution.customer > 0 && (
                  <div
                    style={{ width: `${decision.fault_attribution.customer}%` }}
                    className="h-full rounded bg-[#059669] transition-all duration-500 flex items-center justify-center text-[10px] font-mono font-bold text-white"
                  >
                    {decision.fault_attribution.customer >= 10 ? `Customer: ${decision.fault_attribution.customer}%` : ""}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#B45309] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Store className="h-3 w-3" /> Merchant
                    </span>
                    <span className="font-mono font-bold text-amber-800 text-xs">{decision.fault_attribution.restaurant}%</span>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Reversal:</span>
                      <span className="font-mono font-semibold text-rose-600">
                        {(() => {
                          const r = decision.reversals.find((x) => x.party === "restaurant");
                          return r && r.reversal_amount > 0 ? `-₹${r.reversal_amount.toFixed(2)}` : "₹0.00";
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Retained:</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        {(() => {
                          const r = decision.reversals.find((x) => x.party === "restaurant");
                          return r ? `₹${r.net_retained.toFixed(2)}` : "₹0.00";
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-sky-200 bg-sky-50/40 p-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#0369A1] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Bike className="h-3 w-3" /> Delivery Partner
                    </span>
                    <span className="font-mono font-bold text-sky-800 text-xs">{decision.fault_attribution.delivery_partner}%</span>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Reversal:</span>
                      <span className="font-mono font-semibold text-rose-600">
                        {(() => {
                          const r = decision.reversals.find((x) => x.party === "delivery_partner");
                          return r && r.reversal_amount > 0 ? `-₹${r.reversal_amount.toFixed(2)}` : "₹0.00";
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Retained:</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        {(() => {
                          const r = decision.reversals.find((x) => x.party === "delivery_partner");
                          return r ? `₹${r.net_retained.toFixed(2)}` : "₹0.00";
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#6D28D9] font-bold uppercase tracking-wider">Platform Subsidy</span>
                    <span className="font-mono font-bold text-purple-800 text-xs">{decision.fault_attribution.platform}%</span>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Platform Cost:</span>
                      <span className="font-mono font-semibold text-purple-700">
                        {decision.fault_attribution.platform > 0 ? `₹${decision.total_refund_to_customer.toFixed(2)}` : "₹0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Policy:</span>
                      <span className="text-[10px] text-slate-600 truncate">{decision.fault_attribution.platform > 0 ? "Absorbed" : "Standard"}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#047857] font-bold uppercase tracking-wider">Customer Outcome</span>
                    <span className="font-mono font-bold text-emerald-800 text-xs">{decision.fault_attribution.customer}%</span>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Refund Debited:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ₹{decision.total_refund_to_customer.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Status:</span>
                      <span className="text-[10px] font-semibold text-slate-700">
                        {decision.total_refund_to_customer > 0 ? "Refund Executed" : "Declined"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-2">
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                Dispute Investigation Case Analysis
              </h4>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed font-sans">
                {decision.reasoning}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Formal Audit Justification Memo
                  </h4>
                  <button
                    onClick={handleCopyMemo}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium transition"
                  >
                    {copiedMemo ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedMemo ? "Copied" : "Copy Memo"}</span>
                  </button>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed italic">
                  &quot;{decision.justification_memo}&quot;
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                Audit trail memorandum formatted for Merchant and Delivery Partner dispute resolution portals.
              </p>
            </div>
          </div>

          {/* Deterministic Split-Reversal Calculations Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Deterministic Split-Reversal Calculations (Razorpay Route)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Exact rupee debits computed via Go arithmetic engine based on fault attribution
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Customer Refund Debited (Gross Reversal)</span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  ₹{decision.total_refund_to_customer.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[11px] font-medium text-slate-500 bg-slate-50 uppercase">
                <tr>
                  <th className="py-2.5 pl-4 pr-2">Marketplace Party</th>
                  <th className="py-2.5 px-3">Original Escrow Split</th>
                  <th className="py-2.5 px-3">Attributed Fault</th>
                  <th className="py-2.5 px-3">Reversal Debit</th>
                  <th className="py-2.5 pr-4 pl-2 text-right">Net Payout Retained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {decision.reversals.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 pl-4 pr-2 font-sans font-medium text-slate-900 flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${r.party === "restaurant"
                          ? "bg-[#D97706]"
                          : r.party === "delivery_partner"
                            ? "bg-[#0284C7]"
                            : "bg-[#7C3AED]"
                          }`}
                      />
                      <span>{r.party_name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">₹{r.original_amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-blue-700 font-semibold">{r.fault_percentage}%</td>
                    <td className="py-2.5 px-3 text-rose-600 font-bold">
                      {r.reversal_amount > 0 ? `-₹${r.reversal_amount.toFixed(2)}` : "₹0.00"}
                    </td>
                    <td className="py-2.5 pr-4 pl-2 text-right text-emerald-700 font-bold">
                      ₹{r.net_retained.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <Play className="h-8 w-8 text-blue-600 mx-auto mb-2 fill-current" />
          <h3 className="text-sm font-bold text-slate-900">
            Dispute Ready for Decision Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Click &quot;Run Attribution Engine&quot; to synthesize machine telemetry ground truth against customer claims and calculate deterministic split reversals.
          </p>
          <button
            onClick={() => onEvaluateCase(order.order_id)}
            disabled={isEvaluating}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 fill-current ${isEvaluating ? "animate-spin" : ""}`} />
            <span>{isEvaluating ? "Evaluating Case..." : "Run Attribution Engine Now"}</span>
          </button>
        </div>
      )}

      {/* Adjuster Manual Override Modal */}
      {isOverrideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Adjuster Manual Override</h3>
                </div>
                <button
                  onClick={() => setIsOverrideOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Human-in-the-loop governance: Senior adjusters can supersede automated attribution and adjust party split liability during the 72-hour dispute window.
              </p>
            </div>

            <form onSubmit={handleSaveOverrideSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-medium">Adjuster Identifier</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Sliders for percentages */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center text-slate-800">
                  <span className="text-[#D97706] font-bold">Merchant Fault %</span>
                  <span className="font-mono font-bold">{overrideFault.restaurant}%</span>
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
                  className="w-full accent-[#D97706]"
                />

                <div className="flex justify-between items-center text-slate-800">
                  <span className="text-[#0284C7] font-bold">Delivery Partner Fault %</span>
                  <span className="font-mono font-bold">{overrideFault.delivery_partner}%</span>
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
                  className="w-full accent-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">Adjuster Audit Justification Notes</label>
                <textarea
                  rows={3}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Explain why the engine fault split is being adjusted..."
                  className="w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(false)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  Save &amp; Recalculate Split Reversals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
