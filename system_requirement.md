# Cladfy Customization Requirements
## GFF Loan Management - Waterfall Payment Collection System

**Date:** November 6, 2025  
**Purpose:** Cladfy Integration for Defaulted Borrower Loan Management

---

## 1. OVERVIEW

We are integrating Cladfy to track and manage all our loan accounts. Currently, we have a set of defaulted borrowers, and based on the judgment, a revised loan repayment structure needs to be created for them.

Each loan consists of **four priority components** that must be paid in strict waterfall priority order. Every weekly installment (KES 2,200) will be automatically split across these four components following the priority sequence.

---

## 2. LOAN STRUCTURE

### 2.1 Four Priority Components (in order of payment priority):

1. **Third-Party Fee**
2. **Collateral Fee**
3. **Outstanding Interest** (accumulated due to non-payment)
4. **Principal Amount** (school fees and other financed items)

### 2.2 Repayment Parameters

- **Weekly Installment:** Fixed at KES 2,200 per borrower (no flexibility or adjustment)
- **Loan Tenure:** Not fixed - extends based on annual fees. Typically 127–137 weeks (~2.4–2.6 years)
- **Payment Frequency:** Every Friday only (via M-Pesa through GFF app)
- **Upfront Settlement:** One-time KES 15,000 collected before weekly installments begin

---

## 3. WATERFALL PAYMENT ALLOCATION MODEL

### 3.1 Allocation Logic (Per KES 2,200 Weekly Installment)

Each weekly payment is allocated sequentially to priority components in this exact order:

**Priority 1 → Third-Party Fee** (paid until completely cleared)  
**Priority 2 → Collateral Fee** (paid until completely cleared)  
**Priority 3 → Outstanding Interest** (paid until completely cleared)  
**Priority 4 → Principal Amount** (paid until loan is fully repaid)

### 3.2 Waterfall Example

**Loan Components:**
- Third-Party Fee: KES 9,000 (annual: GFF Subscription 5,000 + Hospital Cash 2,000 + Insurance 2,000)
- Collateral Fee: KES 14,350
- Outstanding Interest: KES 47,232
- Principal Amount: KES 164,357
- **Total Recovery: KES 234,939** (less KES 15,000 upfront = KES 219,939 via installments)

**Payment Allocation Schedule:**

| Weeks | Weekly Payment | Allocation | Component Paid | Running Balance |
|---|---|---|---|---|
| 1–4 | KES 2,200 × 4 | KES 8,800 | Third-Party Fee | TPF: 200 remaining |
| 5 | KES 2,200 | KES 200 to TPF + 2,000 to Collateral | Third-Party Fee + Collateral Fee | TPF: Complete; CF: 12,350 remaining |
| 6–10 | KES 2,200 × 5 | KES 11,000 | Collateral Fee | CF: 1,350 remaining |
| 11 | KES 2,200 | KES 1,350 to CF + 850 to Interest | Collateral Fee + Outstanding Interest | CF: Complete; OI: 46,382 remaining |
| 12–31 | KES 2,200 × 20 | KES 44,000 | Outstanding Interest | OI: 2,382 remaining |
| 32 | KES 2,200 | KES 2,382 to Interest + remainder to Principal | Outstanding Interest | OI: Complete |
| 33+ | KES 2,200 | Entire amount | Principal Amount | Reducing principal balance |

### 3.3 Upfront Settlement (KES 15,000) Allocation

The KES 15,000 upfront payment is also split using the same waterfall priority:

**Example from PDF:**
- KES 9,000 → Third-Party Fee (Year 1 annual fee)
- KES 6,000 → Collateral Fee (partial)
- Remaining (if any) → Collateral Fee → Outstanding Interest → Principal

This reduces the total amount due via weekly installments.

---

## 4. THIRD-PARTY FEE MANAGEMENT

### 4.1 Annual Calculation

- **Third-Party Fee is calculated on an annual basis**
- Example: KES 9,000 per year (GFF Subscription 5k + Hospital Cash 2k + Insurance 2k)
- Fee is charged annually; tenure may extend by 1 week for each year to accommodate annual fees
- Year 1: Week 52 → Add KES 9,000 (extends tenure by 1 week)
- Year 2: Week 104 → Add KES 9,000 (extends tenure by 1 week)

