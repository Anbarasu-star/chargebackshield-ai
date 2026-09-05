"""
Pydantic Schemas for ChargebackShield AI
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TransactionPredictRequest(BaseModel):
    transaction_id: str
    amount: float
    payment_method: str = "Credit Card"
    merchant_category: str = "Electronics"
    customer_id: Optional[str] = "CUST_9999"
    customer_account_age: int = 30
    customer_transaction_count: int = 1
    previous_chargebacks: int = 0
    previous_refunds: int = 0
    device_age: int = 100
    device_change_count: int = 0
    transaction_velocity: int = 1
    failed_attempts: int = 0
    billing_shipping_match: int = 1
    location_change: int = 0
    transaction_hour: int = 14

class TopFactor(BaseModel):
    feature: str
    feature_key: Optional[str] = ""
    impact: float
    direction: Optional[str] = "positive"
    description: Optional[str] = ""

class PredictionResponse(BaseModel):
    transaction_id: str
    risk_score: int
    risk_level: str
    probability: float
    recommended_action: str
    action_reason: str
    top_factors: List[TopFactor]

class ChargebackCaseCreate(BaseModel):
    transaction_id: str
    reason: str
    reason_code: Optional[str] = "10.4"
    claimed_amount: float
    customer_notes: Optional[str] = ""

class CostModelParameters(BaseModel):
    average_chargeback_loss: float = 2000.0
    verification_cost: float = 50.0
    threshold: Optional[int] = 60
