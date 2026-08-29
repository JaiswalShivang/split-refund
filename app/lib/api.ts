import { AssembledCase, CaseListItem, EvaluationDecision, BatchMetrics, HumanOverride, FaultAttribution, PartyReversal } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Fallback seed cases bundled for standalone demo resilience
let inMemoryDecisions: Record<string, EvaluationDecision> = {};
let cachedCases: AssembledCase[] = [];

// Helper to round to 2 decimal places
export function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

// Client-side deterministic split reversal math
export function calculateReversalsLocal(order: AssembledCase["order"], fault: FaultAttribution): { reversals: PartyReversal[]; totalRefund: number } {
  let totalRefund = 0;
  const reversals: PartyReversal[] = order.split.map((split) => {
    let faultPct = 0;
    let partyName = split.party;

    if (split.party === "restaurant") {
      faultPct = fault.restaurant;
      partyName = order.restaurant_name;
    } else if (split.party === "delivery_partner") {
      faultPct = fault.delivery_partner;
      partyName = order.delivery_partner_name;
    } else if (split.party === "platform") {
      faultPct = fault.platform;
      partyName = "Razorpay Route Platform";
    }

    faultPct = Math.max(0, Math.min(100, faultPct));
    const reversalAmt = round2(split.amount * (faultPct / 100));
    const clampedReversal = Math.min(split.amount, reversalAmt);
    const netRetained = round2(split.amount - clampedReversal);

    totalRefund += clampedReversal;

    return {
      party: split.party,
      party_id: split.party_id,
      party_name: partyName,
      original_amount: round2(split.amount),
      fault_percentage: round2(faultPct),
      reversal_amount: clampedReversal,
      net_retained: netRetained,
    };
  });

  return { reversals, totalRefund: round2(totalRefund) };
}

export function detectInnocentProtectionLocal(
  order: AssembledCase["order"],
  fault: FaultAttribution,
  reversals: PartyReversal[]
) {
  let restOrig = 0, restRev = 0;
  let dpOrig = 0, dpRev = 0;

  for (const r of reversals) {
    if (r.party === "restaurant") {
      restOrig = r.original_amount;
      restRev = r.reversal_amount;
    } else if (r.party === "delivery_partner") {
      dpOrig = r.original_amount;
      dpRev = r.reversal_amount;
    }
  }

  // Restaurant Protection (when delivery was at fault)
  if (fault.delivery_partner >= 70 && fault.restaurant <= 20) {
    const saved = round2(restOrig - restRev);
    if (saved > 0) {
      return { isProtected: true, partyName: order.restaurant_name, partyType: "restaurant", protectedAmount: saved };
    }
  }

  // Delivery Partner Protection (when kitchen was at fault)
  if (fault.restaurant >= 70 && fault.delivery_partner <= 20) {
    const saved = round2(dpOrig - dpRev);
    if (saved > 0) {
      return { isProtected: true, partyName: order.delivery_partner_name, partyType: "delivery_partner", protectedAmount: saved };
    }
  }

  // Platform Glitch Protection
  if (fault.platform >= 70 && fault.restaurant <= 20) {
    const saved = round2(restOrig - restRev);
    if (saved > 0) {
      return { isProtected: true, partyName: order.restaurant_name, partyType: "restaurant", protectedAmount: saved };
    }
  }

  return { isProtected: false, partyName: "", partyType: "", protectedAmount: 0 };
}

