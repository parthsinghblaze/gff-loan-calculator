# GFK Loan Calculator - Formulas & Logic Documentation

## Overview
The GFK Loan Calculator uses a **waterfall payment model** with fixed weekly payments of 2,200 KES. This is NOT a traditional amortized loan - instead, payments are allocated in priority order, and interest compounds weekly on the remaining principal.

---

## 1. Fee Calculations

### GFF Fee (5%)
```
GFF Fee = (Total GFK Amount + Total Principal Amount) × 0.05
```

### Collateral Fee (10%)
```
Collateral Fee = (Total GFK Amount + Total Principal Amount) × 0.10
```

### Total GFK Fee
```
Total GFK Fee = Total GFK Amount + GFF Fee
```

**Example:**
- Total GFK Amount = 10,000 KES
- Total Principal Amount = 50,000 KES
- GFF Fee = (10,000 + 50,000) × 0.05 = 3,000 KES
- Collateral Fee = (10,000 + 50,000) × 0.10 = 6,000 KES
- Total GFK Fee = 10,000 + 3,000 = 13,000 KES

---

## 2. Interest Calculation

### Weekly Interest Rate
```
Annual Interest Rate (%) = User Input (default: 20%)
Weekly Interest Rate = (Annual Interest Rate ÷ 100) ÷ 52
```

### Weekly Interest Accrual
```
Weekly Interest Accrued = Remaining Principal × Weekly Interest Rate
```

**Example:**
- Annual Interest Rate = 20%
- Weekly Interest Rate = (20 ÷ 100) ÷ 52 = 0.003846 (0.3846% per week)
- If Remaining Principal = 50,000 KES
- Weekly Interest Accrued = 50,000 × 0.003846 = 192.30 KES

---

## 3. Upfront Amount Allocation

The upfront amount is applied using the **waterfall priority** BEFORE weekly payments begin:

### Priority Order:
1. **GFK Fee** (highest priority)
2. **Collateral Fee**
3. **Outstanding Interest**
4. **Principal** (lowest priority)

### Allocation Formula:
```
Let Remaining_Upfront = Total Upfront Amount

Step 1: Allocate to GFK Fee
   Allocation_to_GFK = Min(Remaining_Upfront, Total_GFK_Fee)
   Remaining_GFK_Fee = Total_GFK_Fee - Allocation_to_GFK
   Remaining_Upfront = Remaining_Upfront - Allocation_to_GFK

Step 2: Allocate to Collateral Fee
   Allocation_to_Collateral = Min(Remaining_Upfront, Collateral_Fee)
   Remaining_Collateral = Collateral_Fee - Allocation_to_Collateral
   Remaining_Upfront = Remaining_Upfront - Allocation_to_Collateral

Step 3: Allocate to Outstanding Interest
   Allocation_to_Interest = Min(Remaining_Upfront, Outstanding_Interest)
   Remaining_Interest = Outstanding_Interest - Allocation_to_Interest
   Remaining_Upfront = Remaining_Upfront - Allocation_to_Interest

Step 4: Allocate to Principal
   Allocation_to_Principal = Min(Remaining_Upfront, Total_Principal)
   Remaining_Principal = Total_Principal - Allocation_to_Principal
```

**Example:**
- Upfront Amount = 15,000 KES
- Total GFK Fee = 13,000 KES
- Collateral Fee = 6,000 KES
- Outstanding Interest = 500 KES
- Total Principal = 50,000 KES

```
Step 1: 13,000 KES → GFK Fee (fully paid)
        Remaining = 15,000 - 13,000 = 2,000 KES

Step 2: 2,000 KES → Collateral Fee (partial payment)
        Remaining Collateral = 6,000 - 2,000 = 4,000 KES
        Remaining Upfront = 0 KES

Step 3 & 4: No remaining upfront to allocate
```

---

## 4. Weekly Payment Allocation

### Fixed Weekly Payment
```
Weekly Payment = 2,200 KES (constant)
```

### Payment Sequence (Each Week):

#### Step 1: Interest Accrues FIRST
```
Remaining_Interest = Remaining_Interest + (Remaining_Principal × Weekly_Interest_Rate)
```

#### Step 2: Distribute 2,200 KES Payment (Waterfall Priority)

**Priority 1: GFK Fee**
```
GFK_Fee_Payment = Min(2,200, Remaining_GFK_Fee)
Remaining_GFK_Fee = Remaining_GFK_Fee - GFK_Fee_Payment
Remaining_Payment = 2,200 - GFK_Fee_Payment
```

**Priority 2: Collateral Fee**
```
Collateral_Payment = Min(Remaining_Payment, Remaining_Collateral)
Remaining_Collateral = Remaining_Collateral - Collateral_Payment
Remaining_Payment = Remaining_Payment - Collateral_Payment
```

**Priority 3: Interest**
```
Interest_Payment = Min(Remaining_Payment, Remaining_Interest)
Remaining_Interest = Remaining_Interest - Interest_Payment
Remaining_Payment = Remaining_Payment - Interest_Payment
```

**Priority 4: Principal**
```
Principal_Payment = Min(Remaining_Payment, Remaining_Principal)
Remaining_Principal = Remaining_Principal - Principal_Payment
```

