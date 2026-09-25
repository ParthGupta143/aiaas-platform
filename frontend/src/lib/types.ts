export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: "production" | "designed";
  price_per_request: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  status: "active" | "revoked";
  created_at: string;
  revoked_at: string | null;
}

export interface ApiKeyCreated extends ApiKey {
  api_key: string;
}

export interface UsageStats {
  total_requests: number;
  error_count: number;
  error_rate: number;
  avg_latency_ms: number;
  estimated_cost: number;
}

export interface RequestLogEntry {
  id: string;
  service: string;
  status_code: number;
  latency_ms: number;
  model_version: string | null;
  created_at: string;
}

export interface RequestLogsResponse {
  items: RequestLogEntry[];
  total: number;
  page: number;
  page_size: number;
}

export interface FraudCheckRequest {
  amount: number;
  transaction_hour: number;
  merchant_category: string;
  customer_age: number;
  previous_transactions: number;
}

export interface FraudCheckResponse {
  prediction: string;
  fraud_probability: number;
  risk_level: string;
  model_version: string;
  top_risk_factors: string[];
  request_id: string;
}


export interface BillingServiceLine {
  service_slug: string;
  service_name: string;
  requests_used: number;
  price_per_request: number;
  estimated_cost: number;
}

export interface BillingSummary {
  period: string;
  lines: BillingServiceLine[];
  total_estimated_cost: number;
}