### 4.2 Account Segregation (Central Third-Party Account)

- **All Third-Party Fee collections from ALL borrowers and ALL cohorts go to ONE single dedicated third-party account**
- No segregation by cohort for TPF
- Example:
    - Cohort 1 borrower pays TPF portion → Cohort 1 TPF goes to Main 3rd Party Account
    - Cohort 2 borrower pays TPF portion → Cohort 2 TPF goes to same Main 3rd Party Account
    - Cohort 6 borrower pays TPF portion → Cohort 6 TPF goes to same Main 3rd Party Account
    - **All mixed together in ONE account**

### 4.3 Monthly TPF Reconciliation

- System tracks total TPF collected across all borrowers from all cohorts
- Monthly reconciliation verifies:
    - Total TPF collected in system matches bank statement
    - No discrepancies or missing deposits
    - All payments accounted for

---

## 5. COLLATERAL FEE MANAGEMENT (COHORT-WISE DISBURSEMENT)

### 5.1 Cohort-Based Account Segregation

**Collateral fees MUST be collected and deposited cohort-wise (STRICT SEGREGATION):**

- Each cohort has its own **dedicated collateral bank account**
- **CRITICAL:** All collateral fees from borrowers in Cohort X go ONLY to Cohort X bank account
- No mixing between cohorts
- No cross-cohort transfers allowed

**Example Structure:**
- **Cohort 1:** 30 borrowers → All their collateral fees → **Cohort 1 Collateral Account**
- **Cohort 2:** 25 borrowers → All their collateral fees → **Cohort 2 Collateral Account**
- **Cohort 3:** 28 borrowers → All their collateral fees → **Cohort 3 Collateral Account**
- **Cohort 4:** 22 borrowers → All their collateral fees → **Cohort 4 Collateral Account**
- **Cohort 5:** 35 borrowers → All their collateral fees → **Cohort 5 Collateral Account**
- **Cohort 6:** 30 borrowers → All their collateral fees → **Cohort 6 Collateral Account**

**Total: 6 separate collateral accounts (one dedicated per cohort)**

### 5.2 Collateral Fee Collection & Disbursement to Cohort Accounts

**How it works:**

1. **Borrower Payment:** Borrower makes KES 2,200 weekly payment via M-Pesa
2. **Waterfall Allocation:** System calculates how much goes to each component (TPF, CF, OI, PA)
3. **Collateral Portion Identification:** System identifies the Collateral Fee portion of that KES 2,200
    - Example: If TPF is cleared, then KES 2,200 might be: KES 1,500 to Collateral Fee + KES 700 to Outstanding Interest
4. **Cohort Account Routing:** The KES 1,500 collateral fee is immediately routed to the borrower's assigned cohort account
    - If borrower is in Cohort 1 → KES 1,500 goes to Cohort 1 Collateral Account
    - If borrower is in Cohort 3 → KES 1,500 goes to Cohort 3 Collateral Account
    - And so on for all borrowers

### 5.3 Practical Example (Multiple Borrowers in Same Cohort)

**Cohort 1 Scenario (4 borrowers in this example):**

| Borrower | Week | Payment | TPF Portion | Collateral Portion | Interest Portion | Routing |
|---|---|---|---|---|---|---|
| B1 | Week 5 | 2,200 | 0 | 1,800 | 400 | 1,800 → Cohort 1 Account |
| B2 | Week 5 | 2,200 | 0 | 1,800 | 400 | 1,800 → Cohort 1 Account |
| B3 | Week 5 | 2,200 | 0 | 1,800 | 400 | 1,800 → Cohort 1 Account |
| B4 | Week 5 | 2,200 | 0 | 1,800 | 400 | 1,800 → Cohort 1 Account |

**Result:** Total KES 7,200 in collateral fees deposited to **Cohort 1 Collateral Account** that week

**Similarly, for Cohort 2 (different account):**
- All Cohort 2 borrowers' collateral fees → Cohort 2 Collateral Account (separate)

## 6. OUTSTANDING INTEREST & PRINCIPAL ALLOCATION