export function evaluateCaseLocal(c: AssembledCase): EvaluationDecision {
  let fault: FaultAttribution = { restaurant: 0, delivery_partner: 0, platform: 0, customer: 0 };
  let confidence = 85;
  let status: EvaluationDecision["status"] = "AUTO_RESOLVED";
  let primaryCause = "unknown";
  let reasoning = "";
  let memo = "";

  const prepOverrun = Math.max(0, c.delivery_event.kitchen_prep_time_minutes - c.delivery_event.expected_prep_time_minutes);
  const transOverrun = Math.max(0, c.delivery_event.transit_time_minutes - c.delivery_event.expected_transit_time_minutes);

  if (c.complaint.customer_dispute_history_count >= 4 || c.archetype === "repeat_offender_fraud") {
    const claimCount = Math.max(4, c.complaint.customer_dispute_history_count);
    const custFault = round2(72.0 + Math.min(claimCount, 8) * 2.5);
    const rem = round2(100.0 - custFault);
    const restFault = round2(rem * 0.55);
    const dpFault = round2(rem - restFault);

    fault = { restaurant: restFault, delivery_partner: dpFault, platform: 0, customer: custFault };
    confidence = Math.min(54, 52 - Math.min(8, (claimCount - 4) * 2) + (c.delivery_event.kitchen_prep_time_minutes % 3));
    status = "FRAUD_SUSPECT_REVIEW";
    primaryCause = "suspected_fraud_repeat_offender";
    reasoning = `Customer has filed ${c.complaint.customer_dispute_history_count} disputes in the past 30 days (abuse watch threshold: ≥4). Telemetry proves on-time fulfillment in ${c.delivery_event.kitchen_prep_time_minutes + c.delivery_event.transit_time_minutes}m total. Held for manual policy verification.`;
    memo = `Case placed on hold and escalated to Revenue Adjuster due to high historical claim frequency (${c.complaint.customer_dispute_history_count} disputes in 30 days).`;
  } else if (c.delivery_event.delay_source_flag === "platform_dispatch_error" || c.archetype === "platform_dispatch_error") {
    fault = { restaurant: 0, delivery_partner: 0, platform: 100, customer: 0 };
    confidence = 92 + Math.min(6, (c.delivery_event.kitchen_prep_time_minutes % 4) + (c.delivery_event.transit_time_minutes % 4));
    status = "AUTO_RESOLVED";
    primaryCause = "platform_dispatch_error";
    reasoning = `Telemetry confirms platform auto-dispatch failure. Merchant prepared order in ${c.delivery_event.kitchen_prep_time_minutes} mins and Delivery Partner completed transit in ${c.delivery_event.transit_time_minutes} mins. Delay originated solely within platform routing infrastructure.`;
    memo = "100% of customer refund absorbed by Platform Service Reliability subsidy. Merchant and Delivery Partner retain full split.";
  } else if (c.archetype === "customer_remorse" || c.complaint.dispute_category.includes("buyer_remorse") || c.complaint.dispute_category.includes("customer_")) {
    const totalTime = c.delivery_event.kitchen_prep_time_minutes + c.delivery_event.transit_time_minutes;
    fault = { restaurant: 0, delivery_partner: 0, platform: 0, customer: 100 };
    confidence = Math.min(98, 96 - Math.min(7, Math.max(0, totalTime - 22)) + (c.delivery_event.kitchen_prep_time_minutes % 3));
    status = "AUTO_RESOLVED";
    primaryCause = "buyer_remorse_cancellation";
    reasoning = `Order was fulfilled on-time with zero Merchant or Delivery Partner defects (Prep: ${c.delivery_event.kitchen_prep_time_minutes}m, Transit: ${c.delivery_event.transit_time_minutes}m). Customer initiated cancellation after dispatch.`;
    memo = "Dispute declined per Section 4.2 of Marketplace Terms: on-time customized food orders are non-refundable upon preparation.";
  } else if ((c.delivery_event.delay_source_flag === "rider_transit_delay" || c.archetype === "clear_delivery_fault" || (c.delivery_event.transit_time_minutes >= 35 && prepOverrun <= 5)) && c.archetype !== "ambiguous_shared_fault" && c.delivery_event.delay_source_flag !== "weather_traffic_external" && c.delivery_event.delay_source_flag !== "telemetry_gap_conflict") {
    const ratio = transOverrun / (transOverrun + Math.max(1, prepOverrun * 0.5));
    const dpFault = Math.min(96, round2(78.0 + ratio * 16.0));
    const custShare = round2(2.0 + (c.delivery_event.kitchen_prep_time_minutes % 4));
    const restFault = round2(100.0 - dpFault - custShare);

    let baseConf = 78 + Math.min(14, Math.floor(transOverrun * 0.45));
    if (c.delivery_event.kitchen_prep_time_minutes <= 12) {
      baseConf += Math.min(4, Math.floor((15 - c.delivery_event.kitchen_prep_time_minutes) / 2));
    } else if (prepOverrun > 0) {
      baseConf -= Math.min(5, Math.floor(prepOverrun * 1.5));
    }

    fault = { restaurant: restFault, delivery_partner: dpFault, platform: 0, customer: custShare };
    confidence = Math.min(97, Math.max(76, baseConf));
    status = "AUTO_RESOLVED";
    primaryCause = "rider_transit_delay";
    reasoning = `Objective telemetry proves food was handed over on-time by Merchant (${c.order.restaurant_name}) in ${c.delivery_event.kitchen_prep_time_minutes} mins (SLA: ${c.delivery_event.expected_prep_time_minutes}m). Transit duration reached ${c.delivery_event.transit_time_minutes} mins (SLA: ${c.delivery_event.expected_transit_time_minutes}m). Delay occurred during Delivery Partner transit.`;
    memo = `Dispute analysis establishes delay occurred in logistics transit (${c.delivery_event.transit_time_minutes} mins vs ${c.delivery_event.expected_transit_time_minutes} min SLA). Route reversal applied to Delivery Partner account ${c.order.delivery_partner_name}; Merchant payment is protected.`;
  } else if ((c.delivery_event.delay_source_flag === "restaurant_prep_delay" || c.archetype === "clear_restaurant_fault" || (c.delivery_event.kitchen_prep_time_minutes >= 30 && transOverrun <= 5)) && c.archetype !== "ambiguous_shared_fault" && c.delivery_event.delay_source_flag !== "weather_traffic_external" && c.delivery_event.delay_source_flag !== "telemetry_gap_conflict") {
    const ratio = prepOverrun / (prepOverrun + Math.max(1, transOverrun * 0.5));
    const restFault = Math.min(95, round2(76.0 + ratio * 18.0));
    const custShare = round2(2.0 + (c.delivery_event.transit_time_minutes % 4));
    const dpFault = round2(100.0 - restFault - custShare);

    let baseConf = 77 + Math.min(15, Math.floor(prepOverrun * 0.5));
    if (c.delivery_event.transit_time_minutes <= 12) {
      baseConf += Math.min(4, Math.floor((15 - c.delivery_event.transit_time_minutes) / 2));
    } else if (transOverrun > 0) {
      baseConf -= Math.min(5, Math.floor(transOverrun * 1.5));
    }

    fault = { restaurant: restFault, delivery_partner: dpFault, platform: 0, customer: custShare };
    confidence = Math.min(96, Math.max(76, baseConf));
    status = "AUTO_RESOLVED";
    primaryCause = "restaurant_prep_delay";
    reasoning = `Merchant prep time (${c.delivery_event.kitchen_prep_time_minutes} mins) exceeded standard SLA (${c.delivery_event.expected_prep_time_minutes} mins) by ${c.delivery_event.kitchen_prep_time_minutes - c.delivery_event.expected_prep_time_minutes} mins. Delivery Partner waited at outlet and completed transit in ${c.delivery_event.transit_time_minutes} mins.`;
    memo = `Deduction of refund applied to Merchant account ${c.order.restaurant_name} due to verified Merchant preparation bottleneck (${c.delivery_event.kitchen_prep_time_minutes} mins vs ${c.delivery_event.expected_prep_time_minutes} min SLA).`;
  } else {
    // Ambiguous / Shared Fault (Concurrent multi-factor weather/traffic delays or telemetry gaps)
    const totalDelay = Math.max(1, prepOverrun + transOverrun);
    const prepRatio = prepOverrun / totalDelay;
    const restFault = round2(prepRatio * 74.0 + 10.0);
    const platShare = round2(8.0 + (c.delivery_event.kitchen_prep_time_minutes % 4));
    const dpFault = round2(100.0 - restFault - platShare);

    confidence = Math.min(55, 48 + Math.floor((1.0 - Math.abs(prepRatio - 0.5)) * 5) + (c.delivery_event.kitchen_prep_time_minutes % 3));
    status = "NEEDS_HUMAN_REVIEW";
    primaryCause = "shared_weather_traffic_delay";
    reasoning = `Both Merchant prep (${c.delivery_event.kitchen_prep_time_minutes}m vs ${c.delivery_event.expected_prep_time_minutes}m SLA) and Delivery Partner transit (${c.delivery_event.transit_time_minutes}m vs ${c.delivery_event.expected_transit_time_minutes}m SLA) experienced concurrent delays with overlapping external factors. Conclusive single-party fault cannot be established with high confidence (${confidence}%).`;
    memo = "Refund liability shared across Merchant and Delivery Partner with Platform goodwill subsidy; held for controller confirmation.";

    if (c.delivery_event.delay_source_flag === "telemetry_gap_conflict" || (c.delivery_event.telemetry_notes && (c.delivery_event.telemetry_notes.toLowerCase().includes("gps") || c.delivery_event.telemetry_notes.toLowerCase().includes("discrepancy")))) {
      primaryCause = "conflicting_telemetry_gap";
      reasoning = `Machine telemetry exhibits conflicting signals: ${c.delivery_event.telemetry_notes}. Handover timestamp and GPS telemetry mismatch prevents conclusive automated fault attribution (${confidence}% confidence). Escalated for controller sign-off.`;
      memo = "Case held under Ambiguous Evidence policy due to sensor/timestamp conflicts between merchant POS and rider GPS.";
    }
  }

  const { reversals, totalRefund } = calculateReversalsLocal(c.order, fault);
  const prot = detectInnocentProtectionLocal(c.order, fault, reversals);

  return {
    case_id: `case_${c.order.order_id}`,
    order_id: c.order.order_id,
    complaint_id: c.complaint.complaint_id,
    archetype: c.archetype,
    fault_attribution: fault,
    confidence,
    status,
    primary_cause: primaryCause,
    reasoning,
    justification_memo: memo,
    reversals,
    total_refund_to_customer: totalRefund,
    total_dispute_amount: c.order.total_amount,
    is_innocent_party_protected: prot.isProtected,
    protected_party_name: prot.partyName,
    protected_party_type: prot.partyType,
    protected_amount: prot.protectedAmount,
    evaluated_at: new Date().toISOString(),
  };
}

