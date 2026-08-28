"use client";

import React, { useState, useMemo } from "react";
import { CaseListItem } from "../types";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Store,
  Bike,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

interface CaseQueueViewProps {
  cases: CaseListItem[];
  onSelectCase: (orderId: string) => void;
  onEvaluateCase: (orderId: string) => void;
  evaluatingOrderId: string | null;
}

export const CaseQueueView: React.FC<CaseQueueViewProps> = ({
  cases,
  onSelectCase,
  onEvaluateCase,
  evaluatingOrderId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [archetypeFilter, setArchetypeFilter] = useState<string>("ALL");

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.rider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_text.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "AUTO_RESOLVED" && c.status === "AUTO_RESOLVED") ||
        (statusFilter === "NEEDS_HUMAN_REVIEW" && (c.status === "NEEDS_HUMAN_REVIEW" || c.status === "MANUALLY_OVERRIDDEN")) ||
        (statusFilter === "FRAUD_SUSPECT_REVIEW" && c.status === "FRAUD_SUSPECT_REVIEW") ||
        (statusFilter === "PENDING" && c.status === "PENDING") ||
        (statusFilter === "PROTECTED" && c.decision?.is_innocent_party_protected);

      const matchesArchetype =
        archetypeFilter === "ALL" || c.archetype === archetypeFilter;

      return matchesSearch && matchesStatus && matchesArchetype;
    });
  }, [cases, searchTerm, statusFilter, archetypeFilter]);

  const counts = useMemo(() => {
    let auto = 0, review = 0, fraud = 0, protectedCount = 0, pending = 0;
    for (const c of cases) {
      if (c.status === "AUTO_RESOLVED") auto++;
      else if (c.status === "FRAUD_SUSPECT_REVIEW") fraud++;
      else if (c.status === "PENDING") pending++;
      else review++;

      if (c.decision?.is_innocent_party_protected) protectedCount++;
    }
    return { all: cases.length, auto, review, fraud, protectedCount, pending };
  }, [cases]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Restaurant, Rider, or complaint text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "ALL"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter("AUTO_RESOLVED")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "AUTO_RESOLVED"
                ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Auto ({counts.auto})</span>
          </button>
          <button
            onClick={() => setStatusFilter("PROTECTED")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "PROTECTED"
                ? "bg-indigo-950/80 border border-indigo-500/40 text-indigo-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3 w-3 text-indigo-400" />
            <span>Protected ({counts.protectedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter("NEEDS_HUMAN_REVIEW")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "NEEDS_HUMAN_REVIEW"
                ? "bg-amber-950/80 border border-amber-500/40 text-amber-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span>Review ({counts.review})</span>
          </button>
          <button
            onClick={() => setStatusFilter("FRAUD_SUSPECT_REVIEW")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "FRAUD_SUSPECT_REVIEW"
                ? "bg-rose-950/80 border border-rose-500/40 text-rose-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="h-3 w-3 text-rose-400" />
            <span>Fraud ({counts.fraud})</span>
          </button>
        </div>
      </div>

      {/* Archetype Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
        <span className="text-slate-500 flex items-center gap-1 shrink-0 font-medium">
          <SlidersHorizontal className="h-3 w-3" /> Archetype:
        </span>
        {[
          { key: "ALL", label: "All Types" },
          { key: "clear_restaurant_fault", label: "🍕 Restaurant Fault (15)" },
          { key: "clear_delivery_fault", label: "🛵 Delivery Fault (15)" },
          { key: "customer_remorse", label: "🙅 Customer Remorse (10)" },
          { key: "ambiguous_shared_fault", label: "🌧️ Shared Delay (5)" },
          { key: "repeat_offender_fraud", label: "⚠️ Repeat Offender (5)" },
          { key: "platform_dispatch_error", label: "⚡ Platform Glitch (5)" },
        ].map((arch) => (
          <button
            key={arch.key}
            onClick={() => setArchetypeFilter(arch.key)}
            className={`rounded-full px-3 py-1 font-medium whitespace-nowrap transition border ${
              archetypeFilter === arch.key
                ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            {arch.label}
          </button>
        ))}
      </div>

      {/* Case Queue Table / Cards */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 pl-4 pr-2">Case &amp; Order</th>
                <th className="py-3 px-3">Parties</th>
                <th className="py-3 px-3">Customer Dispute Text</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Fault Split Attribution</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 pr-4 pl-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No cases match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const isEvaluating = evaluatingOrderId === c.order_id;
                  const isProtected = c.decision?.is_innocent_party_protected;

                  return (
                    <tr
                      key={c.order_id}
                      className="group transition hover:bg-slate-900/40 cursor-pointer"
                      onClick={() => onSelectCase(c.order_id)}
                    >
                      {/* Case & Order Info */}
                      <td className="py-3 pl-4 pr-2 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white group-hover:text-indigo-400 transition">
                            {c.order_id}
                          </span>
                          {isProtected && (
                            <span
                              title={`Innocent ${c.decision?.protected_party_type} protected from unfair penalty!`}
                              className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
                            >
                              <ShieldCheck className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          ₹{c.total_amount.toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* Parties */}
                      <td className="py-3 px-3">
                        <div className="text-white font-medium">{c.customer_name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 truncate max-w-[130px]" title={c.restaurant_name}>
                            <Store className="h-3 w-3 text-orange-400 shrink-0" />
                            {c.restaurant_name}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1 truncate max-w-[110px]" title={c.rider_name}>
                            <Bike className="h-3 w-3 text-sky-400 shrink-0" />
                            {c.rider_name}
                          </span>
                        </div>
                      </td>

                      {/* Dispute text preview */}
                      <td className="py-3 px-3 max-w-[260px]">
                        <p className="line-clamp-2 text-slate-300 italic">
                          &quot;{c.customer_text}&quot;
                        </p>
                        <span className="inline-block mt-1 text-[10px] rounded bg-slate-800/80 px-1.5 py-0.5 text-slate-400 font-medium">
                          {c.dispute_category.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {c.status === "AUTO_RESOLVED" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Auto-Resolved
                          </span>
                        )}
                        {c.status === "NEEDS_HUMAN_REVIEW" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            Needs Review
                          </span>
                        )}
                        {c.status === "FRAUD_SUSPECT_REVIEW" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400">
                            <ShieldAlert className="h-3 w-3" />
                            Fraud Suspect
                          </span>
                        )}
                        {c.status === "MANUALLY_OVERRIDDEN" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-400">
                            Overridden
                          </span>
                        )}
                        {c.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                            Pending Eval
                          </span>
                        )}
                      </td>

                      {/* Fault attribution mini bar */}
                      <td className="py-3 px-3 min-w-[150px]">
                        {c.fault_attribution ? (
                          <div>
                            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
                              <div
                                style={{ width: `${c.fault_attribution.restaurant}%` }}
                                title={`Restaurant: ${c.fault_attribution.restaurant}%`}
                                className="bg-orange-500"
                              />
                              <div
                                style={{ width: `${c.fault_attribution.delivery_partner}%` }}
                                title={`Delivery Partner: ${c.fault_attribution.delivery_partner}%`}
                                className="bg-sky-500"
                              />
                              <div
                                style={{ width: `${c.fault_attribution.platform}%` }}
                                title={`Platform: ${c.fault_attribution.platform}%`}
                                className="bg-purple-500"
                              />
                              <div
                                style={{ width: `${c.fault_attribution.customer}%` }}
                                title={`Customer: ${c.fault_attribution.customer}%`}
                                className="bg-emerald-500"
                              />
                            </div>
                            <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono">
                              {c.fault_attribution.restaurant > 0 && <span className="text-orange-400">R:{c.fault_attribution.restaurant}%</span>}
                              {c.fault_attribution.delivery_partner > 0 && <span className="text-sky-400">DP:{c.fault_attribution.delivery_partner}%</span>}
                              {c.fault_attribution.platform > 0 && <span className="text-purple-400">Plat:{c.fault_attribution.platform}%</span>}
                              {c.fault_attribution.customer > 0 && <span className="text-emerald-400">Cust:{c.fault_attribution.customer}%</span>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Confidence */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {c.confidence > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-mono font-bold ${
                                c.confidence >= 80
                                  ? "text-emerald-400"
                                  : c.confidence >= 60
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {c.confidence}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Action CTA */}
                      <td className="py-3 pr-4 pl-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status === "PENDING" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEvaluateCase(c.order_id);
                              }}
                              disabled={isEvaluating}
                              className="flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition disabled:opacity-50"
                            >
                              <Sparkles className={`h-3 w-3 ${isEvaluating ? "animate-spin" : ""}`} />
                              <span>{isEvaluating ? "Evaluating..." : "Evaluate"}</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCase(c.order_id);
                              }}
                              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-slate-600 transition"
                            >
                              <span>Inspect</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
