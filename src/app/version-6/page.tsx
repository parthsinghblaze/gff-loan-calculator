'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, Plus, Trash2, TrendingUp, AlertCircle, Download, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LoanCalculator() {
    // Set default values
    const [principalComponents, setPrincipalComponents] = useState([
        { id: 1, type: 'Wellness Warrior', amount: '3000' },
        { id: 2, type: 'Tuition', amount: '54000' },
        { id: 3, type: 'Upkeep', amount: '69000' }
    ]);

    const [thirdPartyFees, setThirdPartyFees] = useState([
        { id: 1, type: 'GFF Subscription', amount: '3000', isRecurring: true },
        { id: 2, type: 'Hospital Cash', amount: '2000', isRecurring: true },
        { id: 3, type: 'Insurance', amount: '2000', isRecurring: true }
    ]);

    const [upfrontAmount, setUpfrontAmount] = useState('15000');
    const [outstandingInterest, setOutstandingInterest] = useState('43138');
    const [interestRate, setInterestRate] = useState('20');

    const principalOptions = [
        'Wellness Warrior',
        'Tuition',
        'Upkeep',
    ];

    const thirdPartyOptions = [
        'GFF Subscription',
        'Hospital Cash',
        'Insurance',
    ];

    const addPrincipalComponent = () => {
        setPrincipalComponents([...principalComponents, { id: Date.now(), type: '', amount: '' }]);
    };

    const removePrincipalComponent = (id) => {
        if (principalComponents.length > 1) {
            setPrincipalComponents(principalComponents.filter(c => c.id !== id));
        }
    };

    const updatePrincipalComponent = (id, field, value) => {
        setPrincipalComponents(principalComponents.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
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

    const generatePDF = () => {
        const doc = new jsPDF();
        let yPos = 20;

        // Title
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text('GFK Loan Calculation Report', 105, yPos, { align: 'center' });

        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);

        yPos += 15;

        // Principal Components Section
        doc.setFontSize(16);
        doc.setTextColor(37, 99, 235);
        doc.text('Principal Components', 20, yPos);
        yPos += 8;

        const principalTableData = principalComponents
            .filter(c => c.type || c.amount)
            .map(c => [c.type || 'N/A', `${parseFloat(c.amount || 0).toLocaleString()} KES`]);

        if (principalTableData.length > 0) {
            autoTable(doc, {
                startY: yPos,
                head: [['Type', 'Amount']],
                body: principalTableData,
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235] },
                margin: { left: 20, right: 20 },
                styles: { fontSize: 10 }
            });
            yPos = doc.lastAutoTable.finalY + 5;
        }

        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235);
        doc.setFont(undefined, 'bold');
        doc.text(`Total Principal Components: ${calculations.totalPrincipalComponents.toLocaleString()} KES`, 20, yPos);
        doc.setFont(undefined, 'normal');
        yPos += 12;

        // Third Party Fees Section
        doc.setFontSize(16);
        doc.setTextColor(220, 120, 0);
        doc.text('Third Party Fees', 20, yPos);
        yPos += 8;

        const thirdPartyTableData = thirdPartyFees
            .filter(c => c.type || c.amount)
            .map(c => [c.type || 'N/A', `${parseFloat(c.amount || 0).toLocaleString()} KES`, c.isRecurring ? 'Annual' : 'One-time']);

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
            ['2. COLLATERAL FEE (10%)', `${calculations.collateralFee.toLocaleString()}`],
            ['3. OUTSTANDING INTEREST', `${(parseFloat(outstandingInterest) || 0).toLocaleString()}`],
            ['4. PRINCIPAL COMPONENTS', ''],
            ['   - Wellness Warrior, Tuition, Upkeep', `${calculations.totalPrincipalComponents.toLocaleString()}`],
            ['   - GFF Fee (5%)', `${calculations.gffFee.toLocaleString()}`],
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
            didParseCell: function (data) {
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
                ['2', 'Collateral Fee', `${calculations.upfrontAllocation.appliedToCollateral.toLocaleString()}`, `${(calculations.collateralFee - calculations.upfrontAllocation.appliedToCollateral).toLocaleString()}`],
                ['3', 'Outstanding Interest', `${calculations.upfrontAllocation.appliedToInterest.toLocaleString()}`, `${(parseFloat(outstandingInterest) - calculations.upfrontAllocation.appliedToInterest).toLocaleString()}`],
                ['4', 'Principal Components', `${calculations.upfrontAllocation.appliedToPrincipal.toLocaleString()}`, `${(calculations.totalPrincipalWithGff - calculations.upfrontAllocation.appliedToPrincipal).toLocaleString()}`],
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
                    if (data.section === 'body' && data.row.index === 4) {
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
            ['Weekly Payment Amount', '2,200 KES'],
            ['Total Repayment Weeks', `${calculations.totalWeeks}`],
            ['Total Payments', `${calculations.totalPayments.toLocaleString()} KES`],
            ['Total Interest Paid', `${calculations.totalInterestPaid.toLocaleString()} KES`],
            ['Total Principal Paid', `${calculations.totalPrincipalPaid.toLocaleString()} KES`],
            ['Annual Third Party Fees', `${calculations.annualThirdPartyFees.toLocaleString()} KES`]
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
            row.thirdPartyPayment.toFixed(2),
            row.collateralPayment.toFixed(2),
            row.interestPrincipalPayment.toFixed(2),
            row.principalComponentsPayment.toFixed(2),
            row.remainingThirdParty.toFixed(2),
            row.remainingCollateral.toFixed(2),
            row.remainingInterest.toFixed(2),
            row.remainingPrincipalComponents.toFixed(2),
            row.remainingPrincipal.toFixed(2)
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [[
                'Week',
                'Total Pay',
                'Interest',
                'Principal',
                'Third Party',
                'Collateral',
                'Out Int',
                'Principal Comp',
                '3rd Party Rem',
                'Collateral Rem',
                'Out Int Rem',
                'Principal Rem',
                'Balance'
            ]],
            body: scheduleData,
            theme: 'striped',
            headStyles: {
                fillColor: [37, 99, 235],
                fontSize: 5,
                cellPadding: 1
            },
            styles: {
                fontSize: 4,
                cellPadding: 1,
                overflow: 'linebreak'
            },
            margin: { left: 5, right: 5 },
        });

        doc.save(`GFK_Loan_Calculation_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const calculations = useMemo(() => {
        // Calculate base amounts
        const totalPrincipalComponents = principalComponents.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        const totalThirdPartyFees = thirdPartyFees.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        const upfront = parseFloat(upfrontAmount) || 0;
        const outstandingInt = parseFloat(outstandingInterest) || 0;
        const rate = parseFloat(interestRate) || 20;

        // Calculate GFF fee (5%) of (Principal Components + Third Party Fees)
        const gffFee = (totalPrincipalComponents + totalThirdPartyFees) * 0.05;

        // Calculate Collateral Fee (10%) of (Principal Components + Third Party Fees)
        const collateralFee = (totalPrincipalComponents + totalThirdPartyFees) * 0.10;

        // Total Principal Components including GFF fee
        const totalPrincipalWithGff = totalPrincipalComponents + gffFee;

        // TOTAL LOAN BALANCE = Third Party + Collateral + Outstanding Interest + Principal Components (with GFF)
        const totalLoanBalance = totalThirdPartyFees + collateralFee + outstandingInt + totalPrincipalWithGff;

        const weeklyPayment = 2200;

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
        const appliedToCollateral = Math.min(remainingUpfront, collateralFee);
        remainingUpfront = Math.max(0, remainingUpfront - collateralFee);

        // 3. Outstanding Interest (Priority 3)
        const appliedToInterest = Math.min(remainingUpfront, outstandingInt);
        remainingUpfront = Math.max(0, remainingUpfront - outstandingInt);

        // 4. Principal Components with GFF (Priority 4)
        const appliedToPrincipal = Math.min(remainingUpfront, totalPrincipalWithGff);

        // Calculate remaining balances after upfront for tracking
        let remainingThirdParty = Math.max(0, totalThirdPartyFees - appliedToThirdParty);
        let remainingCollateral = Math.max(0, collateralFee - appliedToCollateral);
        let remainingInterest = Math.max(0, outstandingInt - appliedToInterest);
        let remainingPrincipalComponents = Math.max(0, totalPrincipalWithGff - appliedToPrincipal);

        let remainingPrincipal = remainingThirdParty + remainingCollateral + remainingInterest + remainingPrincipalComponents;

        const schedule = [];
        let weekNum = 1;
        let currentPriority = 1;
        let weeksInYear = 0;
        let annualThirdPartyFees = 0;

        // Calculate annual third party fees from recurring fees
        thirdPartyFees.forEach(fee => {
            if (fee.isRecurring) {
                annualThirdPartyFees += parseFloat(fee.amount) || 0;
            }
        });

        while (remainingPrincipal > 0.01 && weekNum <= 500) {
            let payment = weeklyPayment;
            let interestPayment = 0;
            let principalPayment = 0;
            let thirdPartyPayment = 0;
            let collateralPayment = 0;
            let interestPrincipalPayment = 0;
            let principalComponentsPayment = 0;

            // Calculate weekly interest using daily compounded rate
            const weeklyInterestAccrued = remainingPrincipal * weeklyInterestRate;

            // CORRECTED WATERFALL PAYMENT PRIORITY - SEQUENTIAL:
            // 1. Pay current week's interest first (always priority)
            if (payment > 0 && weeklyInterestAccrued > 0) {
                interestPayment = Math.min(payment, weeklyInterestAccrued);
                payment -= interestPayment;
            }

            // 2. Then pay principal according to waterfall priority
            if (payment > 0) {
                // PRIORITY 1: Third Party Fees
                if (remainingThirdParty > 0.01) {
                    thirdPartyPayment = Math.min(payment, remainingThirdParty);
                    remainingThirdParty -= thirdPartyPayment;
                    payment -= thirdPartyPayment;
                    principalPayment += thirdPartyPayment;
                    currentPriority = 1;
                }

                // PRIORITY 2: Collateral Fee (only if Priority 1 is paid off)
                if (payment > 0 && remainingThirdParty <= 0.01 && remainingCollateral > 0.01) {
                    collateralPayment = Math.min(payment, remainingCollateral);
                    remainingCollateral -= collateralPayment;
                    payment -= collateralPayment;
                    principalPayment += collateralPayment;
                    currentPriority = 2;
                }

                // PRIORITY 3: Outstanding Interest (only if Priorities 1 & 2 are paid off)
                if (payment > 0 && remainingThirdParty <= 0.01 && remainingCollateral <= 0.01 && remainingInterest > 0.01) {
                    interestPrincipalPayment = Math.min(payment, remainingInterest);
                    remainingInterest -= interestPrincipalPayment;
                    payment -= interestPrincipalPayment;
                    principalPayment += interestPrincipalPayment;
                    currentPriority = 3;
                }

                // PRIORITY 4: Principal Components with GFF (only if Priorities 1-3 are paid off)
                if (payment > 0 && remainingThirdParty <= 0.01 && remainingCollateral <= 0.01 &&
                    remainingInterest <= 0.01 && remainingPrincipalComponents > 0.01) {
                    principalComponentsPayment = Math.min(payment, remainingPrincipalComponents);
                    remainingPrincipalComponents -= principalComponentsPayment;
                    payment -= principalComponentsPayment;
                    principalPayment += principalComponentsPayment;
                    currentPriority = 4;
                }
            }

            // Add annual third party fees every 52 weeks
            if (weekNum % 52 === 0 && annualThirdPartyFees > 0) {
                remainingThirdParty += annualThirdPartyFees;
                remainingPrincipal += annualThirdPartyFees;
            }

            const totalPaid = interestPayment + principalPayment;
            remainingPrincipal = remainingThirdParty + remainingCollateral + remainingInterest + remainingPrincipalComponents;

            schedule.push({
                week: weekNum++,
                totalPayment: totalPaid,
                interestPayment,
                principalPayment,
                weeklyInterestAccrued,
                remainingPrincipal,
                // Track individual component payments and balances
                thirdPartyPayment,
                collateralPayment,
                interestPrincipalPayment,
                principalComponentsPayment,
                // Track remaining balances for each waterfall component
                remainingThirdParty,
                remainingCollateral,
                remainingInterest,
                remainingPrincipalComponents,
                currentPriority
            });

            weeksInYear++;
            if (weeksInYear >= 52) weeksInYear = 0;
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
            collateralFee,
            totalPrincipalWithGff,
            totalLoanBalance,
            upfrontApplied: upfront,
            schedule,
            totalPayments,
            totalInterestPaid,
            totalPrincipalPaid,
            totalWeeks: schedule.length,

            // Interest Rate Information
            effectiveAnnualRate: effectiveAnnualRateFromCompounding.toFixed(2),
            nominalAnnualRate: rate,
            weeklyInterestRate: (weeklyInterestRate * 100).toFixed(4),

            annualThirdPartyFees,
            upfrontAllocation: {
                appliedToThirdParty,
                appliedToCollateral,
                appliedToInterest,
                appliedToPrincipal
            },

            // Financial ratios
            totalCostOfCredit: totalInterestPaid + totalThirdPartyFees + collateralFee + gffFee,
            amountFinanced: totalLoanAmount,
            totalRepaymentAmount: totalPayments
        };
    }, [principalComponents, thirdPartyFees, upfrontAmount, outstandingInterest, interestRate]);

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
                                    <p className="text-blue-100">Calculate your loan repayment schedule with sequential waterfall payment model</p>
                                </div>
                            </div>
                            <button
                                onClick={generatePDF}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold shadow-lg"
                            >
                                <Download className="w-5 h-5" />
                                Download PDF Report
                            </button>
                        </div>
                    </div>

                    {/* Input Form */}
                    <div className="p-8">
                        <div className="grid lg:grid-cols-2 gap-8 mb-8">
                            {/* Principal Components */}
                            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">4. Principal Components (Priority 4)</h3>
                                <p className="text-sm text-gray-600 mb-4">Wellness Warrior, Tuition, Upkeep + GFF Fee (5%)</p>
                                {principalComponents.map((component) => (
                                    <div key={component.id} className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            list="principalOptions"
                                            value={component.type}
                                            onChange={(e) => updatePrincipalComponent(component.id, 'type', e.target.value)}
                                            className="text-black flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Select type"
                                        />
                                        <input
                                            type="number"
                                            value={component.amount}
                                            onChange={(e) => updatePrincipalComponent(component.id, 'amount', e.target.value)}
                                            className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Amount"
                                        />
                                        {principalComponents.length > 1 && (
                                            <button
                                                onClick={() => removePrincipalComponent(component.id)}
                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <datalist id="principalOptions">
                                    {principalOptions.map(option => (
                                        <option key={option} value={option} />
                                    ))}
                                </datalist>
                                <button
                                    onClick={addPrincipalComponent}
                                    className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Principal Component
                                </button>
                                <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                                    <div className="text-sm text-gray-600">Base Principal Components:</div>
                                    <div className="text-xl font-bold text-blue-600">
                                        {calculations.totalPrincipalComponents.toLocaleString()} KES
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        + GFF Fee (5%): {calculations.gffFee.toLocaleString()} KES
                                    </div>
                                    <div className="text-sm font-semibold text-green-600 mt-1">
                                        Total: {calculations.totalPrincipalWithGff.toLocaleString()} KES
                                    </div>
                                </div>
                            </div>

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
                                </div>
                            </div>
                        </div>

                        {/* Other Inputs */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                                    3. Outstanding Interest (KES)
                                </label>
                                <input
                                    type="number"
                                    value={outstandingInterest}
                                    onChange={(e) => setOutstandingInterest(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
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
                            </div>
                        </div>

                        {/* Auto-calculated fees */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">2. Collateral Fee (Auto-calculated)</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Base Amount:</span>
                                        <span className="font-semibold">
                                            {(calculations.totalPrincipalComponents + calculations.totalThirdPartyFees).toLocaleString()} KES
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Collateral Fee (10%):</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {calculations.collateralFee.toLocaleString()} KES
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">GFF Fee (Auto-calculated)</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Base Amount:</span>
                                        <span className="font-semibold">
                                            {(calculations.totalPrincipalComponents + calculations.totalThirdPartyFees).toLocaleString()} KES
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">GFF Fee (5%):</span>
                                        <span className="text-lg font-bold text-purple-600">
                                            {calculations.gffFee.toLocaleString()} KES
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comprehensive Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Comprehensive Loan Summary</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-200">
                                    <div className="text-sm text-gray-600 mb-1">1. Third Party Fees</div>
                                    <div className="text-lg font-bold text-orange-600">
                                        {calculations.totalThirdPartyFees.toLocaleString()} KES
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                                    <div className="text-sm text-gray-600 mb-1">2. Collateral Fee (10%)</div>
                                    <div className="text-lg font-bold text-green-600">
                                        {calculations.collateralFee.toLocaleString()} KES
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-300">
                                    <div className="text-sm text-gray-600 mb-1">3. Outstanding Interest</div>
                                    <div className="text-lg font-bold text-orange-600">
                                        {(parseFloat(outstandingInterest) || 0).toLocaleString()} KES
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                                    <div className="text-sm text-gray-600 mb-1">4. Principal Components</div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {calculations.totalPrincipalWithGff.toLocaleString()} KES
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Base: {calculations.totalPrincipalComponents.toLocaleString()} + GFF: {calculations.gffFee.toLocaleString()}
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
                                        Sum of all 4 priority components
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
                                </div>
                            </div>
                        </div>

                        {/* Upfront Allocation Details */}
                        {calculations.upfrontApplied > 0 && (
                            <div className="bg-yellow-50 rounded-lg p-6 mb-8 border-2 border-yellow-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Upfront Payment Allocation (Sequential Waterfall)</h3>
                                <div className="grid md:grid-cols-4 gap-4">
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
                                            Remaining: {(calculations.collateralFee - calculations.upfrontAllocation.appliedToCollateral).toLocaleString()} KES
                                        </div>
                                    </div>
                                    <div className="text-center bg-white p-4 rounded-lg border border-orange-300">
                                        <div className="text-sm text-gray-600">3. Applied to Interest</div>
                                        <div className="text-lg font-bold text-orange-600">
                                            {calculations.upfrontAllocation.appliedToInterest.toLocaleString()} KES
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Remaining: {(parseFloat(outstandingInterest) - calculations.upfrontAllocation.appliedToInterest).toLocaleString()} KES
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
                            </div>
                        )}

                        {/* Installment Schedule */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6" />
                                Payment Schedule - Sequential Waterfall ({calculations.totalWeeks} weeks)
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
                                        <th className="px-3 py-3 text-right font-semibold">3rd Party</th>
                                        <th className="px-3 py-3 text-right font-semibold">Collateral</th>
                                        <th className="px-3 py-3 text-right font-semibold">Out Int</th>
                                        <th className="px-3 py-3 text-right font-semibold">Principal Comp</th>
                                        <th className="px-3 py-3 text-right font-semibold">3rd Party Rem</th>
                                        <th className="px-3 py-3 text-right font-semibold">Collateral Rem</th>
                                        <th className="px-3 py-3 text-right font-semibold">Out Int Rem</th>
                                        <th className="px-3 py-3 text-right font-semibold">Principal Rem</th>
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
                                          'bg-blue-100 text-blue-800'
                          }`}>
                            {row.currentPriority}
                          </span>
                                            </td>
                                            <td className="px-3 py-2 text-right text-black font-semibold">
                                                {row.totalPayment.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-orange-600">
                                                {row.interestPayment.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-blue-600 font-semibold">
                                                {row.principalPayment.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-orange-600">
                                                {row.thirdPartyPayment.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-green-600">
                                                {row.collateralPayment.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-orange-600">
                                                {row.interestPrincipalPayment.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-blue-600">
                                                {row.principalComponentsPayment.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-orange-600 font-medium">
                                                {row.remainingThirdParty.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-green-600 font-medium">
                                                {row.remainingCollateral.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-orange-600 font-medium">
                                                {row.remainingInterest.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-blue-600 font-medium">
                                                {row.remainingPrincipalComponents.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-gray-600 font-semibold">
                                                {row.remainingPrincipal.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Sequential Waterfall Payment Priority:</strong><br />
                                    <strong>Upfront Payment:</strong> (1) Third Party Fees → (2) Collateral Fee → (3) Outstanding Interest → (4) Principal Components<br />
                                    <strong>Weekly Payments:</strong> (1) Current Interest → Then Principal in sequential order:<br />
                                    &nbsp;&nbsp;• <strong>Priority 1:</strong> Third Party Fees (MUST be paid completely first)<br />
                                    &nbsp;&nbsp;• <strong>Priority 2:</strong> Collateral Fee (only after Priority 1 is $0)<br />
                                    &nbsp;&nbsp;• <strong>Priority 3:</strong> Outstanding Interest (only after Priorities 1 & 2 are $0)<br />
                                    &nbsp;&nbsp;• <strong>Priority 4:</strong> Principal Components (only after Priorities 1-3 are $0)<br />
                                    <strong>Interest:</strong> Accrues weekly at {calculations.weeklyInterestRate}% (Effective Annual Rate: {calculations.effectiveAnnualRate}%)<br />
                                    <strong>Third Party Fees:</strong> Recurring fees charged annually every 52 weeks<br />
                                    <strong>GFF Fee:</strong> 5% of (Principal Components + Third Party Fees) included in Principal Components<br />
                                    <strong>Collateral Fee:</strong> 10% of (Principal Components + Third Party Fees)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