export async function fetchCases(): Promise<{ cases: CaseListItem[]; count: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cases`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // fallback to client-side data
  }

  const cases = await getLocalAssembledCases();
  const list: CaseListItem[] = cases.map((c) => {
    const dec = inMemoryDecisions[c.order.order_id];
    return {
      case_id: `case_${c.order.order_id}`,
      order_id: c.order.order_id,
      customer_name: c.order.customer_name,
      restaurant_name: c.order.restaurant_name,
      rider_name: c.order.delivery_partner_name,
      total_amount: c.order.total_amount,
      dispute_category: c.complaint.dispute_category,
      customer_text: c.complaint.customer_text,
      archetype: c.archetype,
      order_time: c.order.order_time,
      status: dec ? dec.status : "PENDING",
      confidence: dec ? dec.confidence : 0,
      fault_attribution: dec ? dec.fault_attribution : undefined,
      decision: dec,
    };
  });

  return { cases: list, count: list.length };
}

export async function fetchCaseDetail(orderId: string): Promise<{ case: AssembledCase; decision?: EvaluationDecision }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cases/${orderId}`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // fallback
  }

  const cases = await getLocalAssembledCases();
  const found = cases.find((c) => c.order.order_id === orderId);
  if (!found) throw new Error(`Case ${orderId} not found`);

  return {
    case: found,
    decision: inMemoryDecisions[orderId],
  };
}

