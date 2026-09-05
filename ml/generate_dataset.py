"""
ChargebackShield AI - Synthetic Transaction Dataset Generator
Generates realistic merchant payment transaction data with non-trivial risk patterns,
realistic noise, and time-based split for defense-only risk management.

Synthetic Dataset Notice:
This dataset is synthetic and intended for demonstration and testing of merchant chargeback risk management.
"""

import json
import random
import math
from datetime import datetime, timedelta

def generate_transactions(count=100000, seed=42):
    random.seed(seed)
    
    start_date = datetime(2026, 1, 1, 0, 0, 0)
    payment_methods = ["UPI", "Credit Card", "Debit Card", "Netbanking", "Wallet"]
    merchant_categories = ["Electronics", "Fashion", "Digital Goods", "Travel", "Groceries", "Jewelry", "Services"]
    
    cities = ["Mumbai", "Bengaluru", "Delhi", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Surat"]
    device_types = ["iOS", "Android", "Windows", "MacOS", "Linux"]
    browsers = ["Chrome", "Safari", "Firefox", "Edge", "Mobile Web"]
    
    transactions = []
    customers = {}
    
    # Generate 15,000 distinct customer profiles
    for i in range(15000):
        c_id = f"CUST_{10000 + i}"
        account_age = random.randint(1, 1200) # days
        base_city = random.choice(cities)
        base_device = random.choice(device_types)
        historical_cb = 1 if (random.random() < 0.04 and account_age > 60) else (2 if random.random() < 0.008 else 0)
        historical_refunds = random.choices([0, 1, 2, 3], weights=[0.8, 0.13, 0.05, 0.02])[0]
        customers[c_id] = {
            "account_age": account_age,
            "base_city": base_city,
            "base_device": base_device,
            "previous_chargebacks": historical_cb,
            "previous_refunds": historical_refunds,
            "tx_count": random.randint(1, 45) if account_age > 30 else random.randint(1, 4)
        }
        
    for i in range(count):
        # Time distribution: spanning 180 days
        seconds_offset = int((i / count) * 180 * 86400) + random.randint(-300, 300)
        seconds_offset = max(0, seconds_offset)
        tx_time = start_date + timedelta(seconds=seconds_offset)
        
        c_id = f"CUST_{10000 + random.randint(0, 14999)}"
        cust = customers[c_id]
        
        # Increment transaction count
        cust["tx_count"] += 1
        
        payment_method = random.choices(
            payment_methods, 
            weights=[0.48, 0.26, 0.14, 0.08, 0.04]
        )[0]
        
        category = random.choices(
            merchant_categories,
            weights=[0.22, 0.25, 0.15, 0.12, 0.16, 0.04, 0.06]
        )[0]
        
        # Base Amount
        if category in ["Jewelry", "Electronics", "Travel"]:
            amount = round(random.lognormvariate(8.8, 0.7), 2) # ~3000 to ~25000
        elif category in ["Digital Goods"]:
            amount = round(random.lognormvariate(6.8, 0.9), 2) # ~500 to ~8000
        else:
            amount = round(random.lognormvariate(6.2, 0.8), 2) # ~300 to ~4000
            
        amount = max(100.0, min(150000.0, amount))
        
        # Device & Location features
        device_change = 1 if (random.random() < 0.18) else 0
        device_type = random.choice(device_types) if device_change else cust["base_device"]
        device_age = random.randint(1, 800) if not device_change else random.randint(0, 5)
        
        location_change = 1 if (random.random() < 0.14) else 0
        current_city = random.choice(cities) if location_change else cust["base_city"]
        
        billing_shipping_match = 0 if (random.random() < 0.12 or (category == "Electronics" and random.random() < 0.22)) else 1
        
        # Velocity and failed attempts
        tx_velocity = random.choices([1, 2, 3, 4, 5, 8], weights=[0.75, 0.15, 0.05, 0.03, 0.015, 0.005])[0]
        failed_attempts = random.choices([0, 1, 2, 3, 4], weights=[0.88, 0.08, 0.025, 0.01, 0.005])[0]
        
        tx_hour = tx_time.hour
        is_night = 1 if (tx_hour >= 23 or tx_hour <= 4) else 0
        
        # Calculate Ground Truth Risk Probability (Logistic Link with realistic interactions & noise)
        log_odds = -4.5 # Base rate ~1.1%
        
        # Amount impact (high amount in digital/electronics)
        if amount > 12000:
            log_odds += 1.15
        elif amount > 5000:
            log_odds += 0.55
            
        # Dispute history impact
        if cust["previous_chargebacks"] > 0:
            log_odds += 1.85 * cust["previous_chargebacks"]
            
        if cust["previous_refunds"] > 1:
            log_odds += 0.45
            
        # New device / high velocity
        if device_change and device_age < 3:
            log_odds += 0.95
            
        if tx_velocity >= 3:
            log_odds += 1.10
        elif tx_velocity == 2:
            log_odds += 0.35
            
        if failed_attempts >= 2:
            log_odds += 1.25
        elif failed_attempts == 1:
            log_odds += 0.40
            
        if not billing_shipping_match:
            log_odds += 0.85
            
        if location_change and is_night:
            log_odds += 0.90
            
        if cust["account_age"] < 15 and amount > 8000:
            log_odds += 1.30
            
        if category == "Digital Goods" and payment_method in ["Credit Card", "Wallet"]:
            log_odds += 0.45
            
        # Add realistic noise / unobserved factors
        noise = random.gauss(0, 0.75)
        prob = 1.0 / (1.0 + math.exp(-(log_odds + noise)))
        
        is_chargeback = 1 if (random.random() < prob) else 0
        
        # Dataset partition based on timestamp (Time-based split)
        # First 70% -> Train (0 to 69,999)
        # Next 15% -> Validation (70,000 to 84,999)
        # Last 15% -> Held-out Test (85,000 to 99,999)
        if i < int(count * 0.70):
            split = "train"
        elif i < int(count * 0.85):
            split = "validation"
        else:
            split = "test"
            
        tx = {
            "transaction_id": f"RZP_{8200000 + i}",
            "timestamp": tx_time.strftime("%Y-%m-%d %H:%M:%S"),
            "amount": amount,
            "payment_method": payment_method,
            "merchant_category": category,
            "customer_id": c_id,
            "customer_account_age": cust["account_age"],
            "customer_transaction_count": cust["tx_count"],
            "previous_chargebacks": cust["previous_chargebacks"],
            "previous_refunds": cust["previous_refunds"],
            "device_age": device_age,
            "device_change_count": 1 if device_change else 0,
            "transaction_velocity": tx_velocity,
            "failed_attempts": failed_attempts,
            "billing_shipping_match": billing_shipping_match,
            "location_change": location_change,
            "transaction_hour": tx_hour,
            "order_value": amount,
            "device_type": device_type,
            "city": current_city,
            "chargeback": is_chargeback,
            "split": split
        }
        transactions.append(tx)
        
    return transactions

if __name__ == "__main__":
    print("Generating 100,000 synthetic transaction records...")
    data = generate_transactions(100000)
    cb_count = sum(t["chargeback"] for t in data)
    print(f"Generated {len(data)} transactions. Chargebacks: {cb_count} ({cb_count/len(data)*100:.2f}%)")
    with open("data/synthetic_transactions_100k.json", "w") as f:
        json.dump(data[:5000], f, indent=2)
    print("Sample saved to data/synthetic_transactions_100k.json")
