'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, Plus, Trash2, TrendingUp, AlertCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LoanCalculator() {
    const [gfkComponents, setGfkComponents] = useState([
        { id: 1, type: '', amount: '' }
    ]);
    const [principalComponents, setPrincipalComponents] = useState([
        { id: 1, type: '', amount: '' }
    ]);
    const [upfrontAmount, setUpfrontAmount] = useState('');
    const [outstandingInterest, setOutstandingInterest] = useState('');
    const [interestRate, setInterestRate] = useState('20');

    const gfkOptions = [
        'Wellness Warrior',
    ];

    const principalOptions = [
        'Tuition',
        'Upkeep',
        'Hospital Cash',
        'Insurance',
        'GFF Subscription',
    ];

    const addGfkComponent = () => {
        setGfkComponents([...gfkComponents, { id: Date.now(), type: '', amount: '' }]);
    };

    const removeGfkComponent = (id) => {
        if (gfkComponents.length > 1) {
            setGfkComponents(gfkComponents.filter(c => c.id !== id));
        }
    };

    const updateGfkComponent = (id, field, value) => {
        setGfkComponents(gfkComponents.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

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
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' });

        yPos += 15;

        // GFK Components Section
        doc.setFontSize(16);
        doc.setTextColor(124, 58, 237);
        doc.text('GFK Components', 20, yPos);
        yPos += 8;

        const gfkTableData = gfkComponents
            .filter(c => c.type || c.amount)
            .map(c => [c.type || 'N/A', `${parseFloat(c.amount || 0).toLocaleString()} KES`]);

        if (gfkTableData.length > 0) {
            autoTable(doc, {
                startY: yPos,
                head: [['Type', 'Amount']],
                body: gfkTableData,
                theme: 'striped',
                headStyles: { fillColor: [124, 58, 237] },
                margin: { left: 20, right: 20 },
                styles: { fontSize: 10 }
            });
            yPos = doc.lastAutoTable.finalY + 5;
        }

        doc.setFontSize(12);
        doc.setTextColor(124, 58, 237);
        doc.setFont(undefined, 'bold');
        doc.text(`Total GFK Amount: ${calculations.totalGfk.toLocaleString()} KES`, 20, yPos);
        doc.setFont(undefined, 'normal');
        yPos += 12;

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
        yPos += 15;

        // Comprehensive Summary Section
        doc.setFontSize(16);
        doc.setTextColor(5, 150, 105);
        doc.text('Comprehensive Loan Summary', 20, yPos);
        yPos += 8;

        const summaryData = [
            ['WATERFALL PRIORITY BREAKDOWN', 'AMOUNT (KES)'],
            ['1. GFK FEE COMPONENTS', ''],
            ['   - GFK Components', `${calculations.totalGfk.toLocaleString()}`],
            ['   - GFF Fee (5%)', `${calculations.gffFee.toLocaleString()}`],
            ['   TOTAL GFK FEE', `${calculations.totalGfkFee.toLocaleString()}`],
            ['2. COLLATERAL FEE (10%)', `${calculations.collateralFee.toLocaleString()}`],
            ['3. OUTSTANDING INTEREST', `${(parseFloat(outstandingInterest) || 0).toLocaleString()}`],
            ['4. PRINCIPAL COMPONENTS', `${calculations.totalPrincipalComponents.toLocaleString()}`],
            ['TOTAL PRINCIPAL BALANCE', `${calculations.totalPrincipal.toLocaleString()}`],
            ['UPFRONT PAYMENT APPLIED', `- ${calculations.upfrontApplied.toLocaleString()}`],
            ['REMAINING PRINCIPAL BALANCE', `${(calculations.totalPrincipal - calculations.upfrontApplied).toLocaleString()}`]
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
                    if (data.cell.raw.includes('TOTAL GFK FEE') ||
                        data.cell.raw.includes('TOTAL PRINCIPAL BALANCE') ||
                        data.cell.raw.includes('REMAINING PRINCIPAL BALANCE')) {
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
                ['1', 'GFK Fee', `${calculations.upfrontAllocation.appliedToGfk.toLocaleString()}`, `${(calculations.totalGfkFee - calculations.upfrontAllocation.appliedToGfk).toLocaleString()}`],
                ['2', 'Collateral Fee', `${calculations.upfrontAllocation.appliedToCollateral.toLocaleString()}`, `${(calculations.collateralFee - calculations.upfrontAllocation.appliedToCollateral).toLocaleString()}`],
                ['3', 'Outstanding Interest', `${calculations.upfrontAllocation.appliedToInterest.toLocaleString()}`, `${(parseFloat(outstandingInterest) - calculations.upfrontAllocation.appliedToInterest).toLocaleString()}`],
                ['4', 'Principal Components', `${calculations.upfrontAllocation.appliedToPrincipal.toLocaleString()}`, `${(calculations.totalPrincipalComponents - calculations.upfrontAllocation.appliedToPrincipal).toLocaleString()}`],
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
                    1: { cellWidth: 50 },
                    2: { halign: 'right', cellWidth: 45 },
                    3: { halign: 'right', cellWidth: 50 }
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
            ['Interest Rate', `${interestRate}% per annum`],
            ['Weekly Payment Amount', '2,200 KES'],
            ['Total Repayment Weeks', `${calculations.totalWeeks}`],
            ['Total Payments', `${calculations.totalPayments.toLocaleString()} KES`],
            ['Total Interest Paid', `${calculations.totalInterestPaid.toLocaleString()} KES`],
            ['Total Principal Paid', `${(calculations.totalPayments - calculations.totalInterestPaid).toLocaleString()} KES`],
            ['Effective Annual Rate', `${calculations.effectiveAnnualRate}%`]
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

        // Payment Schedule on new page
        doc.addPage();
        yPos = 20;

        doc.setFontSize(16);
        doc.setTextColor(37, 99, 235);
        doc.text('Detailed Payment Schedule', 20, yPos);
        yPos += 8;

        const scheduleData = calculations.schedule.map(row => [
            row.week,
            row.currentPriority,
            row.totalPayment.toFixed(2),
            row.interestPayment.toFixed(2),
            row.principalPayment.toFixed(2),
            row.gfkFeePayment.toFixed(2),
            row.collateralPayment.toFixed(2),
            row.interestPrincipalPayment.toFixed(2),
            row.principalComponentsPayment.toFixed(2),
            row.remainingPrincipal.toFixed(2)
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [[
                'Week',
                'Priority',
                'Total Pay',
                'Interest',
                'Principal',
                'GFK Fee',
                'Collateral',
                'Out Int',
                'Prin Comp',
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
            // Remove columnStyles to let it auto-fit to full width
        });

        // Final Summary
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(
            'SEQUENTIAL WATERFALL: Priority 1 (GFK Fee) → Priority 2 (Collateral) → Priority 3 (Interest) → Priority 4 (Principal)',
            105,
            finalY,
            { align: 'center' }
        );
        doc.text(
            'Each priority must be completely paid before moving to the next. Interest accrues weekly on total remaining balance.',
            105,
            finalY + 5,
            { align: 'center' }
        );

        // Save PDF
        doc.save(`GFK_Loan_Calculation_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const calculations = useMemo(() => {
        // Calculate base amounts
        const totalGfk = gfkComponents.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        const totalPrincipalComponents = principalComponents.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        const upfront = parseFloat(upfrontAmount) || 0;
        const outstandingInt = parseFloat(outstandingInterest) || 0;
        const rate = parseFloat(interestRate) || 20;

        // Calculate fees using WATERFALL PRIORITY order
        const gffFee = (totalGfk + totalPrincipalComponents) * 0.05;
        const collateralFee = (totalGfk + totalPrincipalComponents) * 0.10;

        // TOTAL PRINCIPAL = GFK Fee + Collateral Fee + Outstanding Interest + Principal Components
        const totalGfkFee = totalGfk + gffFee;
        const totalPrincipal = totalGfkFee + collateralFee + outstandingInt + totalPrincipalComponents;

        const weeklyPayment = 2200;

        // CORRECT WEEKLY INTEREST CALCULATION for compound interest
        const weeklyInterestRate = Math.pow(1 + rate / 100, 1/52) - 1;

        // Apply upfront payment according to waterfall priority SEQUENTIALLY
        let remainingUpfront = upfront;

        // WATERFALL PRIORITY for upfront payment:
        // 1. GFK Fee (Priority 1)
        const appliedToGfk = Math.min(remainingUpfront, totalGfkFee);
        remainingUpfront = Math.max(0, remainingUpfront - totalGfkFee);

        // 2. Collateral Fee (Priority 2)
        const appliedToCollateral = Math.min(remainingUpfront, collateralFee);
        remainingUpfront = Math.max(0, remainingUpfront - collateralFee);

        // 3. Outstanding Interest (Priority 3)
        const appliedToInterest = Math.min(remainingUpfront, outstandingInt);
        remainingUpfront = Math.max(0, remainingUpfront - outstandingInt);

        // 4. Principal Components (Priority 4)
        const appliedToPrincipal = Math.min(remainingUpfront, totalPrincipalComponents);

        // Calculate remaining balances after upfront for tracking
        let remainingGfkFee = Math.max(0, totalGfkFee - appliedToGfk);
        let remainingCollateral = Math.max(0, collateralFee - appliedToCollateral);
        let remainingInterest = Math.max(0, outstandingInt - appliedToInterest);
        let remainingPrincipalComponents = Math.max(0, totalPrincipalComponents - appliedToPrincipal);

        let remainingPrincipal = remainingGfkFee + remainingCollateral + remainingInterest + remainingPrincipalComponents;

        const schedule = [];
        let weekNum = 1;
        let currentPriority = 1; // Start with Priority 1 (GFK Fee)

        while (remainingPrincipal > 0.01 && weekNum <= 500) {
            let payment = weeklyPayment;
            let interestPayment = 0;
            let principalPayment = 0;
            let gfkFeePayment = 0;
            let collateralPayment = 0;
            let interestPrincipalPayment = 0;
            let principalComponentsPayment = 0;

            // CORRECT: Calculate weekly interest using compound interest formula
            const weeklyInterestAccrued = remainingPrincipal * weeklyInterestRate;

            // WATERFALL PAYMENT PRIORITY - SEQUENTIAL:
            // 1. Pay current week's interest first (always priority)
            if (payment > 0 && weeklyInterestAccrued > 0) {
                interestPayment = Math.min(payment, weeklyInterestAccrued);
                payment -= interestPayment;
            }

            // 2. Then pay principal according to waterfall priority
            if (payment > 0) {
                // PRIORITY 1: GFK Fee
                if (remainingGfkFee > 0.01) {
                    gfkFeePayment = Math.min(payment, remainingGfkFee);
                    remainingGfkFee -= gfkFeePayment;
                    payment -= gfkFeePayment;
                    principalPayment += gfkFeePayment;
                    currentPriority = 1;
                }

                // PRIORITY 2: Collateral Fee (only if Priority 1 is paid off)
                if (payment > 0 && remainingGfkFee <= 0.01 && remainingCollateral > 0.01) {
                    collateralPayment = Math.min(payment, remainingCollateral);
                    remainingCollateral -= collateralPayment;
                    payment -= collateralPayment;
                    principalPayment += collateralPayment;
                    currentPriority = 2;
                }

                // PRIORITY 3: Outstanding Interest (only if Priorities 1 & 2 are paid off)
                if (payment > 0 && remainingGfkFee <= 0.01 && remainingCollateral <= 0.01 && remainingInterest > 0.01) {
                    interestPrincipalPayment = Math.min(payment, remainingInterest);
                    remainingInterest -= interestPrincipalPayment;
                    payment -= interestPrincipalPayment;
                    principalPayment += interestPrincipalPayment;
                    currentPriority = 3;
                }

                // PRIORITY 4: Principal Components (only if Priorities 1, 2 & 3 are paid off)
                if (payment > 0 && remainingGfkFee <= 0.01 && remainingCollateral <= 0.01 && remainingInterest <= 0.01 && remainingPrincipalComponents > 0.01) {
                    principalComponentsPayment = Math.min(payment, remainingPrincipalComponents);
                    remainingPrincipalComponents -= principalComponentsPayment;
                    payment -= principalComponentsPayment;
                    principalPayment += principalComponentsPayment;
                    currentPriority = 4;
                }
            }

            const totalPaid = interestPayment + principalPayment;
            remainingPrincipal = remainingGfkFee + remainingCollateral + remainingInterest + remainingPrincipalComponents;

            schedule.push({
                week: weekNum++,
                totalPayment: totalPaid,
                interestPayment,
                principalPayment,
                weeklyInterestAccrued,
                remainingPrincipal,
                // Track individual component payments and balances
                gfkFeePayment,
                collateralPayment,
                interestPrincipalPayment,
                principalComponentsPayment,
                remainingGfkFee,
                remainingCollateral,
                remainingInterest,
                remainingPrincipalComponents,
                currentPriority
            });
        }

        const totalPayments = schedule.reduce((sum, s) => sum + s.totalPayment, 0);
        const totalInterestPaid = schedule.reduce((sum, s) => sum + s.interestPayment, 0);

        // Calculate effective annual rate for verification
        const totalLoanAmount = totalPrincipal - upfront;
        const effectiveRate = totalInterestPaid / totalLoanAmount;

        return {
            totalGfk,
            totalPrincipalComponents,
            gffFee,
            collateralFee,
            totalGfkFee,
            totalPrincipal,
            upfrontApplied: upfront,
            schedule,
            totalPayments,
            totalInterestPaid,
            totalWeeks: schedule.length,
            effectiveAnnualRate: (effectiveRate * 100).toFixed(2),
            upfrontAllocation: {
                appliedToGfk,
                appliedToCollateral,
                appliedToInterest,
                appliedToPrincipal
            },
            initialBreakdown: {
                gfkFee: totalGfkFee,
                collateral: collateralFee,
                interest: outstandingInt,
                principalComponents: totalPrincipalComponents
            }
        };
    }, [gfkComponents, principalComponents, upfrontAmount, outstandingInterest, interestRate]);

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
                            {/* GFK Components */}
                            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">1. GFK Components (Priority 1)</h3>
                                {gfkComponents.map((component, idx) => (
                                    <div key={component.id} className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            list="gfkOptions"
                                            value={component.type}
                                            onChange={(e) => updateGfkComponent(component.id, 'type', e.target.value)}
                                            className="flex-1 text-black px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="Select type"
                                        />
                                        <input
                                            type="number"
                                            value={component.amount}
                                            onChange={(e) => updateGfkComponent(component.id, 'amount', e.target.value)}
                                            className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="Amount"
                                        />
                                        {gfkComponents.length > 1 && (
                                            <button
                                                onClick={() => removeGfkComponent(component.id)}
                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <datalist id="gfkOptions">
                                    {gfkOptions.map(option => (
                                        <option key={option} value={option} />
                                    ))}
                                </datalist>
                                <button
                                    onClick={addGfkComponent}
                                    className="w-full mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add GFK Component
                                </button>
                                <div className="mt-4 p-3 bg-white rounded border border-purple-300">
                                    <div className="text-sm text-gray-600">Total GFK Amount:</div>
                                    <div className="text-xl font-bold text-purple-600">
                                        {calculations.totalGfk.toLocaleString()} KES
                                    </div>
                                </div>
                            </div>

                            {/* Principal Components */}
                            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">4. Principal Components (Priority 4)</h3>
                                {principalComponents.map((component, idx) => (
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
                                    <div className="text-sm text-gray-600">Total Principal Components:</div>
                                    <div className="text-xl font-bold text-blue-600">
                                        {calculations.totalPrincipalComponents.toLocaleString()} KES
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
                            </div>
                        </div>

                        {/* Comprehensive Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Comprehensive Loan Summary</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
                                    <div className="text-sm text-gray-600 mb-1">1. Total GFK Fee</div>
                                    <div className="text-lg font-bold text-purple-600">
                                        {calculations.totalGfkFee.toLocaleString()} KES
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        GFK: {calculations.totalGfk.toLocaleString()} + GFF: {calculations.gffFee.toLocaleString()}
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                                    <div className="text-sm text-gray-600 mb-1">2. Collateral Fee (10%)</div>
                                    <div className="text-lg font-bold text-green-600">
                                        {calculations.collateralFee.toLocaleString()} KES
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-200">
                                    <div className="text-sm text-gray-600 mb-1">3. Outstanding Interest</div>
                                    <div className="text-lg font-bold text-orange-600">
                                        {(parseFloat(outstandingInterest) || 0).toLocaleString()} KES
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                                    <div className="text-sm text-gray-600 mb-1">4. Principal Components</div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {calculations.totalPrincipalComponents.toLocaleString()} KES
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-indigo-300">
                                    <div className="text-sm text-gray-600 mb-1">Total Principal Balance</div>
                                    <div className="text-2xl font-bold text-indigo-600">
                                        {calculations.totalPrincipal.toLocaleString()} KES
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Sum of all 4 priority components
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-300">
                                    <div className="text-sm text-gray-600 mb-1">Remaining After Upfront</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {(calculations.totalPrincipal - calculations.upfrontApplied).toLocaleString()} KES
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
                                    <div className="text-center bg-white p-4 rounded-lg border border-purple-200">
                                        <div className="text-sm text-gray-600">1. Applied to GFK Fee</div>
                                        <div className="text-lg font-bold text-purple-600">
                                            {calculations.upfrontAllocation.appliedToGfk.toLocaleString()} KES
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Remaining: {(calculations.totalGfkFee - calculations.upfrontAllocation.appliedToGfk).toLocaleString()} KES
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
                                    <div className="text-center bg-white p-4 rounded-lg border border-orange-200">
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
                                            Remaining: {(calculations.totalPrincipalComponents - calculations.upfrontAllocation.appliedToPrincipal).toLocaleString()} KES
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
                                        <th className="px-3 py-3 text-right font-semibold">GFK Fee</th>
                                        <th className="px-3 py-3 text-right font-semibold">Collateral</th>
                                        <th className="px-3 py-3 text-right font-semibold">Out Int</th>
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
                              row.currentPriority === 1 ? 'bg-purple-100 text-purple-800' :
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
                                            <td className="px-3 py-2 text-right text-purple-600">
                                                {row.gfkFeePayment.toFixed(2)}
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
                                    <strong>Upfront Payment:</strong> (1) GFK Fee → (2) Collateral Fee → (3) Outstanding Interest → (4) Principal Components<br />
                                    <strong>Weekly Payments:</strong> (1) Current Interest → Then Principal in sequential order:<br />
                                    &nbsp;&nbsp;• <strong>Priority 1:</strong> GFK Fee (MUST be paid completely first)<br />
                                    &nbsp;&nbsp;• <strong>Priority 2:</strong> Collateral Fee (only after Priority 1 is $0)<br />
                                    &nbsp;&nbsp;• <strong>Priority 3:</strong> Outstanding Interest (only after Priorities 1 & 2 are $0)<br />
                                    &nbsp;&nbsp;• <strong>Priority 4:</strong> Principal Components (only after Priorities 1, 2 & 3 are $0)<br />
                                    <strong>Interest:</strong> Accrues weekly at {interestRate}% p.a. on total remaining principal balance<br />
                                    <strong>Effective Annual Rate:</strong> {calculations.effectiveAnnualRate}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
