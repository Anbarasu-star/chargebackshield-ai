# ChargebackShield AI

> **“Predict payment risk. Prevent avoidable losses. Defend every dispute.”**
> *Razorpay Hackathon – Track 02: AI Risk Manager*

ChargebackShield AI is a **defense-only** merchant risk-management platform designed to proactively protect merchants from payment disputes, friendly fraud, and chargeback revenue leakage without causing customer checkout friction.

---
## 🚀 Live Demo

### 🔗 ChargebackShield AI

**Try the working prototype:**
👉 **[Launch ChargebackShield AI Demo](https://ai.studio/apps/d1ae6232-cbb7-4f84-a7d9-cb28c53b6d3f)**
     demo link - https://chargeback-ai.netlify.app/

> **Demo:** AI Studio Prototype
> **Track:** Razorpay Hackathon — Track 02: AI Risk Manager
> **Focus:** Fraud • Returns • Chargebacks • Merchant Risk

### 🎯 What the Demo Shows

ChargebackShield AI demonstrates an AI-powered merchant protection workflow:

**Predict → Explain → Verify → Defend**

* 🔍 Real-time transaction risk analysis
* 📊 Risk scoring from 0–100
* 🤖 AI-powered risk explanations
* ⚠️ Fraud and anomaly detection
* 💰 Expected-loss analysis
* 🛡️ Chargeback defense
* 📄 Evidence generation
* 📈 Merchant risk analytics
* ⚡ Action recommendations for high-risk transactions

### 🧩 Demo Architecture

```text
Razorpay Payment
       ↓
Transaction Verification
       ↓
AI Risk Engine
       ↓
Risk Score 0–100
       ↓
Explainable AI
       ↓
Fraud / Return / Chargeback Risk
       ↓
Recommended Action
       ↓
Merchant Dashboard
       ↓
Chargeback Evidence
```


## Core Paradigm: Predict → Explain → Verify → Defend

| Stage | Action |
|---|---|
| **1. Predict** | Calibrated machine learning pipeline (XGBoost + scale_pos_weight) predicts chargeback probability (0–100 score). |
| **2. Explain** | SHAP (SHapley Additive exPlanations) tree explainer highlights the exact contribution of each transaction attribute. |
| **3. Verify** | Action engine recommends proportionate actions (ALLOW, ADDITIONAL_VERIFICATION, MANUAL_REVIEW, ENHANCED_VERIFICATION). |
| **4. Defend** | RAG Evidence Assistant automatically structures merchant facts into audit-ready dispute packages. |

---

## Key Features

1. **Transaction Risk Scoring**: 0–100 risk score classified as LOW (0–30), MEDIUM (31–60), HIGH (61–80), CRITICAL (81–100).
2. **True SHAP Explanations**: Visual waterfall/bar breakdown of feature contributions (Previous chargeback history +24, New device +18, High amount +15, Velocity +12, Billing mismatch +9).
3. **Statistical Anomaly Monitor**: Detects transaction volume and dispute velocity spikes (e.g. Baseline 250 tx/hr vs. Spike 740 tx/hr).
4. **False-Positive Cost Optimization Model**:
   $$\text{Expected Loss} = (\text{FN} \times \text{Chargeback Loss}) + (\text{FP} \times \text{Verification Cost})$$
   Dynamically simulates merchant financial loss reduction across configurable cost parameters.
5. **RAG-Assisted Evidence Generator**: Ingests internal merchant records (ERP, Courier AWB, 3D-Secure, IP/Device logs, Zendesk/Freshdesk chats) to assemble defensible responses with zero fabrication.
6. **Honest Held-Out ML Evaluation**: Time-based chronological train/validation/test split with live "Run Test Evaluation" button.

---

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Recharts, Lucide Icons, Motion.
- **Backend / Server**: Express + Node.js full-stack runtime with Python FastAPI ML services.
- **Machine Learning**: XGBoost, Scikit-learn, SHAP, Pandas, NumPy, Joblib.
- **AI & RAG**: Google Gemini Flash API + Deterministic Template Fallback.
- **Data & Storage**: SQLite / PostgreSQL architecture, synthetic 100k transaction dataset.
- **Testing & Deployment**: Pytest, Docker, Docker Compose.

---

## 3-Minute Hackathon Demo Script

1. **Overview**: View live portfolio KPIs (₹12.4L potential loss, ₹8.4L prevented, 1.4% risk rate).
2. **Transaction Risk**: Open high-risk transaction `RZP_8239281` (Score: 87/100, HIGH).
3. **Explainability**: Inspect SHAP breakdown showing +24 chargeback history, +18 new device.
4. **Action Engine**: View recommended action: *"Manual verification before fulfillment"*.
5. **Chargeback Cases**: Open case `CB_8291` and inspect 8 merchant record streams.
6. **Defend**: Click *"Generate Evidence"* to build instant RAG response draft.
7. **Model Performance**: Click *"Run Test Evaluation"* to verify live PR-AUC (0.892) & ROC-AUC (0.946).
8. **Business Impact**: Adjust cost sliders to witness ₹4.08L+ in net expected merchant savings.

---
> **Note:** The prototype may use synthetic/demo data for demonstration. Production deployment should use verified Razorpay transaction data, authenticated webhooks, secure credentials, and properly validated ML evaluation datasets.

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Build for production
npm run build
npm start
```
