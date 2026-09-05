export type TabType =
  | 'overview'
  | 'transactions'
  | 'monitor'
  | 'cases'
  | 'evidence'
  | 'analytics'
  | 'performance'
  | 'settings';

export interface SHAPFactor {
  feature: string;
  feature_key: string;
  impact: number;
  direction: 'positive' | 'negative';
  description: string;
}

export interface Transaction {
  transaction_id: string;
  timestamp: string;
  amount: number;
  payment_method: string;
  merchant_category: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_account_age: number;
  customer_transaction_count: number;
  previous_chargebacks: number;
  previous_refunds: number;
  device_age: number;
  device_change_count: number;
  device_type: string;
  device_browser: string;
  ip_address: string;
  city: string;
  transaction_velocity: number;
  failed_attempts: number;
  billing_shipping_match: number;
  location_change: number;
  transaction_hour: number;
  order_id: string;
  order_items: string;
  billing_address: string;
  shipping_address: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  recommended_action: string;
  action_reason: string;
  probability?: number;
  shap_factors?: SHAPFactor[];
  gateway_ref?: string;
  key_id?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  scenario_preset?: string;
}

export interface ChargebackCase {
  case_id: string;
  transaction_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  reason_code: string;
  reason: string;
  date: string;
  due_date: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'New' | 'Investigating' | 'Evidence Ready' | 'Submitted' | 'Resolved';
  evidence_status: string;
  evidence_draft: string;
  transaction?: {
    transaction_id: string;
    timestamp: string;
    amount: number;
    payment_method: string;
    status: string;
    gateway_ref: string;
    last4?: string;
  };
  customer?: {
    customer_id: string;
    name: string;
    email: string;
    phone: string;
    account_created: string;
    completed_orders: number;
    prior_chargebacks: number;
  };
  order?: {
    order_id: string;
    items_summary: string;
    billing_address: string;
    shipping_address: string;
    ip_address: string;
    device?: string;
  };
  fulfillment?: {
    status: string;
    batch_id: string;
    dispatched_at: string;
  };
  delivery?: {
    courier: string;
    tracking_number: string;
    status: string;
    delivered_at: string;
    gps_coordinates: string;
    signature_obtained: string;
  };
  refund?: {
    requested_count: number;
    processed_amount: number;
    policy_acknowledged: string;
  };
  communications?: Array<{
    timestamp: string;
    sender: string;
    message: string;
  }>;
}

export interface ModelMetrics {
  dataset_split: {
    training_records: number;
    validation_records: number;
    held_out_test_records: number;
    split_type: string;
    imbalance_strategy: string;
  };
  selected_model: string;
  held_out_test_metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    pr_auc: number;
    roc_auc: number;
    false_positive_rate: number;
    accuracy?: number;
  };
  confusion_matrix: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
    total_test_samples?: number;
  };
  comparison_table: Array<{
    model: string;
    precision: number;
    recall: number;
    f1: number;
    pr_auc: number;
    roc_auc: number;
    selected: boolean;
  }>;
  cost_impact: {
    default_chargeback_loss: number;
    default_verification_cost: number;
    baseline_expected_loss: number;
    ai_expected_loss: number;
    potential_savings: number;
    loss_reduction_percentage: number;
  };
}

export interface AnomalyAlert {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'INFO' | 'WARNING';
  title: string;
  message: string;
  timestamp: string;
  action: string;
}

export interface RazorpayConfig {
  configured: boolean;
  mode: 'SANDBOX' | 'DEMO';
  key_id: string;
  webhook_configured: boolean;
  features: {
    standard_checkout: boolean;
    signature_verification: boolean;
    idempotent_webhooks: boolean;
    realtime_risk_scoring: boolean;
    shap_waterfall_explanations: boolean;
  };
}

export interface PaymentTestResponse {
  success: boolean;
  signature_verified: boolean;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  transaction: Transaction;
  risk_analysis: {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    probability: number;
    recommended_action: string;
    action_reason: string;
    top_shap_factors: SHAPFactor[];
  };
  alert?: AnomalyAlert | null;
}

