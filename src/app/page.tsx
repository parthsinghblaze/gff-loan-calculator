'use client';

import React, {useState, useMemo, useEffect} from 'react';
import {Calculator, Plus, Trash2, TrendingUp, AlertCircle, Download, Calendar, Target, Copy} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from "next/link";

export default function LoanCalculator() {
  // Set default values
  const [totalJudgmentAmount, setTotalJudgmentAmount] = useState('150000'); // New input field
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [thirdPartyFees, setThirdPartyFees] = useState([
    { id: 1, type: 'GFF Subscription', amount: '5000', isRecurring: true },
    { id: 2, type: 'Hospital Cash', amount: '2000', isRecurring: true },
    { id: 3, type: 'Insurance', amount: '2000', isRecurring: true }
  ]);

  const [upfrontAmount, setUpfrontAmount] = useState('15000');
  const [loanID, setLoanID] = useState('0');
  const [outstandingInterest, setOutstandingInterest] = useState('43138');
  const [outstandingInterestAfterJudgment, setOutstandingInterestAfterJudgment] = useState('0');
  const [interestRate, setInterestRate] = useState('20');
  const [targetWeeklyPayment, setTargetWeeklyPayment] = useState('2200');
  const [collateralFee, setCollateralFee] = useState('15000');

  const thirdPartyOptions = [
    'GFF Subscription',
    'Hospital Cash',
    'Insurance',
  ];

  // Function to serialize all data to URL parameters
  const serializeToParams = () => {
    const params = new URLSearchParams();

    // Basic fields
    params.set('judgment', totalJudgmentAmount);
    params.set('upfront', upfrontAmount);
    params.set('interest', outstandingInterest);
    params.set('interest_after', outstandingInterestAfterJudgment);
    params.set('rate', interestRate);
    params.set('target', targetWeeklyPayment);
    params.set('collateral', collateralFee);
    params.set('loanID', loanID);

    // Third party fees
    thirdPartyFees.forEach((fee, index) => {
      params.set(`fee_type_${index}`, fee.type);
      params.set(`fee_amount_${index}`, fee.amount);
      params.set(`fee_recurring_${index}`, fee.isRecurring.toString());
    });

    console.log("params", params)

    return params.toString();
  };

  // Function to deserialize from URL parameters
  const deserializeFromParams = (params: URLSearchParams) => {
    // Basic fields
    if (params.get('judgment')) setTotalJudgmentAmount(params.get('judgment') || '150000');
    if (params.get('upfront')) setUpfrontAmount(params.get('upfront') || '15000');
    if (params.get('interest')) setOutstandingInterest(params.get('interest') || '43138');
    if (params.get('interest_after')) setOutstandingInterestAfterJudgment(params.get('interest_after') || '0');
    if (params.get('rate')) setInterestRate(params.get('rate') || '20');
    if (params.get('target')) setTargetWeeklyPayment(params.get('target') || '2200');
    if (params.get('collateral')) setCollateralFee(params.get('collateral') || '15000');
    if (params.get('loanID')) setLoanID(params.get('loanID') || '0');

    // Third party fees
    const newThirdPartyFees = [];
    let index = 0;

    while (params.get(`fee_type_${index}`)) {
      newThirdPartyFees.push({
        id: Date.now() + index,
        type: params.get(`fee_type_${index}`) || '',
        amount: params.get(`fee_amount_${index}`) || '',
        isRecurring: params.get(`fee_recurring_${index}`) === 'true'
      });
      index++;
    }

    if (newThirdPartyFees.length > 0) {
      setThirdPartyFees(newThirdPartyFees);
    }
  };

  // Function to copy shareable URL to clipboard
  const copyShareableUrl = () => {
    const params = serializeToParams();
    if (!isClient) return;
    const currentUrl = window?.location?.origin + window?.location?.pathname;
    const shareableUrl = `${currentUrl}?${params}`;

    navigator.clipboard.writeText(shareableUrl).then(() => {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 3000);
    });
    alert("Copied to clipboard!");
  };
  const [isClient, setIsClient] = useState(false);
  // Function to load from URL parameters on component mount
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.toString()) {
        deserializeFromParams(urlParams);
      }
    }
  }, []);

  // Function to generate a shortened shareable link
  const generateShortLink = () => {
    const params = serializeToParams();
    if (!isClient) return;
    const currentUrl = window?.location?.origin + window.location.pathname;
    return `${currentUrl}?${params}`;
  };


  const addThirdPartyFee = () => {
    setThirdPartyFees([...thirdPartyFees, { id: Date.now(), type: '', amount: '', isRecurring: true }]);
  };

  const removeThirdPartyFee = (id) => {
    if (thirdPartyFees.length > 1) {
      setThirdPartyFees(thirdPartyFees.filter(c => c.id !== id));
    }
  };

  const updateThirdPartyFee = (id, field, value) => {
    setThirdPartyFees(thirdPartyFees.map(c =>
        c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const toggleRecurringFee = (id) => {
    setThirdPartyFees(thirdPartyFees.map(c =>
        c.id === id ? { ...c, isRecurring: !c.isRecurring } : c
    ));
  };

  // Function to find optimal tenure
  const findOptimalTenure = (principal, weeklyRate, targetPayment) => {
    let minTenure = 1;
    let maxTenure = 500;
    let optimalTenure = minTenure;
    let optimalPayment = 0;

    for (let tenure = minTenure; tenure <= maxTenure; tenure++) {
      const payment = principal * weeklyRate / (1 - Math.pow(1 + weeklyRate, -tenure));

      if (payment <= targetPayment) {
        if (payment > optimalPayment) {
          optimalTenure = tenure;
          optimalPayment = payment;
        }
      }
    }

    if (optimalPayment > 0) {
      return {
        tenure: optimalTenure,
        payment: optimalPayment,
        extraPayment: targetPayment - optimalPayment
      };
    } else {
      optimalPayment = principal * weeklyRate / (1 - Math.pow(1 + weeklyRate, -1));
      return {
        tenure: 1,
        payment: Math.min(optimalPayment, targetPayment),
        extraPayment: Math.max(0, targetPayment - optimalPayment)
      };
    }
  };

  const generatePDF = () => {
    const doc : any = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('GFK Loan Calculation Report', 105, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });

    yPos += 15;

    // Fixed Tenure Configuration
    doc.setFontSize(16);
    doc.setTextColor(150, 0, 150);
    doc.text('Fixed Tenure Configuration', 20, yPos);
    yPos += 8;

    const tenureData = [
      ['Target Weekly Payment', `${calculations.targetWeeklyPayment.toLocaleString()} KES`],
      ['Initial Tenure', `${calculations.initialTenure} weeks (${(calculations.initialTenure / 52).toFixed(1)} years)`],
      ['Final Tenure', `${calculations.totalWeeks} weeks (${(calculations.totalWeeks / 52).toFixed(1)} years)`],
      ['Base Calculated Payment', `${calculations.initialCalculatedPayment?.toFixed(2) || '0.00'} KES`],
      ['Extra Weekly Payment', `${calculations.initialExtraPayment?.toFixed(2) || '0.00'} KES`],
      ['Total Extra Applied', `${calculations.totalExtraPaymentApplied?.toFixed(2) || '0.00'} KES`]
    ];

    autoTable(doc, {
      startY: yPos,
      body: tenureData,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { halign: 'right', cellWidth: 80 }
      },
      margin: { left: 20, right: 20 }
    });
    yPos = doc.lastAutoTable.finalY + 15;

    // Tenure Extensions Due to Annual Fees
    if (calculations.annualFeeAdditions.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(220, 120, 0);
      doc.text('Tenure Extensions Due to Annual Fees', 20, yPos);
      yPos += 8;

      const extensionData = calculations.annualFeeAdditions.map(addition => [
        `Year ${addition.week / 52}`,
        `Week ${addition.week}`,
        `${addition.amount.toLocaleString()} KES`,
        `${addition.additionalWeeks} weeks`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Year', 'Week', 'Fees Added', 'Additional Weeks']],
        body: extensionData,
        theme: 'striped',
        headStyles: { fillColor: [220, 120, 0] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 9 }
      });
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Judgment Amount Section
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Judgment Amount Breakdown', 20, yPos);
    yPos += 8;

    const judgmentData = [
      ['Total Judgment Amount', `${(parseFloat(totalJudgmentAmount) || 0).toLocaleString()} KES`],
      ['Less: Outstanding Interest', `- ${(parseFloat(outstandingInterest) || 0).toLocaleString()} KES`],
      ['Less: Collateral Fee', `- ${(parseFloat(collateralFee) || 0).toLocaleString()} KES`],
      ['Principal Components', `${calculations.totalPrincipalComponents.toLocaleString()} KES`]
    ];

    autoTable(doc, {
      startY: yPos,
      body: judgmentData,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { halign: 'right', cellWidth: 80 }
      },
      margin: { left: 20, right: 20 }
    });
    yPos = doc.lastAutoTable.finalY + 15;

    // Third Party Fees Section
    doc.setFontSize(16);
    doc.setTextColor(220, 120, 0);
    doc.text('Third Party Fees', 20, yPos);
    yPos += 8;

    const thirdPartyTableData = thirdPartyFees
        .filter(c => c.type || c.amount)
        .map((c: any) => [c.type || 'N/A', `${parseFloat(c.amount || 0).toLocaleString()} KES`, c.isRecurring ? 'Annual' : 'One-time']);

    if (thirdPartyTableData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Type', 'Amount', 'Frequency']],
        body: thirdPartyTableData,
        theme: 'striped',
        headStyles: { fillColor: [220, 120, 0] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 }
      });
      yPos = doc.lastAutoTable.finalY + 5;
    }

    doc.setFontSize(12);
    doc.setTextColor(220, 120, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Third Party Fees: ${calculations.totalThirdPartyFees.toLocaleString()} KES`, 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 15;

    // Comprehensive Summary Section
    doc.setFontSize(16);
    doc.setTextColor(5, 150, 105);
    doc.text('Comprehensive Loan Summary', 20, yPos);
    yPos += 8;

    const summaryData = [
      ['WATERFALL PRIORITY BREAKDOWN', 'AMOUNT (KES)'],
      ['1. THIRD PARTY FEES', ''],
      ['   - GFF Subscription, Hospital Cash, Insurance', `${calculations.totalThirdPartyFees.toLocaleString()}`],
      ['2. COLLATERAL FEE', `${(parseFloat(collateralFee) || 0).toLocaleString()}`],
      ['3. OUTSTANDING INTEREST (Till Judgment)', `${(parseFloat(outstandingInterest) || 0).toLocaleString()}`],
      ['4. OUTSTANDING INTEREST (After Judgment)', `${(parseFloat(outstandingInterestAfterJudgment) || 0).toLocaleString()}`],
      ['5. PRINCIPAL COMPONENTS', ''],
      ['   - Total Judgment Amount (less interest & collateral)', `${calculations.totalPrincipalComponents.toLocaleString()}`],
      // ['   - GFF Fee (5%)', `${calculations.gffFee.toLocaleString()}`],
      ['   TOTAL PRINCIPAL COMPONENTS', `${calculations.totalPrincipalWithGff.toLocaleString()}`],
      ['TOTAL LOAN BALANCE', `${calculations.totalLoanBalance.toLocaleString()}`],
      ['UPFRONT PAYMENT APPLIED', `- ${calculations.upfrontApplied.toLocaleString()}`],
      ['REMAINING LOAN BALANCE', `${(calculations.totalLoanBalance - calculations.upfrontApplied).toLocaleString()}`]
    ];

    autoTable(doc, {
      startY: yPos,
      body: summaryData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 120 },
        1: { halign: 'right', cellWidth: 60, fontStyle: 'bold' }
      },
      margin: { left: 20, right: 20 },
      didParseCell: function (data: any) {
        if (data.section === 'body') {
          if (data.row.index === 0) {
            data.cell.styles.fillColor = [37, 99, 235];
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.cell.raw.includes('TOTAL PRINCIPAL COMPONENTS') ||
              data.cell.raw.includes('TOTAL LOAN BALANCE') ||
              data.cell.raw.includes('REMAINING LOAN BALANCE')) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [5, 150, 105];
          }
        }
      }
    });
    yPos = doc.lastAutoTable.finalY + 15;

    // Upfront Payment Allocation
    if (calculations.upfrontApplied > 0) {
      doc.setFontSize(16);
      doc.setTextColor(220, 120, 0);
      doc.text('Upfront Payment Allocation', 20, yPos);
      yPos += 8;

      const upfrontData = [
        ['Priority', 'Component', 'Amount Applied (KES)', 'Remaining After Upfront (KES)'],
        ['1', 'Third Party Fees', `${calculations.upfrontAllocation.appliedToThirdParty.toLocaleString()}`, `${(calculations.totalThirdPartyFees - calculations.upfrontAllocation.appliedToThirdParty).toLocaleString()}`],
        ['2', 'Collateral Fee', `${calculations.upfrontAllocation.appliedToCollateral.toLocaleString()}`, `${(parseFloat(collateralFee) - calculations.upfrontAllocation.appliedToCollateral).toLocaleString()}`],
        ['3', 'Outstanding Interest (Till Judgment)', `${calculations.upfrontAllocation.appliedToInterest.toLocaleString()}`, `${(parseFloat(outstandingInterest) - calculations.upfrontAllocation.appliedToInterest).toLocaleString()}`],
        ['4', 'Outstanding Interest (After Judgment)', `${calculations.upfrontAllocation.appliedToInterestAfterJudgment.toLocaleString()}`, `${(parseFloat(outstandingInterestAfterJudgment) - calculations.upfrontAllocation.appliedToInterestAfterJudgment).toLocaleString()}`],
        ['5', 'Principal Components', `${calculations.upfrontAllocation.appliedToPrincipal.toLocaleString()}`, `${(calculations.totalPrincipalWithGff - calculations.upfrontAllocation.appliedToPrincipal).toLocaleString()}`],
        ['', 'TOTAL APPLIED', `${calculations.upfrontApplied.toLocaleString()}`, '']
      ];

      autoTable(doc, {
        startY: yPos,
        body: upfrontData,
        theme: 'striped',
        headStyles: { fillColor: [220, 120, 0] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 45 },
          2: { halign: 'right', cellWidth: 40 },
          3: { halign: 'right', cellWidth: 45 }
        },
        didParseCell: function (data) {
          if (data.section === 'body' && data.row.index === 5) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [245, 245, 245];
          }
        }
      });
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Loan Terms Summary
    doc.setFontSize(16);
    doc.setTextColor(150, 0, 150);
    doc.text('Loan Terms & Payment Summary', 20, yPos);
    yPos += 8;

    const termsData = [
      ['Nominal Interest Rate', `${interestRate}% per annum (compounded daily)`],
      ['Effective Annual Rate', `${calculations.effectiveAnnualRate}%`],
      ['Weekly Interest Rate', `${calculations.weeklyInterestRate}%`],
      ['Target Weekly Payment', `${calculations.targetWeeklyPayment.toLocaleString()} KES`],
      ['Initial Tenure', `${calculations.initialTenure} weeks`],
      ['Final Tenure', `${calculations.totalWeeks} weeks`],
      ['Base Weekly Payment', `${calculations.initialCalculatedPayment?.toFixed(2) || '0.00'} KES`],
      ['Extra Weekly Payment', `${calculations.initialExtraPayment?.toFixed(2) || '0.00'} KES`],
      ['Total Payments', `${calculations.totalPayments.toLocaleString()} KES`],
      ['Total Interest Paid', `${calculations.totalInterestPaid.toLocaleString()} KES`],
      ['Total Principal Paid', `${calculations.totalPrincipalPaid.toLocaleString()} KES`],
      ['Total Extra Applied', `${calculations.totalExtraPaymentApplied?.toFixed(2) || '0.00'} KES`],
      ['Annual Third Party Fees', `${calculations.annualThirdPartyFees.toLocaleString()} KES`],
      ['Total Cost of Credit', `${calculations.totalCostOfCredit.toLocaleString()} KES`]
    ];

    autoTable(doc, {
      startY: yPos,
      body: termsData,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 80 }
      },
      margin: { left: 20, right: 20 }
    });
    yPos = doc.lastAutoTable.finalY + 15;

    // Payment Schedule on new page
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Detailed Payment Schedule', 20, yPos);
    yPos += 8;

    const scheduleData = calculations.schedule.map(row => [
      row.week,
      row.totalPayment.toFixed(2),
      row.interestPayment.toFixed(2),
      row.principalPayment.toFixed(2),
      row.principalPaymentFromBase.toFixed(2),
      row.principalPaymentFromExtra.toFixed(2),
      row.thirdPartyPayment.toFixed(2),
      row.collateralPayment.toFixed(2),
      row.interestPrincipalPayment.toFixed(2),
      row.interestAfterJudgmentPayment?.toFixed(2) || '0.00',
      row.principalComponentsPayment.toFixed(2),
      row.remainingPrincipal.toFixed(2)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [[
        'Week',
        'Total Pay',
        'Interest',
        'Principal',
        'Base Princ',
        'Extra Princ',
        '3rd Party',
        'Collateral',
        'Out Int',
        'Out Int After',
        'Principal Comp',
        'Balance'
      ]],
      body: scheduleData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        fontSize: 6,
        cellPadding: 1
      },
      styles: {
        fontSize: 5,
        cellPadding: 1,
        overflow: 'linebreak'
      },
      margin: { left: 5, right: 5 },
    });

    doc.save(`GFK_Loan_Calculation_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const calculations = useMemo(() => {
    // Calculate principal components from judgment amount
    const totalJudgment = parseFloat(totalJudgmentAmount) || 0;
    const outstandingInt = parseFloat(outstandingInterest) || 0;
    const outstandingIntAfterJudgment = parseFloat(outstandingInterestAfterJudgment) || 0;
    const collateralFeeAmount = parseFloat(collateralFee) || 0;

    // Principal Components = Total Judgment - Outstanding Interest - Collateral Fee
    const totalPrincipalComponents = Math.max(0, totalJudgment - outstandingInt - collateralFeeAmount);

    const totalThirdPartyFees = thirdPartyFees.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const upfront = parseFloat(upfrontAmount) || 0;
    const rate = parseFloat(interestRate) || 20;
    const targetPayment = parseFloat(targetWeeklyPayment) || 2200;

    // Calculate GFF fee (5%) of (Principal Components + Third Party Fees)
    const gffFee = 0;

    // Total Principal Components including GFF fee
    const totalPrincipalWithGff = totalPrincipalComponents + gffFee;

    // TOTAL LOAN BALANCE = Third Party + Collateral + Outstanding Interest + Outstanding Interest After Judgment + Principal Components (with GFF)
    const totalLoanBalance = totalThirdPartyFees + collateralFeeAmount + outstandingInt + outstandingIntAfterJudgment + totalPrincipalWithGff;

    // DAILY COMPOUNDED INTEREST calculation
    const dailyInterestRate = rate / 100 / 365;
    const weeklyInterestRate = Math.pow(1 + dailyInterestRate, 7) - 1;

    // Apply upfront payment according to waterfall priority SEQUENTIALLY
    let remainingUpfront = upfront;

    // CORRECTED WATERFALL PRIORITY for upfront payment:
    // 1. Third Party Fees (Priority 1)
    const appliedToThirdParty = Math.min(remainingUpfront, totalThirdPartyFees);
    remainingUpfront = Math.max(0, remainingUpfront - totalThirdPartyFees);

    // 2. Collateral Fee (Priority 2)
    const appliedToCollateral = Math.min(remainingUpfront, collateralFeeAmount);
    remainingUpfront = Math.max(0, remainingUpfront - collateralFeeAmount);

    // 3. Outstanding Interest (Priority 3)
    const appliedToInterest = Math.min(remainingUpfront, outstandingInt);
    remainingUpfront = Math.max(0, remainingUpfront - outstandingInt);

    // 4. Outstanding Interest After Judgment (Priority 4)
    const appliedToInterestAfterJudgment = Math.min(remainingUpfront, outstandingIntAfterJudgment);
    remainingUpfront = Math.max(0, remainingUpfront - outstandingIntAfterJudgment);

    // 5. Principal Components with GFF (Priority 5)
    const appliedToPrincipal = Math.min(remainingUpfront, totalPrincipalWithGff);

    // Calculate remaining balances after upfront for tracking
    let remainingThirdParty = Math.max(0, totalThirdPartyFees - appliedToThirdParty);
    let remainingCollateral = Math.max(0, collateralFeeAmount - appliedToCollateral);
    let remainingInterest = Math.max(0, outstandingInt - appliedToInterest);
    let remainingInterestAfterJudgment = Math.max(0, outstandingIntAfterJudgment - appliedToInterestAfterJudgment);
    let remainingPrincipalComponents = Math.max(0, totalPrincipalWithGff - appliedToPrincipal);

    let remainingPrincipal = remainingThirdParty + remainingCollateral + remainingInterest + remainingInterestAfterJudgment + remainingPrincipalComponents;

    // Calculate annual third party fees from recurring fees
    let annualThirdPartyFees = 0;
    thirdPartyFees.forEach(fee => {
      if (fee.isRecurring) {
        annualThirdPartyFees += parseFloat(fee.amount) || 0;
      }
    });

    // FIXED: Calculate initial payment plan ONCE and maintain consistent extra payment
    const initialTenurePlan = findOptimalTenure(remainingPrincipal, weeklyInterestRate, targetPayment);
    const initialCalculatedPayment = initialTenurePlan.payment;
    const initialExtraPayment = initialTenurePlan.extraPayment;
    const initialTenure = initialTenurePlan.tenure;

    const schedule = [];
    let weekNum = 1;
    let currentPriority = 1;
    let weeksInYear = 0;

    // FIXED: Use consistent payment amounts throughout the loan
    let currentCalculatedPayment = initialCalculatedPayment;
    let currentExtraPayment = initialExtraPayment;
    let originalTenure = initialTenure;
    let weeksCompleted = 0;

    let totalExtraApplied = 0;
    let annualFeeAdditions = [];

    while (remainingPrincipal > 0.01 && weekNum <= 500) {
      // FIXED: Only extend tenure when annual fees are added, don't recalculate payments
      const shouldAddAnnualFees = (weekNum % 52 === 0 && annualThirdPartyFees > 0);
      if (shouldAddAnnualFees) {
        remainingThirdParty += annualThirdPartyFees;
        remainingPrincipal += annualThirdPartyFees;

        // FIXED: Extend tenure instead of recalculating payments
        const additionalWeeksNeeded = findOptimalTenure(annualThirdPartyFees, weeklyInterestRate, currentExtraPayment).tenure;
        originalTenure += additionalWeeksNeeded;

        annualFeeAdditions.push({
          week: weekNum,
          amount: annualThirdPartyFees,
          additionalWeeks: additionalWeeksNeeded
        });
      }

      // Start with the base calculated payment for waterfall allocation
      let basePayment = currentCalculatedPayment;
      let extraPayment = currentExtraPayment;

      let interestPayment = 0;
      let principalPaymentFromBase = 0;
      let principalPaymentFromExtra = 0;
      let thirdPartyPayment = 0;
      let collateralPayment = 0;
      let interestPrincipalPayment = 0;
      let interestAfterJudgmentPayment = 0;
      let principalComponentsPayment = 0;

      // Calculate weekly interest using daily compounded rate
      const weeklyInterestAccrued = remainingPrincipal * weeklyInterestRate;

      // CORRECTED WATERFALL PAYMENT PRIORITY - SEQUENTIAL:
      // 1. Pay current week's interest first (always priority) from BASE payment
      if (basePayment > 0 && weeklyInterestAccrued > 0) {
        interestPayment = Math.min(basePayment, weeklyInterestAccrued);
        basePayment -= interestPayment;
      }

      // 2. Then pay principal according to waterfall priority from BASE payment
      if (basePayment > 0) {
        // PRIORITY 1: Third Party Fees
        if (remainingThirdParty > 0.01) {
          thirdPartyPayment = Math.min(basePayment, remainingThirdParty);
          remainingThirdParty -= thirdPartyPayment;
          basePayment -= thirdPartyPayment;
          principalPaymentFromBase += thirdPartyPayment;
          currentPriority = 1;
        }

        // PRIORITY 2: Collateral Fee (only if Priority 1 is paid off)
        if (basePayment > 0 && remainingThirdParty <= 0.01 && remainingCollateral > 0.01) {
          collateralPayment = Math.min(basePayment, remainingCollateral);
          remainingCollateral -= collateralPayment;
          basePayment -= collateralPayment;
          principalPaymentFromBase += collateralPayment;
          currentPriority = 2;
        }

        // PRIORITY 3: Outstanding Interest (only if Priorities 1 & 2 are paid off)
        if (basePayment > 0 && remainingThirdParty <= 0.01 && remainingCollateral <= 0.01 && remainingInterest > 0.01) {
          interestPrincipalPayment = Math.min(basePayment, remainingInterest);
          remainingInterest -= interestPrincipalPayment;
          basePayment -= interestPrincipalPayment;
          principalPaymentFromBase += interestPrincipalPayment;
          currentPriority = 3;
        }

        // PRIORITY 4: Outstanding Interest After Judgment (only if Priorities 1-3 are paid off)
        if (basePayment > 0 && remainingThirdParty <= 0.01 && remainingCollateral <= 0.01 &&
            remainingInterest <= 0.01 && remainingInterestAfterJudgment > 0.01) {
          interestAfterJudgmentPayment = Math.min(basePayment, remainingInterestAfterJudgment);
          remainingInterestAfterJudgment -= interestAfterJudgmentPayment;
          basePayment -= interestAfterJudgmentPayment;
          principalPaymentFromBase += interestAfterJudgmentPayment;
          currentPriority = 4;
        }

        // PRIORITY 5: Principal Components with GFF (only if Priorities 1-4 are paid off)
        if (basePayment > 0 && remainingThirdParty <= 0.01 && remainingCollateral <= 0.01 &&
            remainingInterest <= 0.01 && remainingInterestAfterJudgment <= 0.01 && remainingPrincipalComponents > 0.01) {
          principalComponentsPayment = Math.min(basePayment, remainingPrincipalComponents);
          remainingPrincipalComponents -= principalComponentsPayment;
          basePayment -= principalComponentsPayment;
          principalPaymentFromBase += principalComponentsPayment;
          currentPriority = 5;
        }
      }

      // 3. Apply EXTRA PAYMENT directly to principal reduction (Priority 5)
      if (extraPayment > 0 && remainingPrincipalComponents > 0.01) {
        principalPaymentFromExtra = Math.min(extraPayment, remainingPrincipalComponents);
        remainingPrincipalComponents -= principalPaymentFromExtra;
        extraPayment -= principalPaymentFromExtra;
        totalExtraApplied += principalPaymentFromExtra;
      }

      const totalPrincipalPayment = principalPaymentFromBase + principalPaymentFromExtra;
      const totalPaid = interestPayment + totalPrincipalPayment;
      remainingPrincipal = remainingThirdParty + remainingCollateral + remainingInterest + remainingInterestAfterJudgment + remainingPrincipalComponents;

      // Track progress
      weeksCompleted++;
      const remainingWeeks = Math.max(0, originalTenure - weeksCompleted);

      schedule.push({
        week: weekNum,
        totalPayment: totalPaid,
        interestPayment,
        principalPayment: totalPrincipalPayment,
        principalPaymentFromBase,
        principalPaymentFromExtra,
        weeklyInterestAccrued,
        remainingPrincipal,
        // Track individual component payments and balances
        thirdPartyPayment,
        collateralPayment,
        interestPrincipalPayment,
        interestAfterJudgmentPayment,
        principalComponentsPayment,
        // Track remaining balances for each waterfall component
        remainingThirdParty,
        remainingCollateral,
        remainingInterest,
        remainingInterestAfterJudgment,
        remainingPrincipalComponents,
        currentPriority,
        calculatedPayment: currentCalculatedPayment,
        extraPayment: currentExtraPayment,
        remainingWeeks,
        basePaymentUsed: currentCalculatedPayment - basePayment,
        extraPaymentUsed: currentExtraPayment - extraPayment,
        annualFeesAdded: shouldAddAnnualFees ? annualThirdPartyFees : 0,
        totalWeeks: originalTenure
      });

      weekNum++;
      weeksInYear++;

      // Reset weeks in year counter
      if (weeksInYear >= 52) {
        weeksInYear = 0;
      }

      // Safety break - prevent infinite loop
      if (weekNum > 500) break;
    }

    const totalPayments = schedule.reduce((sum, s) => sum + s.totalPayment, 0);
    const totalInterestPaid = schedule.reduce((sum, s) => sum + s.interestPayment, 0);
    const totalPrincipalPaid = totalPayments - totalInterestPaid;

    // CORRECT Effective Annual Rate Calculations
    const totalLoanAmount = totalLoanBalance - upfront;

    // Method 1: Using the actual compounding formula
    const effectiveAnnualRateFromCompounding = (Math.pow(1 + weeklyInterestRate, 52) - 1) * 100;

    return {
      totalPrincipalComponents,
      totalThirdPartyFees,
      gffFee,
      collateralFee: collateralFeeAmount,
      totalPrincipalWithGff,
      totalLoanBalance,
      upfrontApplied: upfront,
      schedule,
      totalPayments,
      totalInterestPaid,
      totalPrincipalPaid,
      totalExtraPaymentApplied: totalExtraApplied,
      totalWeeks: schedule.length,
      initialTenure,
      initialCalculatedPayment,
      initialExtraPayment,
      targetWeeklyPayment: targetPayment,
      hasRecurringFees: annualThirdPartyFees > 0,
      annualFeeAdditions,

      // Interest Rate Information
      effectiveAnnualRate: effectiveAnnualRateFromCompounding.toFixed(2),
      nominalAnnualRate: rate,
      weeklyInterestRate: (weeklyInterestRate * 100).toFixed(4),

      annualThirdPartyFees,
      upfrontAllocation: {
        appliedToThirdParty,
        appliedToCollateral,
        appliedToInterest,
        appliedToInterestAfterJudgment,
        appliedToPrincipal
      },

      // Financial ratios
      totalCostOfCredit: totalInterestPaid + totalThirdPartyFees + collateralFeeAmount + gffFee,
      amountFinanced: totalLoanAmount,
      totalRepaymentAmount: totalPayments,
      totalJudgmentAmount: totalJudgment
    };
  }, [totalJudgmentAmount, thirdPartyFees, upfrontAmount, outstandingInterest, outstandingInterestAfterJudgment, interestRate, targetWeeklyPayment, collateralFee]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calculator className="w-10 h-10" />
                  <div>
                    <h1 className="text-3xl font-bold">GFK Loan Calculator</h1>
                    <p className="text-blue-100">Fixed Tenure with Consistent Weekly Payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                      onClick={copyShareableUrl}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold shadow-lg"
                      title="Copy shareable link"
                  >
                    Share
                  </button>
                  <button
                      onClick={generatePDF}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF Report
                  </button>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <div className="p-8">
              {/* Total Judgment Amount */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Total Judgment Amount</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan id
                    </label>
                    <input
                        type="number"
                        value={loanID}
                        onChange={(e) => setLoanID(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="171"
                    />
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Judgment Amount (KES)
                    </label>
                    <input
                        type="number"
                        value={totalJudgmentAmount}
                        onChange={(e) => setTotalJudgmentAmount(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="150000"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      This amount will be distributed to principal components after deducting outstanding interest and collateral fee
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <div className="text-sm text-gray-600 mb-1">Judgment Amount Breakdown</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-black">Total Judgment:</span>
                        <span className="font-bold text-black">{(parseFloat(totalJudgmentAmount) || 0).toLocaleString()} KES</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Less Outstanding Interest:</span>
                        <span>- {(parseFloat(outstandingInterest) || 0).toLocaleString()} KES</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Less Collateral Fee:</span>
                        <span>- {(parseFloat(collateralFee) || 0).toLocaleString()} KES</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-bold text-black">Principal Components:</span>
                        <span className="font-bold text-green-600">
                          {calculations.totalPrincipalComponents.toLocaleString()} KES
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-xs text-blue-700 font-semibold">Calculation Formula:</div>
                      <div className="text-xs text-blue-600 mt-1">
                        Principal Components = Total Judgment - Outstanding Interest - Collateral Fee
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {totalJudgmentAmount} - {outstandingInterest} - {collateralFee} = {calculations.totalPrincipalComponents.toLocaleString()} KES
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Tenure Configuration */}
              <div className="hidden bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-600" />
                  Fixed Tenure Configuration
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Weekly Payment (KES)
                    </label>
                    <input
                        type="number"
                        value={targetWeeklyPayment}
                        onChange={(e) => setTargetWeeklyPayment(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        placeholder="2200"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      System will find tenure with payment closest to but ≤ this amount
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <div className="text-sm text-gray-600 mb-1">Optimal Tenure Found</div>
                    <div className="text-2xl font-bold text-green-600">
                      {calculations.initialTenure} weeks
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div>Base Payment: <strong>{calculations.initialCalculatedPayment?.toFixed(2) || '0.00'} KES</strong></div>
                      <div>Extra Payment: <strong>{calculations.initialExtraPayment?.toFixed(2) || '0.00'} KES</strong></div>
                      <div>Total Weekly: <strong>{calculations.targetWeeklyPayment} KES</strong></div>
                      <div className="text-xs text-green-600 mt-1">
                        Total Extra Applied: {calculations.totalExtraPaymentApplied?.toFixed(2) || '0.00'} KES
                      </div>
                      {calculations.hasRecurringFees && (
                          <div className="text-xs text-orange-600 mt-1">
                            Annual Fees: {calculations.annualThirdPartyFees.toLocaleString()} KES
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tenure Extension Details */}
              {calculations.annualFeeAdditions.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-6 mb-8 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Tenure Extensions Due to Annual Fees</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {calculations.annualFeeAdditions.map((addition, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-orange-200">
                            <div className="text-sm text-gray-600 mb-1">Year {addition.week / 52}</div>
                            <div className="text-lg font-bold text-orange-600">+{addition.additionalWeeks} weeks</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Week {addition.week}: +{addition.amount.toLocaleString()} KES fees
                            </div>
                          </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <strong>Note:</strong> Tenure extended to maintain consistent weekly payments of {calculations.targetWeeklyPayment} KES
                    </div>
                  </div>
              )}

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Third Party Fees */}
                <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    1. Third Party Fees (Priority 1)
                    <Calendar className="w-4 h-4" />
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">GFF Subscription, Hospital Cash, Insurance</p>
                  {thirdPartyFees.map((component) => (
                      <div key={component.id} className="flex gap-2 mb-3">
                        <input
                            type="text"
                            list="thirdPartyOptions"
                            value={component.type}
                            onChange={(e) => updateThirdPartyFee(component.id, 'type', e.target.value)}
                            className="flex-1 text-black px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Select type"
                        />
                        <input
                            type="number"
                            value={component.amount}
                            onChange={(e) => updateThirdPartyFee(component.id, 'amount', e.target.value)}
                            className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Amount"
                        />
                        <button
                            onClick={() => toggleRecurringFee(component.id)}
                            className={`px-3 py-2 rounded-lg transition ${
                                component.isRecurring
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                            title={component.isRecurring ? 'Annual recurring fee' : 'One-time fee'}
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        {thirdPartyFees.length > 1 && (
                            <button
                                onClick={() => removeThirdPartyFee(component.id)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                      </div>
                  ))}
                  <datalist id="thirdPartyOptions">
                    {thirdPartyOptions.map(option => (
                        <option key={option} value={option} />
                    ))}
                  </datalist>
                  <button
                      onClick={addThirdPartyFee}
                      className="w-full mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Third Party Fee
                  </button>
                  <div className="mt-4 p-3 bg-white rounded border border-orange-300">
                    <div className="text-sm text-gray-600">Total Third Party Fees:</div>
                    <div className="text-xl font-bold text-orange-600">
                      {calculations.totalThirdPartyFees.toLocaleString()} KES
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Annual Recurring: {calculations.annualThirdPartyFees.toLocaleString()} KES
                    </div>
                    <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                      <div className="text-xs text-orange-700 font-semibold">Calculation:</div>
                      <div className="text-xs text-orange-600 mt-1">
                        Sum of all third party fees = {thirdPartyFees.map(fee => `${fee.amount || 0}`).join(' + ')} = {calculations.totalThirdPartyFees.toLocaleString()} KES
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority 2, 3, 4 & 5 */}
                <div className="space-y-6">
                  {/* Collateral fee */}
                  <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      2. Collateral Fee (KES)
                    </h3>
                    <input
                        type="number"
                        value={collateralFee}
                        onChange={(e) => setCollateralFee(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        placeholder="15000"
                    />
                    <div className="text-xs text-gray-500 mt-1">Custom collateral fee amount</div>
                  </div>

                  {/* Outstanding interest till judgment */}
                  <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      3.1. Outstanding Interest (KES) (till judgement)
                    </h3>
                    <input
                        type="number"
                        value={outstandingInterest}
                        onChange={(e) => setOutstandingInterest(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                        placeholder="0"
                    />
                  </div>

                  {/* Outstanding interest after judgment */}
                  <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      3.2. Outstanding Interest After Judgment Till Date (KES)
                    </h3>
                    <input
                        type="number"
                        value={outstandingInterestAfterJudgment}
                        onChange={(e) => setOutstandingInterestAfterJudgment(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                        placeholder="0"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      4. Principal Components (KES)
                    </h3>
                    <div className="text-xl font-bold text-blue-600">
                      {calculations.totalPrincipalComponents.toLocaleString()} KES
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Auto-calculated from Judgment Amount
                    </div>
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-xs text-blue-700 font-semibold">Calculation Formula:</div>
                      <div className="text-xs text-blue-600 mt-1">
                        Principal Components = Total Judgment - Outstanding Interest - Collateral Fee
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {totalJudgmentAmount} - {outstandingInterest} - {collateralFee} = {calculations.totalPrincipalComponents.toLocaleString()} KES
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Inputs */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upfront Amount (KES)
                  </label>
                  <input
                      type="number"
                      value={upfrontAmount}
                      onChange={(e) => setUpfrontAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interest Rate (% per annum)
                  </label>
                  <input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                      placeholder="20"
                  />
                  <div className="text-xs text-gray-500 mt-1">Compounded daily</div>
                  <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                    <div className="text-xs text-red-700 font-semibold">Interest Calculation:</div>
                    <div className="text-xs text-red-600 mt-1">
                      Daily Rate = {interestRate}% ÷ 365 = {(parseFloat(interestRate)/365).toFixed(4)}%
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Weekly Rate = (1 + {(parseFloat(interestRate)/365/100).toFixed(6)})⁷ - 1 = {calculations.weeklyInterestRate}%
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Weekly Payment (KES)
                  </label>
                  <input
                      type="number"
                      value={targetWeeklyPayment}
                      onChange={(e) => setTargetWeeklyPayment(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      placeholder="2200"
                  />
                </div>

                <div className="hidden bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">5. Principal Components</div>
                  <div className="text-xl font-bold text-blue-600">
                    {calculations.totalPrincipalComponents.toLocaleString()} KES
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Auto-calculated from Judgment Amount
                  </div>
                </div>
              </div>

              {/* Comprehensive Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Comprehensive Loan Summary</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-200">
                    <div className="text-sm text-gray-600 mb-1">1. Third Party Fees</div>
                    <div className="text-lg font-bold text-orange-600">
                      {calculations.totalThirdPartyFees.toLocaleString()} KES
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Sum of all third party components
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                    <div className="text-sm text-gray-600 mb-1">2. Collateral Fee</div>
                    <div className="text-lg font-bold text-green-600">
                      {(parseFloat(collateralFee) || 0).toLocaleString()} KES
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-300">
                    <div className="text-sm text-gray-600 mb-1">3.1. Outstanding Interest (Till Judgment)</div>
                    <div className="text-lg font-bold text-orange-600">
                      {(parseFloat(outstandingInterest) || 0).toLocaleString()} KES
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-400">
                    <div className="text-sm text-gray-600 mb-1">3.2. Outstanding Interest (After Judgment)</div>
                    <div className="text-lg font-bold text-orange-600">
                      {(parseFloat(outstandingInterestAfterJudgment) || 0).toLocaleString()} KES
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="text-sm text-gray-600 mb-1">4. Principal Components</div>
                    <div className="text-lg font-bold text-blue-600">
                      {calculations.totalPrincipalComponents.toLocaleString()} KES
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Judgment - Interest - Collateral
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-indigo-300">
                    <div className="text-sm text-gray-600 mb-1">Total Loan Balance</div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {calculations.totalLoanBalance.toLocaleString()} KES
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Sum of all 5 priority components
                    </div>
                    <div className="mt-2 p-2 bg-indigo-50 rounded border border-indigo-200">
                      <div className="text-xs text-indigo-700 font-semibold">Calculation Formula:</div>
                      <div className="text-xs text-indigo-600 mt-1">
                        Total Loan = 1 + 2 + 3.1 + 3.2 + 4
                      </div>
                      <div className="text-xs text-indigo-600 mt-1">
                        {calculations.totalThirdPartyFees.toLocaleString()} + {collateralFee} + {outstandingInterest} + {outstandingInterestAfterJudgment} + {calculations.totalPrincipalComponents.toLocaleString()} = {calculations.totalLoanBalance.toLocaleString()} KES
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-300">
                    <div className="text-sm text-gray-600 mb-1">Remaining After Upfront</div>
                    <div className="text-2xl font-bold text-green-600">
                      {(calculations.totalLoanBalance - calculations.upfrontApplied).toLocaleString()} KES
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      After {calculations.upfrontApplied.toLocaleString()} KES upfront
                    </div>
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-xs text-green-700 font-semibold">Calculation Formula:</div>
                      <div className="text-xs text-green-600 mt-1">
                        Remaining Balance = Total Loan - Upfront Payment
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {calculations.totalLoanBalance.toLocaleString()} - {upfrontAmount} = {(calculations.totalLoanBalance - calculations.upfrontApplied).toLocaleString()} KES
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upfront Allocation Details */}
              {calculations.upfrontApplied > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-6 mb-8 border-2 border-yellow-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Upfront Payment Allocation (Sequential Waterfall)</h3>
                    <div className="grid md:grid-cols-5 gap-4">
                      <div className="text-center bg-white p-4 rounded-lg border border-orange-200">
                        <div className="text-sm text-gray-600">1. Applied to Third Party</div>
                        <div className="text-lg font-bold text-orange-600">
                          {calculations.upfrontAllocation.appliedToThirdParty.toLocaleString()} KES
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Remaining: {(calculations.totalThirdPartyFees - calculations.upfrontAllocation.appliedToThirdParty).toLocaleString()} KES
                        </div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-gray-600">2. Applied to Collateral</div>
                        <div className="text-lg font-bold text-green-600">
                          {calculations.upfrontAllocation.appliedToCollateral.toLocaleString()} KES
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Remaining: {(parseFloat(collateralFee) - calculations.upfrontAllocation.appliedToCollateral).toLocaleString()} KES
                        </div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-lg border border-orange-300">
                        <div className="text-sm text-gray-600">3.1. Applied to Interest (Till Judgment)</div>
                        <div className="text-lg font-bold text-orange-600">
                          {calculations.upfrontAllocation.appliedToInterest.toLocaleString()} KES
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Remaining: {(parseFloat(outstandingInterest) - calculations.upfrontAllocation.appliedToInterest).toLocaleString()} KES
                        </div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-lg border border-orange-400">
                        <div className="text-sm text-gray-600">3.2. Applied to Interest (After Judgment)</div>
                        <div className="text-lg font-bold text-orange-600">
                          {calculations.upfrontAllocation.appliedToInterestAfterJudgment.toLocaleString()} KES
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Remaining: {(parseFloat(outstandingInterestAfterJudgment) - calculations.upfrontAllocation.appliedToInterestAfterJudgment).toLocaleString()} KES
                        </div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-lg border border-blue-200">
                        <div className="text-sm text-gray-600">4. Applied to Principal</div>
                        <div className="text-lg font-bold text-blue-600">
                          {calculations.upfrontAllocation.appliedToPrincipal.toLocaleString()} KES
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Remaining: {(calculations.totalPrincipalWithGff - calculations.upfrontAllocation.appliedToPrincipal).toLocaleString()} KES
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
                      <div className="text-sm text-yellow-800 font-semibold">Waterfall Allocation Formula:</div>
                      <div className="text-xs text-yellow-700 mt-1">
                        Upfront payment is applied sequentially in priority order until fully allocated
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">
                        Priority 1 → Priority 2 → Priority 3.1 → Priority 3.2 → Priority 4
                      </div>
                    </div>
                  </div>
              )}

              {/* Loan Terms Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Loan Terms & Payment Summary</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
                    <div className="text-sm text-gray-600 mb-1">Interest Rates</div>
                    <div className="text-sm text-black">Nominal: <strong>{calculations.nominalAnnualRate}%</strong></div>
                    <div className="text-sm text-black">Effective: <strong>{calculations.effectiveAnnualRate}%</strong></div>
                    <div className="text-sm text-black">Weekly: <strong>{calculations.weeklyInterestRate}%</strong></div>
                    <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                      <div className="text-xs text-purple-700 font-semibold">Effective Rate Formula:</div>
                      <div className="text-xs text-purple-600 mt-1">
                        (1 + Weekly Rate)⁵² - 1
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        (1 + {parseFloat(calculations.weeklyInterestRate)/100})⁵² - 1 = {calculations.effectiveAnnualRate}%
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="text-sm text-gray-600 mb-1">Payment Details</div>
                    <div className="text-sm text-black">Target: <strong>{calculations.targetWeeklyPayment} KES</strong></div>
                    <div className="text-sm text-black">Base: <strong>{calculations.initialCalculatedPayment?.toFixed(2) || '0.00'} KES</strong></div>
                    <div className="text-sm text-black">Extra: <strong>{calculations.initialExtraPayment?.toFixed(2) || '0.00'} KES</strong></div>
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-xs text-blue-700 font-semibold">Payment Formula:</div>
                      <div className="text-xs text-blue-600 mt-1">
                        Target = Base + Extra
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {calculations.targetWeeklyPayment} = {calculations.initialCalculatedPayment?.toFixed(2) || '0.00'} + {calculations.initialExtraPayment?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                    <div className="text-sm text-gray-600 mb-1">Tenure</div>
                    <div className="text-sm text-black">Initial: <strong>{calculations.initialTenure} weeks</strong></div>
                    <div className="text-sm text-black">Final: <strong>{calculations.totalWeeks} weeks</strong></div>
                    <div className="text-sm text-black">Total Extra: <strong>{calculations.totalExtraPaymentApplied?.toFixed(2) || '0.00'} KES</strong></div>
                  </div>
                </div>
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-indigo-300">
                    <div className="text-sm text-gray-600 mb-1">Total Payments</div>
                    <div className="text-xl font-bold text-indigo-600">
                      {calculations.totalPayments.toLocaleString()} KES
                    </div>
                    <div className="text-xs text-indigo-600 mt-1">
                      Sum of all weekly payments
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-orange-300">
                    <div className="text-sm text-gray-600 mb-1">Total Interest</div>
                    <div className="text-xl font-bold text-orange-600">
                      {calculations.totalInterestPaid.toLocaleString()} KES
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Interest paid over loan term
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-300">
                    <div className="text-sm text-gray-600 mb-1">Total Principal</div>
                    <div className="text-xl font-bold text-green-600">
                      {calculations.totalPrincipalPaid.toLocaleString()} KES
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Principal components repaid
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded border border-purple-300">
                  <div className="text-sm text-purple-800 font-semibold">Key Financial Formulas:</div>
                  <div className="text-xs text-purple-700 mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>• Total Payments = Sum of all weekly payments</div>
                    <div>• Total Interest = Sum of interest portions</div>
                    <div>• Total Principal = Total Payments - Total Interest</div>
                    <div>• Total Cost of Credit = Interest + Fees</div>
                  </div>
                </div>
              </div>

              {/* Installment Schedule */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Payment Schedule - Fixed Tenure ({calculations.totalWeeks} weeks)
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                    <tr className="bg-gray-200 text-gray-700">
                      <th className="px-3 py-3 text-left font-semibold">Week</th>
                      <th className="px-3 py-3 text-center font-semibold">Priority</th>
                      <th className="px-3 py-3 text-right font-semibold">Total Pay</th>
                      <th className="px-3 py-3 text-right font-semibold">Interest</th>
                      <th className="px-3 py-3 text-right font-semibold">Principal</th>
                      <th className="px-3 py-3 text-right font-semibold">Base Princ</th>
                      <th className="px-3 py-3 text-right font-semibold border-r-2">Extra Princ</th>
                      <th className="px-3 py-3 text-right font-semibold">3rd Party</th>
                      <th className="px-3 py-3 text-right font-semibold">Collateral</th>
                      <th className="px-3 py-3 text-right font-semibold">Out Int</th>
                      <th className="px-3 py-3 text-right font-semibold">Out Int After</th>
                      <th className="px-3 py-3 text-right font-semibold">Principal Comp</th>
                      <th className="px-3 py-3 text-right font-semibold">Balance</th>
                    </tr>
                    </thead>
                    <tbody>
                    {calculations.schedule.map((row, idx) => (
                        <tr
                            key={idx}
                            className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        >
                          <td className="px-3 py-2 font-medium text-black">{row.week}</td>
                          <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              row.currentPriority === 1 ? 'bg-orange-100 text-orange-800' :
                                  row.currentPriority === 2 ? 'bg-green-100 text-green-800' :
                                      row.currentPriority === 3 ? 'bg-orange-100 text-orange-800' :
                                          row.currentPriority === 4 ? 'bg-orange-200 text-orange-800' :
                                              'bg-blue-100 text-blue-800'
                          }`}>
                            {row.currentPriority}
                          </span>
                          </td>
                          <td className="px-3 py-2 text-right text-black font-semibold">
                            {row.totalPayment.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-orange-600">
                            {row.interestPayment.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-blue-600 font-semibold">
                            {row.principalPayment.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-blue-400">
                            {row.principalPaymentFromBase.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-black font-semibold border-r-2">
                            {row.principalPaymentFromExtra.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-orange-600">
                            {row.thirdPartyPayment.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-green-600">
                            {row.collateralPayment.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-orange-600">
                            {row.interestPrincipalPayment.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-orange-600">
                            {row.interestAfterJudgmentPayment?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-3 py-2 text-right text-blue-600">
                            {row.principalComponentsPayment.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600 font-semibold">
                            {row.remainingPrincipal.toLocaleString(2)}
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Consistent Payment System:</strong><br />
                    • <strong>Target Weekly Payment:</strong> {calculations.targetWeeklyPayment} KES (fixed throughout)<br />
                    • <strong>Base Payment:</strong> {calculations.initialCalculatedPayment?.toFixed(2) || '0.00'} KES (stays constant)<br />
                    • <strong>Extra Payment:</strong> {calculations.initialExtraPayment?.toFixed(2) || '0.00'} KES (stays constant)<br />
                    • <strong>Initial Tenure:</strong> {calculations.initialTenure} weeks based on starting balance<br />
                    • <strong>Final Tenure:</strong> {calculations.totalWeeks} weeks (extended for recurring fees)<br />
                    • <strong>Total Extra Applied:</strong> {calculations.totalExtraPaymentApplied?.toFixed(2) || '0.00'} KES to principal reduction<br />
                    {calculations.hasRecurringFees && (
                        <>
                          • <strong>Annual Third Party Fees:</strong> {calculations.annualThirdPartyFees.toLocaleString()} KES added every 52 weeks<br />
                          • <strong>Tenure Extension:</strong> Loan term extended instead of changing payments<br />
                        </>
                    )}
                    <br />
                    <strong>Payment Priority:</strong><br />
                    1. Interest (from Base Payment)<br />
                    2. Waterfall Principal (from Base Payment): Third Party → Collateral → Outstanding Interest (Till Judgment) → Outstanding Interest (After Judgment) → Principal Components<br />
                    3. Extra Principal Reduction (from Extra Payment): Directly reduces principal components
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded border border-green-200">
                  <div className="text-sm text-green-800 font-semibold">Weekly Payment Formulas:</div>
                  <div className="text-xs text-green-700 mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>• Total Payment = Interest + Principal Payment</div>
                    <div>• Principal Payment = Base Principal + Extra Principal</div>
                    <div>• Weekly Interest = Remaining Balance × Weekly Rate</div>
                    <div>• New Balance = Old Balance - Principal Payment</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-8 border-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                Share Your Calculation
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Copy the shareable link below to share this exact calculation with others.
                    When they open the link, all values will be automatically populated.
                  </p>
                  <button
                      onClick={copyShareableUrl}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold w-full justify-center"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Shareable Link
                  </button>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="text-sm text-gray-600 mb-2">Current Shareable Link:</div>
                  <div className="text-xs bg-gray-100 p-3 rounded border break-all font-mono text-gray-700">
                    {generateShortLink()}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    This link contains all your current input values as URL parameters.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
  );
}
