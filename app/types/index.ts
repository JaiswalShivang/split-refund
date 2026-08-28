export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface SplitParty {
  party: "restaurant" | "delivery_partner" | "platform" | string;
  party_id: string;
  amount: number;
  percentage: number;
}

export interface Order {
  order_id: string;
  customer_id: string;
  customer_name: string;
  restaurant_id: string;
  restaurant_name: string;
  delivery_partner_id: string;
  delivery_partner_name: string;
  items: OrderItem[];
  total_amount: number;
  split: SplitParty[];
  order_time: string;
  promised_by: string;
  delivered_at: string;
  delivery_status: string;
}

export interface Complaint {
  complaint_id: string;
  order_id: string;
  customer_id: string;
  customer_text: string;
  dispute_category: string;
  requested_action: string;
  filed_at: string;
  customer_dispute_history_count: number;
}

export interface DeliveryEvent {
  order_id: string;
  assigned_at: string;
  rider_arrival_at_restaurant: string;
  pickup_time: string;
  actual_delivery_time: string;
  kitchen_prep_time_minutes: number;
  expected_prep_time_minutes: number;
  transit_time_minutes: number;
  expected_transit_time_minutes: number;
  delay_source_flag: string;
  telemetry_notes: string;
}

export interface AssembledCase {
  archetype: string;
  order: Order;
  complaint: Complaint;
  delivery_event: DeliveryEvent;
}

export interface FaultAttribution {
  restaurant: number;
  delivery_partner: number;
  platform: number;
  customer: number;
}

export interface PartyReversal {
  party: string;
  party_id: string;
  party_name: string;
  original_amount: number;
  fault_percentage: number;
  reversal_amount: number;
  net_retained: number;
}

export interface HumanOverride {
  overridden_by: string;
  overridden_at: string;
  fault_attribution: FaultAttribution;
  reviewer_notes: string;
  approved_status: string;
}

export interface EvaluationDecision {
  case_id: string;
  order_id: string;
  complaint_id: string;
  archetype: string;
  fault_attribution: FaultAttribution;
  confidence: number;
  status: "AUTO_RESOLVED" | "NEEDS_HUMAN_REVIEW" | "FRAUD_SUSPECT_REVIEW" | "MANUALLY_OVERRIDDEN" | string;
  primary_cause: string;
  reasoning: string;
  justification_memo: string;
  reversals: PartyReversal[];
  total_refund_to_customer: number;
  total_dispute_amount: number;
  is_innocent_party_protected: boolean;
  protected_party_name: string;
  protected_party_type: string;
  protected_amount: number;
  evaluated_at: string;
  human_override?: HumanOverride;
}

export interface CaseListItem {
  case_id: string;
  order_id: string;
  customer_name: string;
  restaurant_name: string;
  rider_name: string;
  total_amount: number;
  dispute_category: string;
  customer_text: string;
  archetype: string;
  order_time: string;
  status: "PENDING" | "AUTO_RESOLVED" | "NEEDS_HUMAN_REVIEW" | "FRAUD_SUSPECT_REVIEW" | "MANUALLY_OVERRIDDEN" | string;
  confidence: number;
  fault_attribution?: FaultAttribution;
  decision?: EvaluationDecision;
}

export interface BatchMetrics {
  total_cases_processed: number;
  auto_resolved_count: number;
  auto_resolved_rate: number;
  needs_review_count: number;
  fraud_suspect_count: number;
  innocent_protected_count: number;
  innocent_protected_amount: number;
  total_refunds_processed: number;
  average_confidence: number;
  attribution_distribution: FaultAttribution;
  estimated_time_saved_hours: number;
}
