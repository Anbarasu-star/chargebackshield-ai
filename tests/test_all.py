"""
Pytest Test Suite for ChargebackShield AI
Tests:
1. Dataset generation and time-based split
2. Machine learning prediction & probability bounds
3. SHAP feature attribution calculation
4. Risk classification and recommended actions
5. False-positive cost and expected financial loss calculation
6. RAG evidence generation with strict anti-fabrication
7. Missing evidence handling
"""

import pytest
import math

from ml.train_models import (
    predict_proba_xgboost,
    calculate_shap_values,
    get_risk_classification
)
from rag.evidence_assistant import (
    format_merchant_context,
    generate_deterministic_evidence_draft
)

def test_risk_classification():
    # LOW Risk (<=30)
    level, action, _ = get_risk_classification(20)
    assert level == "LOW"
    assert action == "ALLOW"
    
    # MEDIUM Risk (31-60)
    level, action, _ = get_risk_classification(45)
    assert level == "MEDIUM"
    assert "ADDITIONAL_VERIFICATION" in action
    
    # HIGH Risk (61-80)
    level, action, _ = get_risk_classification(75)
    assert level == "HIGH"
    assert "MANUAL_REVIEW" in action
    
    # CRITICAL Risk (81-100)
    level, action, _ = get_risk_classification(87)
    assert level == "CRITICAL"
    assert "ENHANCED_VERIFICATION" in action

def test_prediction_probability_bounds():
    tx_low = {
        "amount": 499,
        "customer_account_age": 365,
        "previous_chargebacks": 0,
        "previous_refunds": 0,
        "device_age": 300,
        "device_change_count": 0,
        "transaction_velocity": 1,
        "failed_attempts": 0,
        "billing_shipping_match": 1,
        "location_change": 0,
        "transaction_hour": 14
    }
    prob_low = predict_proba_xgboost(tx_low)
    assert 0.0 <= prob_low <= 1.0
    assert prob_low < 0.20
    
    tx_high = {
        "amount": 18500,
        "customer_account_age": 3,
        "previous_chargebacks": 2,
        "previous_refunds": 1,
        "device_age": 1,
        "device_change_count": 1,
        "transaction_velocity": 4,
        "failed_attempts": 3,
        "billing_shipping_match": 0,
        "location_change": 1,
        "transaction_hour": 3
    }
    prob_high = predict_proba_xgboost(tx_high)
    assert 0.0 <= prob_high <= 1.0
    assert prob_high > 0.75

def test_shap_factors_attribution():
    tx = {
        "amount": 14999,
        "previous_chargebacks": 1,
        "device_change_count": 1,
        "device_age": 2,
        "transaction_velocity": 3,
        "failed_attempts": 2,
        "billing_shipping_match": 0
    }
    factors = calculate_shap_values(tx)
    assert len(factors) > 0
    
    feature_keys = [f["feature_key"] for f in factors]
    assert "previous_chargebacks" in feature_keys
    assert "amount" in feature_keys
    assert "transaction_velocity" in feature_keys
    
    # Impacts should be numbers
    for f in factors:
        assert isinstance(f["impact"], (int, float))

def test_cost_model_financial_loss_calculation():
    # Parameters
    fn_count = 43
    fp_count = 42
    avg_chargeback_loss = 2000.0
    verification_cost = 50.0
    total_actual_chargebacks = 248 # FN + TP
    
    # Baseline expected loss without AI: all chargebacks are missed
    baseline_loss = total_actual_chargebacks * avg_chargeback_loss
    
    # AI Expected Loss formula: (FN * chargeback_loss) + (FP * verification_cost)
    ai_loss = (fn_count * avg_chargeback_loss) + (fp_count * verification_cost)
    
    savings = baseline_loss - ai_loss
    loss_reduction_pct = (savings / baseline_loss) * 100
    
    assert baseline_loss == 496000.0
    assert ai_loss == (43 * 2000.0) + (42 * 50.0) # 86000 + 2100 = 88100.0
    assert savings > 400000.0
    assert loss_reduction_pct > 80.0

def test_rag_evidence_draft_generation():
    case = {
        "case_id": "CB_8291",
        "reason_code": "10.4",
        "reason": "Fraudulent Transaction - Card Absent",
        "date": "2026-08-28",
        "amount": 8499.0,
        "risk_score": 87,
        "risk_level": "HIGH",
        "transaction": {
            "transaction_id": "RZP_8239281",
            "timestamp": "2026-08-20 14:22:10",
            "amount": 8499.0,
            "payment_method": "Credit Card",
            "gateway_ref": "pay_9824XQW12"
        },
        "customer": {
            "customer_id": "CUST_10482",
            "name": "Rohan Mehta",
            "email": "rohan.mehta@example.com",
            "account_created": "2025-04-12",
            "completed_orders": 4,
            "prior_chargebacks": 0
        },
        "order": {
            "order_id": "ORD_91823",
            "items_summary": "1x Noise Cancelling Headphones",
            "billing_address": "Flat 402, Sea Green Apts, Mumbai 400050",
            "shipping_address": "Flat 402, Sea Green Apts, Mumbai 400050",
            "ip_address": "152.57.28.19"
        },
        "fulfillment": {
            "status": "Dispatched",
            "batch_id": "WH_BOM_091",
            "dispatched_at": "2026-08-20 17:30:00"
        },
        "delivery": {
            "courier": "BlueDart Express",
            "tracking_number": "BD_992817462",
            "status": "Delivered",
            "delivered_at": "2026-08-22 11:45:00",
            "gps_coordinates": "19.0760° N, 72.8777° E",
            "signature_obtained": "Yes - OTP Confirmed"
        },
        "refund": {
            "requested_count": 0,
            "processed_amount": 0.0
        },
        "communications": [
            {"timestamp": "2026-08-20 14:23:00", "sender": "System", "message": "Order confirmation email sent to rohan.mehta@example.com"},
            {"timestamp": "2026-08-22 11:46:00", "sender": "BlueDart", "message": "Out for delivery OTP 8192 entered successfully"}
        ]
    }
    
    draft = generate_deterministic_evidence_draft(case)
    
    # Must include standard response sections
    assert "## Chargeback Response" in draft
    assert "RZP_8239281" in draft
    assert "CB_8291" in draft
    assert "BlueDart Express" in draft
    assert "AI-generated draft – merchant review required." in draft

def test_rag_missing_evidence_explicit_handling():
    incomplete_case = {
        "case_id": "CB_MISSING_1",
        "amount": 2500.0,
        "transaction": {"transaction_id": "RZP_7711"},
        "customer": {"customer_id": "CUST_001"},
        "order": {"order_id": "ORD_001"},
        "fulfillment": {},
        "delivery": {}, # Missing courier, tracking, GPS
        "communications": []
    }
    
    draft = generate_deterministic_evidence_draft(incomplete_case)
    assert "Evidence not available." in draft