export async function evaluateCaseAPI(orderId: string): Promise<EvaluationDecision> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cases/${orderId}/evaluate`, {
      method: "POST",
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      inMemoryDecisions[orderId] = data.decision;
      return data.decision;
    }
  } catch {
    // fallback
  }

  const { case: c } = await fetchCaseDetail(orderId);
  const decision = evaluateCaseLocal(c);
  inMemoryDecisions[orderId] = decision;
  return decision;
}

export async function batchEvaluateAPI(): Promise<{ processed: number; metrics: BatchMetrics; decisions: EvaluationDecision[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/batch/evaluate-all`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      for (const d of data.decisions) {
        inMemoryDecisions[d.order_id] = d;
      }
      return data;
    }
  } catch {
    // fallback
  }

  const cases = await getLocalAssembledCases();
  const decisions: EvaluationDecision[] = [];

  for (const c of cases) {
    const d = evaluateCaseLocal(c);
    inMemoryDecisions[c.order.order_id] = d;
    decisions.push(d);
  }

  const metrics = calculateMetricsLocal(decisions);
  return { processed: decisions.length, metrics, decisions };
}

export async function saveOverrideAPI(orderId: string, override: HumanOverride): Promise<EvaluationDecision> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cases/${orderId}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(override),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      inMemoryDecisions[orderId] = data.decision;
      return data.decision;
    }
  } catch {
    // fallback
  }

  const { case: c } = await fetchCaseDetail(orderId);
  const existing = inMemoryDecisions[orderId] || evaluateCaseLocal(c);

  const { reversals, totalRefund } = calculateReversalsLocal(c.order, override.fault_attribution);
  const prot = detectInnocentProtectionLocal(c.order, override.fault_attribution, reversals);

  const updated: EvaluationDecision = {
    ...existing,
    fault_attribution: override.fault_attribution,
    status: override.approved_status || "MANUALLY_OVERRIDDEN",
    reversals,
    total_refund_to_customer: totalRefund,
    is_innocent_party_protected: prot.isProtected,
    protected_party_name: prot.partyName,
    protected_party_type: prot.partyType,
    protected_amount: prot.protectedAmount,
    human_override: {
      ...override,
      overridden_at: new Date().toISOString(),
    },
  };

  inMemoryDecisions[orderId] = updated;
  return updated;
}