---

## 5. Loan Duration

### Termination Condition
The loan continues until ALL remaining balances are paid off:
```
Loop continues while:
   Remaining_GFK_Fee > 0.01 OR
   Remaining_Collateral > 0.01 OR
   Remaining_Interest > 0.01 OR
   Remaining_Principal > 0.01
```

### Safety Break
```
Maximum iterations: 500 weeks (to prevent infinite loops)
```

---

## 6. Total Calculations

### Total Weeks
```
Total_Weeks = Number of payment cycles until all balances = 0
```

### Total Payments Made
```
Total_Payments = Sum of all weekly payments
                = Σ (Weekly_Payment_i) for i = 1 to Total_Weeks
```

### Total Interest Paid
```
Total_Interest_Paid = Sum of all interest payments
                    = Σ (Interest_Payment_i) for i = 1 to Total_Weeks
```

---

## 7. Complete Example Calculation

### Initial Setup:
- **GFK Components:** Wellness Warrior = 10,000 KES
- **Principal Components:** Tuition = 50,000 KES
- **Upfront Amount:** 5,000 KES
- **Outstanding Interest:** 0 KES
- **Annual Interest Rate:** 20%

### Calculated Fees:
```
GFF Fee = (10,000 + 50,000) × 0.05 = 3,000 KES
Total GFK Fee = 10,000 + 3,000 = 13,000 KES
Collateral Fee = (10,000 + 50,000) × 0.10 = 6,000 KES
Weekly Interest Rate = 20% ÷ 52 = 0.3846% per week
```

### Upfront Allocation:
```
5,000 KES → GFK Fee (partial)
Remaining GFK Fee = 13,000 - 5,000 = 8,000 KES
Remaining Collateral = 6,000 KES
Remaining Interest = 0 KES
Remaining Principal = 50,000 KES
```

### Week 1:
```
1. Interest Accrues: 50,000 × 0.003846 = 192.30 KES
   Remaining Interest = 0 + 192.30 = 192.30 KES

2. Payment Allocation (2,200 KES):
   - GFK Fee: 2,200 KES → Remaining = 8,000 - 2,200 = 5,800 KES
   - Collateral: 0 KES (no remaining payment)
   - Interest: 0 KES (no remaining payment)
   - Principal: 0 KES (no remaining payment)

3. Balances after Week 1:
   - Remaining GFK Fee: 5,800 KES
   - Remaining Collateral: 6,000 KES
   - Remaining Interest: 192.30 KES
   - Remaining Principal: 50,000 KES
```

### Week 2:
```
1. Interest Accrues: 50,000 × 0.003846 = 192.30 KES
   Remaining Interest = 192.30 + 192.30 = 384.60 KES

2. Payment Allocation (2,200 KES):
   - GFK Fee: 2,200 KES → Remaining = 5,800 - 2,200 = 3,600 KES
   - Collateral: 0 KES
   - Interest: 0 KES
   - Principal: 0 KES

3. Balances after Week 2:
   - Remaining GFK Fee: 3,600 KES
   - Remaining Collateral: 6,000 KES
   - Remaining Interest: 384.60 KES
   - Remaining Principal: 50,000 KES
```

*This continues until all balances reach 0...*

---

## 8. Key Characteristics

### This is NOT a Traditional Amortized Loan:
- ❌ Payment amount is NOT calculated from principal, rate, and term
- ✅ Payment amount is FIXED at 2,200 KES per week
- ✅ Loan duration ADJUSTS based on how long it takes to pay off all balances

### Waterfall Payment Model:
- Higher priority debts are paid first
- Lower priority debts only receive payment after higher ones are cleared
- Interest continues to accrue on principal until principal is fully paid

### Interest Compounding:
- Interest accrues WEEKLY on remaining principal
- Interest is added to the outstanding interest balance
- Interest must be paid before principal can be reduced

---

## 9. Formula Summary Table

| Item | Formula |
|------|---------|
| **GFF Fee** | (Total GFK + Total Principal) × 5% |
| **Collateral Fee** | (Total GFK + Total Principal) × 10% |
| **Total GFK Fee** | Total GFK Amount + GFF Fee |
| **Weekly Interest Rate** | (Annual Rate ÷ 100) ÷ 52 |
| **Weekly Interest Accrued** | Remaining Principal × Weekly Rate |
| **Weekly Payment** | 2,200 KES (fixed) |
| **Payment Priority** | GFK Fee → Collateral → Interest → Principal |
| **Upfront Priority** | Same as Payment Priority |
| **Loan Ends When** | All Remaining Balances ≤ 0.01 |

---

## 10. Important Notes

1. **Interest Never Stops:** As long as there is remaining principal, interest continues to accrue weekly
2. **Payment Order Matters:** Because of the waterfall model, it may take many weeks before any payment goes to principal
3. **Upfront Reduces Duration:** The more upfront paid, the fewer weeks needed to pay off the loan
4. **Fixed Payment:** The 2,200 KES is constant - it doesn't change based on loan size
5. **Precision:** Calculations use 0.01 threshold to avoid floating-point precision issues

---

*Document Version: 1.0*  
*Last Updated: 2024*