### 6.1 Payment Sequence

After Third-Party Fee and Collateral Fee are fully paid:

- **Remaining installment → Outstanding Interest** (paid until fully cleared)
- **Then → Principal Amount** (paid until loan completion)

### 6.2 Outstanding Interest

- Accumulated interest due to non-payment / default period
- Example: KES 47,232 (interest till judgment date)
- Applied after collateral fee is cleared
- Goes to operational/collections account (no specific segregation)

### 6.3 Principal Amount

- Original financed amount (school fees and other financed items)
- Applied after outstanding interest is cleared
- Goes to operational/collections account
- Once principal reaches zero, loan is fully repaid

---

## 7. UPFRONT SETTLEMENT AGREEMENT

### 7.1 KES 15,000 Upfront Collection

- **One-time amount:** Exactly KES 15,000
- **Timing:** Collected before weekly installments commence
- **Payment Method:** M-Pesa via GFF app
- **Purpose:** Settlement agreement for defaulted borrower restructuring

### 7.2 Upfront Allocation (Using Same Waterfall Priority)

- Applied to reduce total recovery amount
- Distributed using the same waterfall priority order:
    1. First to Third-Party Fee (up to annual amount) → Goes to Main 3rd Party Account
    2. Then to Collateral Fee → Goes to borrower's assigned Cohort Collateral Account
    3. Then to Outstanding Interest → Goes to operational account
    4. Then to Principal → Goes to operational account

### 7.3 Upfront Payment Workflow

