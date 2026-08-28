"use client";

import React, { useState } from "react";
import { AssembledCase, EvaluationDecision, FaultAttribution, HumanOverride } from "../types";
import {
  ArrowLeft,
  Play,
  ShieldCheck,
  AlertCircle,
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
  Scale,
  Cpu,
  UserCheck,
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
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-[#242D3D] bg-[#161B26] p-8">
        <FileText className="h-10 w-10 text-slate-500 mb-3" />
        <h3 className="text-base font-bold text-white">No Case Selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Select a dispute case from the Dispute Queue to inspect the telemetry dossier and causal attribution.
        </p>
        <button
          onClick={onBackToQueue}
          className="mt-4 flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#242D3D] bg-[#161B26] p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToQueue}
            className="flex items-center gap-1 rounded-md border border-[#242D3D] bg-[#0C111D] px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-[#334155] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dispute Queue</span>
          </button>

          {/* Quick Case Switcher */}
          <div className="relative">
            <select
              value={order.order_id}
              onChange={(e) => onSelectCase(e.target.value)}
              className="appearance-none rounded-md border border-[#242D3D] bg-[#0C111D] py-1.5 pl-3 pr-8 text-xs font-mono text-blue-300 focus:border-blue-500 focus:outline-none"
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
              className="flex items-center gap-1.5 rounded-md border border-[#334155] bg-[#0C111D] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-blue-500 hover:text-white"
            >
              <Sliders className="h-3.5 w-3.5 text-blue-400" />
              <span>Adjuster Override</span>
            </button>
          )}

          <button
            onClick={() => onEvaluateCase(order.order_id)}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 rounded-md bg-[#2563EB] hover:bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
          >
            <Play className={`h-3 w-3 fill-current ${isEvaluating ? "animate-spin" : ""}`} />
            <span>{isEvaluating ? "Analyzing Telemetry..." : decision ? "Re-Run Attribution Engine" : "Run Attribution Engine"}</span>
          </button>
        </div>
      </div>

      {/* Case Header Dossier Banner */}
      <div className="rounded-xl border border-[#242D3D] bg-[#161B26] p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg font-mono font-bold text-white tracking-tight">
                {order.order_id}
              </span>
              <span className="rounded border border-[#242D3D] bg-[#0C111D] px-2 py-0.5 text-xs font-semibold text-slate-300">
                {complaint.dispute_category.replace(/_/g, " ").toUpperCase()}
              </span>
              {decision?.status === "AUTO_RESOLVED" && (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Autonomous Settlement (Conclusive Ground Truth)
                </span>
              )}
              {decision?.status === "NEEDS_HUMAN_REVIEW" && (
                <span className="inline-flex items-center gap-1 rounded border border-[#D97706]/40 bg-amber-950/40 px-2 py-0.5 text-xs font-semibold text-[#F59E0B]">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Ambiguous Evidence Hold (Confidence &lt; 60%)
                </span>
              )}
              {decision?.status === "FRAUD_SUSPECT_REVIEW" && (
                <span className="inline-flex items-center gap-1 rounded border border-rose-500/40 bg-rose-950/40 px-2 py-0.5 text-xs font-semibold text-rose-300">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  High-Velocity Claim Hold (&ge;4 disputes/30d)
                </span>
              )}
              {decision?.status === "MANUALLY_OVERRIDDEN" && (
                <span className="inline-flex items-center gap-1 rounded border border-blue-500/40 bg-blue-950/40 px-2 py-0.5 text-xs font-semibold text-blue-300">
                  Adjuster Manual Override Applied
                </span>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span>Customer: <strong className="text-white">{order.customer_name}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <Store className="h-3.5 w-3.5 text-[#D97706]" />
                Merchant: <strong className="text-white">{order.restaurant_name}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <Bike className="h-3.5 w-3.5 text-[#0284C7]" />
                Carrier: <strong className="text-white">{order.delivery_partner_name}</strong>
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="rounded-lg border border-[#242D3D] bg-[#0C111D] p-3 flex md:flex-col items-center md:items-end justify-between gap-1 shrink-0">
            <span className="text-[11px] text-slate-400">Total Dispute Transaction</span>
            <div className="text-xl font-bold font-mono text-white flex items-center gap-0.5">
              <IndianRupee className="h-4 w-4 text-slate-400" />
              <span>{order.total_amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Initial Split Ledger Bar */}
        <div className="mt-4 pt-4 border-t border-[#242D3D]">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-300">Original Razorpay Route Escrow Split:</span>
            <span className="font-mono">Sum: ₹{order.total_amount.toFixed(2)}</span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded bg-[#0C111D] border border-[#242D3D]">
            {order.split.map((s, idx) => (
              <div
                key={idx}
                style={{ width: `${s.percentage}%` }}
                title={`${s.party}: ₹${s.amount} (${s.percentage.toFixed(1)}%)`}
                className={`transition-all duration-300 ${
                  s.party === "restaurant"
                    ? "bg-[#D97706]"
                    : s.party === "delivery_partner"
                    ? "bg-[#0284C7]"
                    : "bg-[#7C3AED]"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
            {order.split.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 font-mono">
                <span
                  className={`h-2 w-2 rounded-full ${
                    s.party === "restaurant"
                      ? "bg-[#D97706]"
                      : s.party === "delivery_partner"
                      ? "bg-[#0284C7]"
                      : "bg-[#7C3AED]"
                  }`}
                />
                <span className="capitalize text-slate-300 font-sans">{s.party.replace("_", " ")}:</span>
                <span className="text-white font-semibold">₹{s.amount.toFixed(2)}</span>
                <span className="text-slate-500 font-sans">({s.percentage.toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DUAL TRUTH INSPECTOR (Side-by-Side Claim vs Telemetry) */}
      <div className="space-y-2">
        {/* Panel Framing Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Scale className="h-4 w-4 text-blue-400" />
            <span>Dual-Source Ground Truth Inspector</span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            The agent weighs objective delivery telemetry against subjective customer claims when accounts conflict.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source 1: Customer Claim */}
          <div className="rounded-xl border border-[#242D3D] bg-[#161B26] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#242D3D] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-bold">
                    🗣️
                  </span>
                  <h4 className="text-xs font-semibold text-slate-200">
                    What The Customer Claimed
                  </h4>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Filed: {new Date(complaint.filed_at).toLocaleTimeString()}
                </span>
              </div>

              <div className="rounded-lg border border-[#242D3D] bg-[#0C111D] p-3.5 text-xs text-slate-200 italic leading-relaxed">
                &quot;{complaint.customer_text}&quot;
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-[#0C111D] p-2 border border-[#242D3D]">
                  <span className="text-[10px] text-slate-400 block font-medium">Requested Remedy</span>
                  <span className="font-semibold text-white capitalize">
                    {complaint.requested_action.replace("_", " ")}
                  </span>
                </div>
                <div className="rounded-lg bg-[#0C111D] p-2 border border-[#242D3D]">
                  <span className="text-[10px] text-slate-400 block font-medium">Past 30d Claims</span>
                  <span
                    className={`font-semibold ${
                      complaint.customer_dispute_history_count >= 4
                        ? "text-rose-400 flex items-center gap-1"
                        : "text-slate-300"
                    }`}
                  >
                    {complaint.customer_dispute_history_count} disputes
                    {complaint.customer_dispute_history_count >= 4 && (
                      <span className="text-[10px] text-rose-300 font-normal">(High Risk Hold)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#242D3D] text-[11px] text-slate-500">
              Subjective statement submitted via consumer mobile dispute form.
            </div>
          </div>

          {/* Source 2: Objective Telemetry Ground Truth */}
          <div className="rounded-xl border border-[#242D3D] bg-[#161B26] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#242D3D] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-bold">
                    🛰️
                  </span>
                  <h4 className="text-xs font-semibold text-slate-200">
                    What Machine Telemetry Recorded
                  </h4>
                </div>
                <span className="text-[10px] rounded border border-blue-500/30 bg-blue-950/50 px-1.5 py-0.5 text-blue-300 font-mono">
                  Signed Ground Truth
                </span>
              </div>

              {/* Telemetry Timeline Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Kitchen Prep vs SLA */}
                <div className="rounded-lg border border-[#242D3D] bg-[#0C111D] p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Store className="h-3 w-3 text-[#D97706]" /> Kitchen Prep
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
                <div className="rounded-lg border border-[#242D3D] bg-[#0C111D] p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Bike className="h-3 w-3 text-[#0284C7]" /> Carrier Transit
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
              <div className="mt-2 rounded-lg border border-[#242D3D] bg-[#0C111D] p-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Telemetry Delay Tag:</span>
                  <span className="font-mono text-blue-300 font-semibold text-[11px]">
                    {delivery_event.delay_source_flag}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  {delivery_event.telemetry_notes}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#242D3D] text-[11px] text-slate-500">
              Verified timestamps from Merchant POS terminal &amp; Carrier GPS hardware.
            </div>
          </div>
        </div>
      </div>

      {/* SIGNATURE VISUAL CENTERPIECE: FAULT ATTRIBUTION & CAUSAL SETTLEMENT */}
      {decision ? (
        <div className="space-y-4">
          {/* Innocent Party Protected Causal Outcome Banner */}
          {decision.is_innocent_party_protected && (
            <div className="rounded-xl border border-emerald-500/40 bg-[#161B26] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 mt-0.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-emerald-300">
                      Innocent {decision.protected_party_type === "restaurant" ? "Merchant" : "Carrier"} Protected from Unfair Chargeback
                    </h4>
                    <span className="rounded bg-emerald-950 px-2 py-0.5 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/30">
                      ₹{decision.protected_amount.toFixed(2)} Preserved
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A naive marketplace policy would have automatically deducted 100% (₹{decision.protected_amount}) from <strong className="text-white">{decision.protected_party_name}</strong>. The Dispute Engine examined telemetry ground truth, identified the delay occurred in carrier transit, and spared the merchant from unfair liability.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* THE SIGNATURE ATTRIBUTION CENTERPIECE */}
          <div className="rounded-xl border border-[#242D3D] bg-[#161B26] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#242D3D] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  Fault-Attribution &amp; Reversal Allocation Centerpiece
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Exact liability percentage determined by evidence pipeline and executed in Go math engine
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Confidence Score:</span>
                <span
                  className={`text-sm font-mono font-bold rounded px-2.5 py-0.5 border ${
                    decision.confidence >= 80
                      ? "bg-emerald-950 text-emerald-400 border-emerald-500/30"
                      : decision.confidence >= 60
                      ? "bg-amber-950 text-amber-400 border-[#D97706]/30"
                      : "bg-rose-950 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {decision.confidence}%
                </span>
              </div>
            </div>

            {/* Signature Segmented Attribution Ribbon */}
            <div className="space-y-1.5">
              <div className="flex h-7 w-full overflow-hidden rounded-lg bg-[#0C111D] p-1 border border-[#242D3D]">
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
                    {decision.fault_attribution.delivery_partner >= 10 ? `Carrier: ${decision.fault_attribution.delivery_partner}%` : ""}
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

              {/* Attribution Segment Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div className="rounded-lg border border-[#D97706]/30 bg-[#0C111D] p-2.5">
                  <span className="text-[10px] text-[#D97706] font-semibold block">Merchant Prep Fault</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-bold text-white font-mono">{decision.fault_attribution.restaurant}%</span>
                    <span className="text-[10px] text-slate-400 font-sans">liability</span>
                  </div>
                </div>
                <div className="rounded-lg border border-[#0284C7]/30 bg-[#0C111D] p-2.5">
                  <span className="text-[10px] text-[#0284C7] font-semibold block">Carrier Transit Fault</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-bold text-white font-mono">{decision.fault_attribution.delivery_partner}%</span>
                    <span className="text-[10px] text-slate-400 font-sans">liability</span>
                  </div>
                </div>
                <div className="rounded-lg border border-[#7C3AED]/30 bg-[#0C111D] p-2.5">
                  <span className="text-[10px] text-[#A78BFA] font-semibold block">Platform Outage Fault</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-bold text-white font-mono">{decision.fault_attribution.platform}%</span>
                    <span className="text-[10px] text-slate-400 font-sans">liability</span>
                  </div>
                </div>
                <div className="rounded-lg border border-[#059669]/30 bg-[#0C111D] p-2.5">
                  <span className="text-[10px] text-emerald-400 font-semibold block">Customer Remorse</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-bold text-white font-mono">{decision.fault_attribution.customer}%</span>
                    <span className="text-[10px] text-slate-400 font-sans">non-refundable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning & Formal Justification Audit Dossier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Investigator Case Notes */}
            <div className="rounded-xl border border-[#242D3D] bg-[#161B26] p-4">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <FileText className="h-3.5 w-3.5 text-blue-400" />
                Dispute Investigation Case Analysis
              </h4>
              <div className="rounded-lg border border-[#242D3D] bg-[#0C111D] p-3 text-xs text-slate-300 leading-relaxed font-sans">
                {decision.reasoning}
              </div>
            </div>

            {/* Dispute-Defense Justification Memo */}
            <div className="rounded-xl border border-[#242D3D] bg-[#161B26] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Formal Audit Justification Memo
                  </h4>
                  <button
                    onClick={handleCopyMemo}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition"
                  >
                    {copiedMemo ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedMemo ? "Copied" : "Copy Memo"}</span>
                  </button>
                </div>
                <div className="rounded-lg border border-[#242D3D] bg-[#0C111D] p-3 text-xs text-slate-300 leading-relaxed italic">
                  &quot;{decision.justification_memo}&quot;
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                Audit trail memorandum formatted for merchant/rider dispute dispute resolution portals.
              </p>
            </div>
          </div>

          {/* Deterministic Split-Reversal Calculations Table */}
          <div className="overflow-hidden rounded-xl border border-[#242D3D] bg-[#161B26]">
            <div className="border-b border-[#242D3D] bg-[#0C111D] px-4 py-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Deterministic Split-Reversal Calculations (Razorpay Route)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Exact rupee debits computed via Go arithmetic engine based on fault attribution
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Refund Debited</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  ₹{decision.total_refund_to_customer.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#242D3D] text-[11px] font-medium text-slate-400 bg-[#161B26] uppercase">
                <tr>
                  <th className="py-2.5 pl-4 pr-2">Marketplace Party</th>
                  <th className="py-2.5 px-3">Original Escrow Split</th>
                  <th className="py-2.5 px-3">Attributed Fault</th>
                  <th className="py-2.5 px-3">Reversal Debit</th>
                  <th className="py-2.5 pr-4 pl-2 text-right">Net Payout Retained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242D3D]/70 font-mono">
                {decision.reversals.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#1F2430]/40 transition">
                    <td className="py-2.5 pl-4 pr-2 font-sans font-medium text-white flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          r.party === "restaurant"
                            ? "bg-[#D97706]"
                            : r.party === "delivery_partner"
                            ? "bg-[#0284C7]"
                            : "bg-[#7C3AED]"
                        }`}
                      />
                      <span>{r.party_name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">₹{r.original_amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-blue-400 font-semibold">{r.fault_percentage}%</td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">
                      {r.reversal_amount > 0 ? `-₹${r.reversal_amount.toFixed(2)}` : "₹0.00"}
                    </td>
                    <td className="py-2.5 pr-4 pl-2 text-right text-emerald-400 font-bold">
                      ₹{r.net_retained.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#242D3D] bg-[#161B26] p-8 text-center">
          <Play className="h-8 w-8 text-blue-400 mx-auto mb-2 fill-current" />
          <h3 className="text-sm font-bold text-white">
            Dispute Ready for Decision Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Click &quot;Run Attribution Engine&quot; to synthesize machine telemetry ground truth against customer claims and calculate deterministic split reversals.
          </p>
          <button
            onClick={() => onEvaluateCase(order.order_id)}
            disabled={isEvaluating}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 transition disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 fill-current ${isEvaluating ? "animate-spin" : ""}`} />
            <span>{isEvaluating ? "Evaluating Case..." : "Run Attribution Engine Now"}</span>
          </button>
        </div>
      )}

      {/* Adjuster Manual Override Modal */}
      {isOverrideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-[#242D3D] bg-[#161B26] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242D3D] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Adjuster Manual Override</h3>
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
                <label className="text-slate-400 block mb-1 font-medium">Adjuster Identifier</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full rounded-md border border-[#242D3D] bg-[#0C111D] py-1.5 px-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Sliders for percentages */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-[#D97706] font-semibold">Merchant Fault %</span>
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
                  className="w-full accent-[#D97706]"
                />

                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-[#0284C7] font-semibold">Carrier Fault %</span>
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
                  className="w-full accent-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Adjuster Audit Justification Notes</label>
                <textarea
                  rows={3}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Explain why the engine fault split is being adjusted..."
                  className="w-full rounded-md border border-[#242D3D] bg-[#0C111D] p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(false)}
                  className="rounded-md border border-[#242D3D] bg-[#0C111D] px-3 py-1.5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#2563EB] px-4 py-1.5 font-semibold text-white hover:bg-blue-600"
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
