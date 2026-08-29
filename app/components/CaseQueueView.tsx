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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Merchant, Delivery Partner, Customer, or Dispute Text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${statusFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            All Disputes ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter("AUTO_RESOLVED")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${statusFilter === "AUTO_RESOLVED"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Autonomous ({counts.auto})</span>
          </button>
          <button
            onClick={() => setStatusFilter("PROTECTED")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${statusFilter === "PROTECTED"
                ? "bg-blue-50 border border-blue-300 text-blue-800 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <ShieldCheck className="h-3 w-3 text-blue-600" />
            <span>Chargeback Protected ({counts.protectedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter("NEEDS_HUMAN_REVIEW")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${statusFilter === "NEEDS_HUMAN_REVIEW"
                ? "bg-amber-50 border border-amber-300 text-amber-900 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <AlertCircle className="h-3 w-3 text-[#D97706]" />
            <span>Ambiguous Holds ({counts.review})</span>
          </button>
          <button
            onClick={() => setStatusFilter("FRAUD_SUSPECT_REVIEW")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${statusFilter === "FRAUD_SUSPECT_REVIEW"
                ? "bg-rose-50 border border-rose-300 text-rose-800 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <ShieldAlert className="h-3 w-3 text-rose-600" />
            <span>High-Velocity Flags ({counts.fraud})</span>
          </button>
        </div>
      </div>

      {/* Archetype Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
        <span className="text-slate-500 flex items-center gap-1 shrink-0 font-medium">
          <SlidersHorizontal className="h-3 w-3 text-slate-400" /> Dispute Category:
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
            className={`rounded-md px-2.5 py-1 font-medium whitespace-nowrap transition border ${archetypeFilter === arch.key
                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-xs font-semibold"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 shadow-xs"
              }`}
          >
            {arch.label}
          </button>
        ))}
      </div>

      {/* Case Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
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
                      className="group transition hover:bg-slate-50/80 cursor-pointer"
                      onClick={() => onSelectCase(c.order_id)}
                    >
                      {/* Case & Amount */}
                      <td className="py-3 pl-4 pr-2 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition">
                            {c.order_id}
                          </span>
                          {isProtected && (
                            <span
                              title={`Innocent ${c.decision?.protected_party_type === "restaurant" ? "Merchant" : "Delivery Partner"} protected from unfair chargeback!`}
                              className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                            >
                              <ShieldCheck className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-sans mt-0.5 flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3 text-slate-400" />
                          <span>{c.total_amount.toLocaleString("en-IN")}</span>
                        </div>
                      </td>

                      {/* Parties */}
                      <td className="py-3 px-3">
                        <div className="text-slate-900 font-medium">{c.customer_name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 truncate max-w-[130px]" title={`Merchant: ${c.restaurant_name}`}>
                            <Store className="h-3 w-3 text-[#D97706] shrink-0" />
                            {c.restaurant_name}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 truncate max-w-[110px]" title={`Delivery Partner: ${c.rider_name}`}>
                            <Bike className="h-3 w-3 text-[#0284C7] shrink-0" />
                            {c.rider_name}
                          </span>
                        </div>
                      </td>

                      {/* Customer Dispute Claim */}
                      <td className="py-3 px-3 max-w-[260px]">
                        <p className="line-clamp-2 text-slate-700 italic">
                          &quot;{c.customer_text}&quot;
                        </p>
                        <span className="inline-block mt-1 text-[10px] rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-slate-600 font-medium">
                          {c.dispute_category.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Status Encoding (Visual Distinction) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {c.status === "AUTO_RESOLVED" && (
                          <div
                            title="Autonomous settlement — reversible via Adjuster Override within 72-hour window if new evidence emerges"
                            className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 cursor-help"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Autonomous</span>
                          </div>
                        )}
                        {c.status === "NEEDS_HUMAN_REVIEW" && (
                          <div className="inline-flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                            <AlertCircle className="h-3 w-3 text-[#D97706]" />
                            <span>Ambiguous Hold</span>
                          </div>
                        )}
                        {c.status === "FRAUD_SUSPECT_REVIEW" && (
                          <div className="inline-flex items-center gap-1.5 rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
                            <ShieldAlert className="h-3 w-3 text-rose-600" />
                            <span>High-Velocity Flag</span>
                          </div>
                        )}
                        {c.status === "MANUALLY_OVERRIDDEN" && (
                          <div className="inline-flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                            <span>Adjuster Override</span>
                          </div>
                        )}
                        {c.status === "PENDING" && (
                          <div className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            <span>Pending</span>
                          </div>
                        )}
                      </td>

                      {/* Fault attribution segmented bar */}
                      <td className="py-3 px-3 min-w-[150px]">
                        {c.fault_attribution ? (
                          <div>
                            <div className="flex h-2.5 w-full overflow-hidden rounded bg-slate-100 border border-slate-200">
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
                            <div className="mt-1 flex justify-between text-[10px] text-slate-600 font-mono">
                              {c.fault_attribution.restaurant > 0 && <span className="text-[#B45309] font-medium">M:{c.fault_attribution.restaurant}%</span>}
                              {c.fault_attribution.delivery_partner > 0 && <span className="text-[#0369A1] font-medium">DP:{c.fault_attribution.delivery_partner}%</span>}
                              {c.fault_attribution.platform > 0 && <span className="text-[#6D28D9] font-medium">P:{c.fault_attribution.platform}%</span>}
                              {c.fault_attribution.customer > 0 && <span className="text-[#047857] font-medium">Cust:{c.fault_attribution.customer}%</span>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Confidence Score */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {c.confidence > 0 ? (
                          <span
                            className={`text-xs font-mono font-bold ${c.confidence >= 80
                                ? "text-emerald-700"
                                : c.confidence >= 60
                                  ? "text-amber-700"
                                  : "text-rose-700"
                              }`}
                          >
                            {c.confidence}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
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
                              className="flex items-center gap-1 rounded-md bg-blue-600 hover:bg-blue-700 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50"
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
                              className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50 shadow-xs transition"
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