1. Loan officer creates settlement agreement with KES 15,000 term
2. System generates payment request/instruction
3. Borrower receives SMS: "Settlement amount KES 15,000 required for loan restructuring. Reply to proceed with M-Pesa payment"
4. M-Pesa prompt sent to borrower's registered mobile
5. Borrower enters PIN and confirms payment
6. Upon successful payment, borrower receives confirmation
7. Upfront payment is split and routed:
    - KES 9,000 to 3rd Party Account
    - KES 6,000 to Cohort Collateral Account (borrower's assigned cohort)
8. Loan status changes to "Active - Weekly Collection Ready"
9. Weekly installments (KES 2,200) commence the following Friday

---

## 8. PAYMENT CHANNEL & SCHEDULE

### 8.1 Payment Method

- **Channel:** M-Pesa (Safaricom mobile payment)
- **Integration:** Via M-Pesa Daraja API (STK Push integration)
- **App Integration:** Through GFF mobile app

### 8.2 Weekly Payment Schedule

- **Collection Day:** ONLY Fridays
- **Installment Amount:** Fixed KES 2,200 per week
- **Payment Window:** Flexible on Friday (7 AM – 11:59 PM)

### 8.3 Payment Processing & Automatic Routing

1. System initiates M-Pesa STK Push to borrower's phone on Friday
2. Borrower enters PIN and confirms payment of KES 2,200
3. M-Pesa processes and confirms payment
4. System receives payment confirmation and transaction ID
5. **Waterfall allocation executed:** KES 2,200 split across 4 components
6. **Automatic Account Routing:**
    - TPF portion → 3rd Party Account (centralized)
    - Collateral portion → Borrower's Cohort Collateral Account (cohort-specific)
    - Interest portion → Operational Account
    - Principal portion → Operational Account
7. All component balances updated in real-time
8. Confirmation SMS/notification sent to borrower
9. Payment recorded in borrower's account history with allocation breakdown

### 8.4 Failed Payment Handling

- If payment fails: Automatic retry after 1 hour (up to 3 retries)
- Each failed attempt logged with error code
- Borrower receives SMS notification of retry
- If all retries fail: Account flagged as "Missed Payment" for review
- Loan officer can manually trigger collection attempt

---

## 9. AUTOMATED PAYMENT REMINDER SYSTEM

### 9.1 Reminder Schedule

**2–3 days before the due date**, system sends automated reminders:

- **Wednesday Reminder:** "Your next payment of KES 2,200 is due this Friday [Date]. Please arrange for payment via M-Pesa. Thank you!"
- **Thursday Reminder (if payment not received):** "Payment reminder: KES 2,200 due TOMORROW (Friday). Reply YES to pay now"
- **Sunday Reminder (if payment still pending):** "Payment deadline passed. Please arrange payment immediately to avoid default"

### 9.2 Reminder Channels

- **Primary:** SMS (guaranteed delivery on all phones)
- **Secondary:** Push notification via GFF app (if app installed)
- **Tertiary:** WhatsApp (if borrower opted-in and number available)

### 9.3 Reminder Content

Each reminder must include:
- Borrower name
- Payment amount: **KES 2,200**
- Due date: **This Friday**
- Payment method: M-Pesa via GFF app
- Action: Link to pay or instruction to reply

### 9.4 Reminder Customization

Borrowers can set preferences:
- Reminder frequency: 2 or 3 per week
- Preferred channel: SMS, Push, WhatsApp, or all
- Preferred time: Morning, Afternoon, or Evening
- Language preference: English, Swahili, or other

---

## 10. REAL-TIME TRACKING & REPORTING

### 10.1 Per-Borrower Account Tracking

System must display for each borrower:

| Component | Original Amount | Amount Paid | Remaining Balance |
|---|---|---|---|
| **Third-Party Fee** | 9,000 | XXX | XXX |
| **Collateral Fee** | 14,350 | XXX | XXX |
| **Outstanding Interest** | 47,232 | XXX | XXX |
| **Principal Amount** | 164,357 | XXX | XXX |
| **TOTAL RECOVERY** | 234,939 | XXX | XXX |

Additional tracking:
- Current account status (Active / On Track / Missed Payment / Defaulted / Completed)
- Assigned Cohort (1–6)
- Last payment date, amount, and allocation breakdown
- Next payment due date
- Payment history (last 12 weeks) with per-payment component breakdown
- Projected completion date

### 10.2 Per-Payment Breakdown Report

For each KES 2,200 payment, system generates:

- Payment date & transaction ID
- Borrower name, ID & assigned Cohort
- Total amount received: KES 2,200
- Allocation breakdown:
    - Amount to Third-Party Fee
    - Amount to Collateral Fee
    - Amount to Outstanding Interest
    - Amount to Principal Amount
- Component balances before & after payment
- Destination account routing:
    - TPF portion → 3rd Party Account
    - CF portion → [Cohort X] Collateral Account
    - Interest portion → Operational Account
    - Principal portion → Operational Account
- Payment status (Success / Failed / Pending)

### 10.3 Portfolio-Level Reporting

Dashboard showing:
- Total active loans
- Total collected to date (all components combined)
- Total collected by component type:
    - Third-Party Fees collected (across all cohorts, central account)
    - Collateral Fees collected by cohort:
        - Cohort 1: Amount collected & account balance
        - Cohort 2: Amount collected & account balance
        - ... Cohort 6: Amount collected & account balance
    - Outstanding Interest collected
    - Principal collected
- Recovery rate (% of total recovery achieved)
- Payment collection rate (% of installments collected on schedule)
- Defaulted accounts count (by cohort)
- Projected total recovery timeline

### 10.4 Cohort-Specific Reporting

For each cohort (1–6):

- **Collateral Account Status:**
    - Cohort ID & Account Name
    - Dedicated bank account number
    - Number of active borrowers in cohort
    - Total collateral fees assigned to this cohort
    - Total collateral fees collected to date
    - Current bank account balance
    - Pending deposits (collected but not yet in bank)

- **Member Borrower Status:**
    - List of all borrowers in cohort
    - Payment status for each (Active / On Track / Missed / Defaulted / Completed)
    - Individual collateral fee contribution to cohort account

- **Recovery & Deductions:**
    - Total deductions made (for defaults)
    - List of deductions (borrower name, amount, date, reason)
    - Remaining cohort account balance after deductions

- **Monthly Reconciliation:**
    - Expected balance (collected - deducted)
    - Actual bank balance
    - Reconciliation status
    - Any discrepancies flagged

---

## 11. ACCOUNT SEGREGATION SUMMARY

| Account Type | Purpose | Contents | Routing |
|---|---|---|---|
| **Main 3rd Party Account** | Receive all Third-Party Fee collections | TPF from ALL borrowers, ALL cohorts (mixed) | From every borrower's payment |
| **Cohort 1 Collateral Account** | Collateral fees for Cohort 1 only | CF from only Cohort 1 borrowers | From Cohort 1 borrowers' payments |
| **Cohort 2 Collateral Account** | Collateral fees for Cohort 2 only | CF from only Cohort 2 borrowers | From Cohort 2 borrowers' payments |
| **Cohort 3 Collateral Account** | Collateral fees for Cohort 3 only | CF from only Cohort 3 borrowers | From Cohort 3 borrowers' payments |
| **Cohort 4 Collateral Account** | Collateral fees for Cohort 4 only | CF from only Cohort 4 borrowers | From Cohort 4 borrowers' payments |
| **Cohort 5 Collateral Account** | Collateral fees for Cohort 5 only | CF from only Cohort 5 borrowers | From Cohort 5 borrowers' payments |
| **Cohort 6 Collateral Account** | Collateral fees for Cohort 6 only | CF from only Cohort 6 borrowers | From Cohort 6 borrowers' payments |
| **Operational Account** | Interest & Principal collections | OI + PA from all borrowers, all cohorts | From every borrower's payment |

**KEY RULE:** No cross-cohort transfers. Cohort 1 collateral NEVER goes to Cohort 2, 3, 4, 5, or 6 accounts.

---

## 12. SYSTEM REQUIREMENTS FOR CLADFY

### Functional Requirements:

✅ **Fixed Installment Lock:** Weekly installment must be exactly KES 2,200; cannot be changed after settlement  
✅ **Waterfall Priority Enforcement:** Every payment strictly allocated per priority (TPF → CF → OI → PA)  
✅ **Upfront Settlement:** KES 15,000 collected upfront before weekly installments commence  
✅ **Third-Party Account Centralization:** All TPF from all cohorts routed to ONE central 3rd party account  
✅ **Cohort Collateral Accounts:** 6 separate collateral accounts with strict cohort segregation (no cross-cohort mixing)  
✅ **Collateral Automatic Routing:** Each borrower's collateral fee portion automatically routed to their assigned cohort account  
✅ **Recovery Deduction:** Support for cohort account deduction in case of individual borrower default  
✅ **M-Pesa Integration:** STK Push for payment collection, real-time status checking  
✅ **GFF App Integration:** Display payment schedule, send reminders, receive payment confirmation  
✅ **Automated Reminders:** SMS/Push 2–3 days before Friday payment  
✅ **Payment History:** Detailed per-installment allocation breakdown with account routing  
✅ **Real-Time Tracking:** Component-wise balance display per borrower  
✅ **Cohort Account Tracking:** Real-time balance per cohort collateral account  
✅ **Monthly Reconciliation:** Cohort-wise account reconciliation with bank statements

### Non-Functional Requirements:

- **Performance:** Payment allocation & routing completes within 5 seconds of receipt
- **Availability:** 99.5% system uptime
- **Security:** Data encryption (TLS 1.2+), role-based access control, audit trails for all deductions
- **Scalability:** Support up to 10,000 borrowers, 6 cohorts
- **Compliance:** PCI-DSS for payment data, GDPR-compatible

---

## 13. QUESTIONS FOR CLADFY

1. Can Cladfy support fixed KES 2,200 weekly installment with strict waterfall priority allocation?
2. Can Cladfy automatically route payments to multiple bank accounts (1 central 3rd party + 6 cohort collateral)?
3. Can Cladfy enforce strict cohort segregation (prevent cross-cohort transfers)?
4. Can Cladfy handle annual fee extensions (adding weeks to tenure for annual TPF)?
5. Is M-Pesa integration via Daraja API included or needs separate development?
6. Can Cladfy support GFF app integration for payment reminders and history display?
7. Does Cladfy generate per-payment waterfall breakdown reports with account routing details?
8. Does Cladfy support cohort-wise collateral deduction in case of default with authorization logs?

---

**End of Requirements Document**

*This document outlines all customization requirements for Cladfy integration with emphasis on cohort-wise collateral disbursement. Share with Cladfy team for assessment and feasibility confirmation.*