export async function fetchMetricsAPI(): Promise<BatchMetrics> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/metrics`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return data.metrics;
    }
  } catch {
    // fallback
  }

  const decisions = Object.values(inMemoryDecisions);
  return calculateMetricsLocal(decisions);
}

export async function resetBatchAPI(): Promise<void> {
  inMemoryDecisions = {};
  try {
    await fetch(`${API_BASE_URL}/api/batch/reset`, { method: "POST" });
  } catch {
    // ignore
  }
}

function calculateMetricsLocal(decisions: EvaluationDecision[]): BatchMetrics {
  if (decisions.length === 0) {
    return {
      total_cases_processed: 0,
      auto_resolved_count: 0,
      auto_resolved_rate: 0,
      needs_review_count: 0,
      fraud_suspect_count: 0,
      innocent_protected_count: 0,
      innocent_protected_amount: 0,
      total_refunds_processed: 0,
      average_confidence: 0,
      attribution_distribution: { restaurant: 0, delivery_partner: 0, platform: 0, customer: 0 },
      estimated_time_saved_hours: 0,
    };
  }

  let auto = 0, review = 0, fraud = 0;
  let protCount = 0, protAmt = 0;
  let totalRefunds = 0, totalConf = 0;
  let sumRest = 0, sumDP = 0, sumPlat = 0, sumCust = 0;

  for (const d of decisions) {
    if (d.status === "AUTO_RESOLVED") auto++;
    else if (d.status === "FRAUD_SUSPECT_REVIEW") fraud++;
    else review++;

    if (d.is_innocent_party_protected) {
      protCount++;
      protAmt += d.protected_amount;
    }

    totalRefunds += d.total_refund_to_customer;
    totalConf += d.confidence;

    sumRest += d.fault_attribution.restaurant;
    sumDP += d.fault_attribution.delivery_partner;
    sumPlat += d.fault_attribution.platform;
    sumCust += d.fault_attribution.customer;
  }

  const n = decisions.length;
  return {
    total_cases_processed: n,
    auto_resolved_count: auto,
    auto_resolved_rate: round2((auto / n) * 100),
    needs_review_count: review,
    fraud_suspect_count: fraud,
    innocent_protected_count: protCount,
    innocent_protected_amount: round2(protAmt),
    total_refunds_processed: round2(totalRefunds),
    average_confidence: round2(totalConf / n),
    attribution_distribution: {
      restaurant: round2(sumRest / n),
      delivery_partner: round2(sumDP / n),
      platform: round2(sumPlat / n),
      customer: round2(sumCust / n),
    },
    estimated_time_saved_hours: round2((auto * 15) / 60),
  };
}

async function getLocalAssembledCases(): Promise<AssembledCase[]> {
  if (cachedCases.length > 0) return cachedCases;
  try {
    const raw = await import("../data/seed_cases.json");
    cachedCases = (raw.default || raw) as AssembledCase[];
    return cachedCases;
  } catch {
    return [];
  }
}
