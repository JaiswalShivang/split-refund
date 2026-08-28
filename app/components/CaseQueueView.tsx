"use client";

import React, { useState, useMemo } from "react";
import { CaseListItem } from "../types";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Store,
  Bike,
  Play,
  SlidersHorizontal,
  IndianRupee,
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
      {/* Search & Status Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#242D3D] bg-[#161B26] p-3.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Merchant, Delivery Partner, Customer, or Dispute Text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#242D3D] bg-[#0C111D] py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              statusFilter === "ALL"
                ? "bg-[#2563EB] text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1F2430]"
            }`}
          >
            All Disputes ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter("AUTO_RESOLVED")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "AUTO_RESOLVED"
                ? "bg-emerald-950 border border-emerald-500/40 text-emerald-300"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1F2430]"
            }`}
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Autonomous ({counts.auto})</span>
          </button>
          <button
            onClick={() => setStatusFilter("PROTECTED")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "PROTECTED"
                ? "bg-blue-950 border border-blue-500/40 text-blue-300"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1F2430]"
            }`}
          >
            <ShieldCheck className="h-3 w-3 text-blue-400" />
            <span>Chargeback Protected ({counts.protectedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter("NEEDS_HUMAN_REVIEW")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "NEEDS_HUMAN_REVIEW"
                ? "bg-amber-950 border border-[#D97706]/40 text-[#F59E0B]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1F2430]"
            }`}
          >
            <AlertCircle className="h-3 w-3 text-[#F59E0B]" />
            <span>Ambiguous Holds ({counts.review})</span>
          </button>
          <button
            onClick={() => setStatusFilter("FRAUD_SUSPECT_REVIEW")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === "FRAUD_SUSPECT_REVIEW"
                ? "bg-rose-950 border border-rose-500/40 text-rose-300"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1F2430]"
            }`}
          >
            <ShieldAlert className="h-3 w-3 text-rose-400" />
            <span>High-Velocity Flags ({counts.fraud})</span>
          </button>
        </div>
      </div>

      {/* Archetype Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
        <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium">
          <SlidersHorizontal className="h-3 w-3 text-slate-500" /> Dispute Category:
        </span>
        {[
          { key: "ALL", label: "All Categories" },
          { key: "clear_restaurant_fault", label: "Merchant Prep Delay (15)" },
          { key: "clear_delivery_fault", label: "Delivery Partner Transit Delay (15)" },
          { key: "customer_remorse", label: "Post-Dispatch Cancellation (10)" },
          { key: "ambiguous_shared_fault", label: "Shared Weather & Traffic (5)" },
          { key: "repeat_offender_fraud", label: "High-Velocity Claim Flag (5)" },
          { key: "platform_dispatch_error", label: "Platform Dispatch Outage (5)" },
        ].map((arch) => (
          <button
            key={arch.key}
            onClick={() => setArchetypeFilter(arch.key)}
            className={`rounded-md px-2.5 py-1 font-medium whitespace-nowrap transition border ${
              archetypeFilter === arch.key
                ? "border-blue-500 bg-blue-950/60 text-blue-200"
                : "border-[#242D3D] bg-[#161B26] text-slate-400 hover:border-[#334155] hover:text-slate-200"
            }`}
          >
            {arch.label}
          </button>
        ))}
      </div>

      {/* Case Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-[#242D3D] bg-[#161B26]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#242D3D] bg-[#0C111D] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 pl-4 pr-2">Case &amp; Amount</th>
                <th className="py-3 px-3">Marketplace Parties</th>
                <th className="py-3 px-3">Customer Dispute Claim</th>
                <th className="py-3 px-3">Settlement Status</th>
                <th className="py-3 px-3">Attributed Fault Split</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 pr-4 pl-2 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242D3D]/70">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No disputes match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const isEvaluating = evaluatingOrderId === c.order_id;
                  const isProtected = c.decision?.is_innocent_party_protected;

                  return (
                    <tr
                      key={c.order_id}
                      className="group transition hover:bg-[#1F2430]/60 cursor-pointer"
                      onClick={() => onSelectCase(c.order_id)}
                    >
                      {/* Case & Amount */}
                      <td className="py-3 pl-4 pr-2 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white group-hover:text-blue-400 transition">
                            {c.order_id}
                          </span>
                          {isProtected && (
                            <span
                              title={`Innocent ${c.decision?.protected_party_type === "restaurant" ? "Merchant" : "Delivery Partner"} protected from unfair chargeback!`}
                              className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
                            >
                              <ShieldCheck className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-300 font-sans mt-0.5 flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3 text-slate-400" />
                          <span>{c.total_amount.toLocaleString("en-IN")}</span>
                        </div>
                      </td>

                      {/* Parties */}
                      <td className="py-3 px-3">
                        <div className="text-white font-medium">{c.customer_name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 truncate max-w-[130px]" title={`Merchant: ${c.restaurant_name}`}>
                            <Store className="h-3 w-3 text-[#D97706] shrink-0" />
                            {c.restaurant_name}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1 truncate max-w-[110px]" title={`Delivery Partner: ${c.rider_name}`}>
                            <Bike className="h-3 w-3 text-[#0284C7] shrink-0" />
                            {c.rider_name}
                          </span>
                        </div>
                      </td>

                      {/* Customer Dispute Claim */}
                      <td className="py-3 px-3 max-w-[260px]">
                        <p className="line-clamp-2 text-slate-300 italic">
                          &quot;{c.customer_text}&quot;
                        </p>
                        <span className="inline-block mt-1 text-[10px] rounded border border-[#242D3D] bg-[#0C111D] px-1.5 py-0.5 text-slate-400 font-medium">
                          {c.dispute_category.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Status Encoding (Visual Distinction) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {c.status === "AUTO_RESOLVED" && (
                          <div className="inline-flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            <span>Autonomous</span>
                          </div>
                        )}
                        {c.status === "NEEDS_HUMAN_REVIEW" && (
                          <div className="inline-flex items-center gap-1.5 rounded border border-[#D97706]/40 bg-amber-950/40 px-2 py-0.5 text-[11px] font-semibold text-[#F59E0B]">
                            <AlertCircle className="h-3 w-3" />
                            <span>Ambiguous Hold</span>
                          </div>
                        )}
                        {c.status === "FRAUD_SUSPECT_REVIEW" && (
                          <div className="inline-flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-950/40 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
                            <ShieldAlert className="h-3 w-3" />
                            <span>High-Velocity Flag</span>
                          </div>
                        )}
                        {c.status === "MANUALLY_OVERRIDDEN" && (
                          <div className="inline-flex items-center gap-1.5 rounded border border-blue-500/40 bg-blue-950/40 px-2 py-0.5 text-[11px] font-semibold text-blue-300">
                            <span>Adjuster Override</span>
                          </div>
                        )}
                        {c.status === "PENDING" && (
                          <div className="inline-flex items-center gap-1.5 rounded border border-[#334155] bg-[#0C111D] px-2 py-0.5 text-[11px] font-medium text-slate-400">
                            <span>Pending Ingestion</span>
                          </div>
                        )}
                      </td>

                      {/* Fault attribution segmented bar */}
                      <td className="py-3 px-3 min-w-[150px]">
                        {c.fault_attribution ? (
                          <div>
                            <div className="flex h-2.5 w-full overflow-hidden rounded bg-[#0C111D] border border-[#242D3D]">
                              <div
                                style={{ width: `${c.fault_attribution.restaurant}%` }}
                                title={`Merchant: ${c.fault_attribution.restaurant}%`}
                                className="bg-[#D97706]"
                              />
                              <div
                                style={{ width: `${c.fault_attribution.delivery_partner}%` }}
                                title={`Delivery Partner: ${c.fault_attribution.delivery_partner}%`}
                                className="bg-[#0284C7]"
                              />
                              <div
                                style={{ width: `${c.fault_attribution.platform}%` }}
                                title={`Platform: ${c.fault_attribution.platform}%`}
                                className="bg-[#7C3AED]"
                              />
                              <div
                                style={{ width: `${c.fault_attribution.customer}%` }}
                                title={`Customer: ${c.fault_attribution.customer}%`}
                                className="bg-[#059669]"
                              />
                            </div>
                            <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono">
                              {c.fault_attribution.restaurant > 0 && <span className="text-[#D97706]">M:{c.fault_attribution.restaurant}%</span>}
                              {c.fault_attribution.delivery_partner > 0 && <span className="text-[#0284C7]">DP:{c.fault_attribution.delivery_partner}%</span>}
                              {c.fault_attribution.platform > 0 && <span className="text-[#7C3AED]">P:{c.fault_attribution.platform}%</span>}
                              {c.fault_attribution.customer > 0 && <span className="text-[#059669]">Cust:{c.fault_attribution.customer}%</span>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Confidence Score */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {c.confidence > 0 ? (
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
                              className="flex items-center gap-1 rounded-md border border-blue-500/40 bg-blue-950/60 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-blue-900/60 transition disabled:opacity-50"
                            >
                              <Play className={`h-3 w-3 fill-current ${isEvaluating ? "animate-spin" : ""}`} />
                              <span>{isEvaluating ? "Evaluating..." : "Run Engine"}</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCase(c.order_id);
                              }}
                              className="flex items-center gap-1 rounded-md border border-[#334155] bg-[#0C111D] px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-blue-500 hover:text-white transition"
                            >
                              <span>Inspect Dossier</span>
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
