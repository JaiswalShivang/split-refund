"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CaseListItem, AssembledCase, EvaluationDecision, BatchMetrics, HumanOverride } from "./types";
import {
  fetchCases,
  fetchCaseDetail,
  evaluateCaseAPI,
  batchEvaluateAPI,
  saveOverrideAPI,
  fetchMetricsAPI,
  resetBatchAPI,
} from "./lib/api";
import { Navbar } from "./components/Navbar";
import { MetricsBanner } from "./components/MetricsBanner";
import { CaseQueueView } from "./components/CaseQueueView";
import { CaseDetailView } from "./components/CaseDetailView";
import { MetricsDashboardView } from "./components/MetricsDashboardView";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"queue" | "detail" | "metrics">("queue");
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<AssembledCase | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<EvaluationDecision | null>(null);
  const [allAssembledCases, setAllAssembledCases] = useState<AssembledCase[]>([]);
  const [metrics, setMetrics] = useState<BatchMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluatingOrderId, setEvaluatingOrderId] = useState<string | null>(null);
  const [isEvaluatingBatch, setIsEvaluatingBatch] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const refreshState = useCallback(async () => {
    try {
      const { cases: loadedCases } = await fetchCases();
      setCases(loadedCases);

      const loadedMetrics = await fetchMetricsAPI();
      setMetrics(loadedMetrics);
    } catch {
      showToast("Could not load backend data, loaded offline seed dataset.", "error");
    }
  }, [showToast]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const { cases: loadedCases } = await fetchCases();
        if (!isMounted) return;
        setCases(loadedCases);

        const loadedMetrics = await fetchMetricsAPI();
        if (!isMounted) return;
        setMetrics(loadedMetrics);

        const raw = await import("./data/seed_cases.json");
        const list = (raw.default || raw) as AssembledCase[];
        if (!isMounted) return;
        setAllAssembledCases(list);

        if (list.length > 0) {
          const first = list[0];
          setSelectedOrderId((prev) => prev || first.order.order_id);
          setSelectedCase((prev) => prev || first);
        }
      } catch {
        if (isMounted) {
          showToast("Could not load backend data, loaded offline seed dataset.", "error");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleSelectCase = async (orderId: string) => {
    setSelectedOrderId(orderId);
    try {
      const { case: c, decision } = await fetchCaseDetail(orderId);
      setSelectedCase(c);
      setSelectedDecision(decision || null);
      setActiveTab("detail");
    } catch {
      showToast(`Failed to load case ${orderId}`, "error");
    }
  };

  const handleEvaluateSingle = async (orderId: string) => {
    setEvaluatingOrderId(orderId);
    try {
      const decision = await evaluateCaseAPI(orderId);
      setSelectedDecision(decision);

      // Refresh cases list
      const { cases: updatedCases } = await fetchCases();
      setCases(updatedCases);

      // Refresh metrics
      const updatedMetrics = await fetchMetricsAPI();
      setMetrics(updatedMetrics);

      showToast(`Case ${orderId} evaluated: Status ${decision.status.replace(/_/g, " ")}`);
    } catch {
      showToast(`Error evaluating case ${orderId}`, "error");
    } finally {
      setEvaluatingOrderId(null);
    }
  };

  const handleBatchEvaluate = async () => {
    setIsEvaluatingBatch(true);
    try {
      const { processed, metrics: newMetrics } = await batchEvaluateAPI();
      setMetrics(newMetrics);

      // Refresh cases list
      const { cases: updatedCases } = await fetchCases();
      setCases(updatedCases);

      // Refresh currently selected case if any
      if (selectedOrderId) {
        const { case: c, decision } = await fetchCaseDetail(selectedOrderId);
        setSelectedCase(c);
        setSelectedDecision(decision || null);
      }

      showToast(`Successfully processed batch of ${processed} dispute cases!`);
    } catch {
      showToast("Error processing batch evaluation", "error");
    } finally {
      setIsEvaluatingBatch(false);
    }
  };

  const handleSaveOverride = async (orderId: string, override: HumanOverride) => {
    try {
      const updatedDecision = await saveOverrideAPI(orderId, override);
      setSelectedDecision(updatedDecision);

      const { cases: updatedCases } = await fetchCases();
      setCases(updatedCases);

      const updatedMetrics = await fetchMetricsAPI();
      setMetrics(updatedMetrics);

      showToast(`Manual controller override applied for ${orderId}`);
    } catch {
      showToast(`Failed to apply override for ${orderId}`, "error");
    }
  };

  const handleReset = async () => {
    await resetBatchAPI();
    setSelectedDecision(null);
    await refreshState();
    showToast("Simulation decisions reset.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedOrderId={selectedOrderId}
        metrics={metrics}
        isEvaluatingBatch={isEvaluatingBatch}
        onBatchEvaluate={handleBatchEvaluate}
        onReset={handleReset}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 space-y-4">
        {/* Top Level Metrics Banner */}
        <MetricsBanner
          metrics={metrics}
          onSelectProtectedFilter={() => {
            setActiveTab("queue");
          }}
        />

        {/* Tab Views */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="mt-3 text-xs text-slate-400">Loading dispute intelligence dossier...</p>
          </div>
        ) : (
          <>
            {activeTab === "queue" && (
              <CaseQueueView
                cases={cases}
                onSelectCase={handleSelectCase}
                onEvaluateCase={handleEvaluateSingle}
                evaluatingOrderId={evaluatingOrderId}
              />
            )}

            {activeTab === "detail" && (
              <CaseDetailView
                assembledCase={selectedCase}
                decision={selectedDecision}
                allCases={allAssembledCases}
                onSelectCase={handleSelectCase}
                onBackToQueue={() => setActiveTab("queue")}
                onEvaluateCase={handleEvaluateSingle}
                onSaveOverride={handleSaveOverride}
                isEvaluating={evaluatingOrderId === selectedOrderId}
              />
            )}

            {activeTab === "metrics" && (
              <MetricsDashboardView
                metrics={metrics}
                onSelectCase={handleSelectCase}
                onRunBatchEvaluate={handleBatchEvaluate}
                isEvaluating={isEvaluatingBatch}
              />
            )}
          </>
        )}
      </main>

      {/* Notification Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-2.5 text-xs font-medium text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
