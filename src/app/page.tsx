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
    // 'GFF Subscription',
    'Wellness Warrior',
    // 'Hospital Cash',
    // 'Insurance'
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
    doc.text(`Total Principal Amount: ${calculations.totalPrincipal.toLocaleString()} KES`, 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 15;

    // Loan Summary Section
    doc.setFontSize(16);
    doc.setTextColor(5, 150, 105);
    doc.text('Loan Summary', 20, yPos);
    yPos += 8;

    const summaryData = [
      ['GFF Fee (5%)', `${calculations.gffFee.toLocaleString()} KES`],
      ['Total GFK Fee (GFK + GFF)', `${calculations.totalGfkFee.toLocaleString()} KES`],
      ['Collateral Fee (10%)', `${calculations.collateralFee.toLocaleString()} KES`],
      ['Upfront Amount Applied', `${calculations.upfrontApplied.toLocaleString()} KES`],
      ['Outstanding Interest', `${(parseFloat(outstandingInterest) || 0).toLocaleString()} KES`],
      ['Interest Rate', `${interestRate}% per annum`],
      ['Weekly Payment', '2,200 KES'],
      ['Total Weeks', `${calculations.totalWeeks}`],
      ['Total Payments', `${calculations.totalPayments.toLocaleString()} KES`],
      ['Total Interest Paid', `${calculations.totalInterestPaid.toLocaleString()} KES`]
    ];

    autoTable(doc, {
      startY: yPos,
      body: summaryData,
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
    doc.text('Payment Schedule', 20, yPos);
    yPos += 8;

    const scheduleData = calculations.schedule.map(row => [
      row.week,
      row.totalPayment.toFixed(2),
      row.gfkFeePayment.toFixed(2),
      row.collateralPayment.toFixed(2),
      row.interestPayment.toFixed(2),
      row.principalPayment.toFixed(2),
      row.weeklyInterestAccrued.toFixed(2),
      row.remainingGfkFee.toFixed(2),
      row.remainingCollateral.toFixed(2),
      row.remainingInterest.toFixed(2),
      row.remainingPrincipal.toFixed(2)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [[
        'Week',
        'Payment',
        'GFK Fee',
        'Collateral',
        'Interest',
        'Principal',
        'Int.Acc',
        'Bal:GFK',
        'Bal:Coll',
        'Bal:Int',
        'Bal:Prin'
      ]],
      body: scheduleData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'right', cellWidth: 18 },
        2: { halign: 'right', cellWidth: 18 },
        3: { halign: 'right', cellWidth: 18 },
        4: { halign: 'right', cellWidth: 18 },
        5: { halign: 'right', cellWidth: 18 },
        6: { halign: 'right', cellWidth: 16 },
        7: { halign: 'right', cellWidth: 18 },
        8: { halign: 'right', cellWidth: 18 },
        9: { halign: 'right', cellWidth: 18 },
        10: { halign: 'right', cellWidth: 18 }
      },
      margin: { left: 5, right: 5 }
    });

    // Footer note
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
        'Waterfall Payment Order: (1) GFK Fee (GFK components + 5% GFF fee), (2) Collateral (10% fee),',
        105,
        finalY,
        { align: 'center' }
    );
    doc.text(
        `(3) Outstanding Interest (accrues weekly at ${interestRate}% p.a.), (4) Principal. Upfront amount applied in same order.`,
        105,
        finalY + 5,
        { align: 'center' }
    );

    // Save PDF
    doc.save(`GFK_Loan_Calculation_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const calculations = useMemo(() => {
    // Calculate totals
    const totalGfk = gfkComponents.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const totalPrincipal = principalComponents.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const upfront = parseFloat(upfrontAmount) || 0;
    const outstandingInt = parseFloat(outstandingInterest) || 0;
    const rate = parseFloat(interestRate) || 20;

    // Calculate fees
    const gffFee = (totalGfk + totalPrincipal) * 0.05;
    const collateralFee = (totalGfk + totalPrincipal) * 0.10;

    const weeklyPayment = 2200;
    const weeklyInterestRate = rate / 100 / 52; // Convert annual to weekly

    // Apply upfront to waterfall (Priority: GFK -> Collateral -> Interest -> Principal)
    let remainingUpfront = upfront;

    // 1. GFK Fee (includes GFF fee + all GFK components)
    const totalGfkFee = totalGfk + gffFee;
    let remainingGfkFee = Math.max(0, totalGfkFee - remainingUpfront);
    remainingUpfront = Math.max(0, remainingUpfront - totalGfkFee);

    // 2. Collateral Fee
    let remainingCollateral = Math.max(0, collateralFee - remainingUpfront);
    remainingUpfront = Math.max(0, remainingUpfront - collateralFee);

    // 3. Outstanding Interest
    let remainingInterest = Math.max(0, outstandingInt - remainingUpfront);
    remainingUpfront = Math.max(0, remainingUpfront - outstandingInt);

    // 4. Principal
    let remainingPrincipal = Math.max(0, totalPrincipal - remainingUpfront);

    const schedule = [];
    let weekNum = 1;

    // Payment weeks
    while (remainingGfkFee > 0.01 || remainingCollateral > 0.01 || remainingInterest > 0.01 || remainingPrincipal > 0.01) {
      let payment = weeklyPayment;
      let gfkFeePayment = 0;
      let collateralPayment = 0;
      let interestPayment = 0;
      let principalPayment = 0;

      // Add weekly interest to outstanding balance
      const weeklyInterestAccrued = remainingPrincipal * weeklyInterestRate;
      remainingInterest += weeklyInterestAccrued;

      // Waterfall logic
      // 1. GFK Fee (GFK components + GFF fee)
      if (remainingGfkFee > 0) {
        gfkFeePayment = Math.min(payment, remainingGfkFee);
        remainingGfkFee -= gfkFeePayment;
        payment -= gfkFeePayment;
      }

      // 2. Collateral Fee
      if (payment > 0 && remainingCollateral > 0) {
        collateralPayment = Math.min(payment, remainingCollateral);
        remainingCollateral -= collateralPayment;
        payment -= collateralPayment;
      }

      // 3. Outstanding Interest
      if (payment > 0 && remainingInterest > 0) {
        interestPayment = Math.min(payment, remainingInterest);
        remainingInterest -= interestPayment;
        payment -= interestPayment;
      }

      // 4. Principal Balance
      if (payment > 0 && remainingPrincipal > 0) {
        principalPayment = Math.min(payment, remainingPrincipal);
        remainingPrincipal -= principalPayment;
        payment -= principalPayment;
      }

      const totalPaid = gfkFeePayment + collateralPayment + interestPayment + principalPayment;

      schedule.push({
        week: weekNum++,
        totalPayment: totalPaid,
        gfkFeePayment,
        collateralPayment,
        interestPayment,
        principalPayment,
        weeklyInterestAccrued,
        remainingGfkFee,
        remainingCollateral,
        remainingInterest,
        remainingPrincipal
      });

      // Safety break
      if (weekNum > 500) break;
    }

    return {
      totalGfk,
      totalPrincipal,
      gffFee,
      collateralFee,
      totalGfkFee,
      upfrontApplied: upfront,
      schedule,
      totalPayments: schedule.reduce((sum, s) => sum + s.totalPayment, 0),
      totalInterestPaid: schedule.reduce((sum, s) => sum + s.interestPayment, 0),
      totalWeeks: schedule.length
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
                    <p className="text-blue-100">Calculate your loan repayment schedule with waterfall payment model</p>
                  </div>
                </div>
                <button
                    onClick={generatePDF}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Input Form */}
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* GFK Components */}
                <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">GFK Components</h3>
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
                    Add Component
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
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Principal Components</h3>
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
                    Add Component
                  </button>
                  <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                    <div className="text-sm text-gray-600">Total Principal Amount:</div>
                    <div className="text-xl font-bold text-blue-600">
                      {calculations.totalPrincipal.toLocaleString()} KES
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
                    Outstanding Interest (KES)
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

              {/* Summary Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
                  <div className="text-sm text-gray-600 mb-1">Total GFK Fee</div>
                  <div className="text-xl font-bold text-purple-600">
                    {calculations.totalGfkFee.toLocaleString()} KES
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    (incl. 5% GFF: {calculations.gffFee.toLocaleString()})
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                  <div className="text-sm text-gray-600 mb-1">Collateral Fee (10%)</div>
                  <div className="text-xl font-bold text-green-600">
                    {calculations.collateralFee.toLocaleString()} KES
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-600">
                  <div className="text-sm text-gray-600 mb-1">Upfront Applied</div>
                  <div className="text-xl font-bold text-orange-600">
                    {calculations.upfrontApplied.toLocaleString()} KES
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-600">
                  <div className="text-sm text-gray-600 mb-1">Total Payments</div>
                  <div className="text-xl font-bold text-indigo-600">
                    {calculations.totalPayments.toLocaleString()} KES
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600">
                  <div className="text-sm text-gray-600 mb-1">Total Interest</div>
                  <div className="text-xl font-bold text-red-600">
                    {calculations.totalInterestPaid.toLocaleString()} KES
                  </div>
                </div>
              </div>

              {/* Installment Schedule */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Payment Schedule ({calculations.totalWeeks} weeks)
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                    <tr className="bg-gray-200 text-gray-700">
                      <th className="px-3 py-3 text-left font-semibold">Week</th>
                      <th className="px-3 py-3 text-right font-semibold">Total Payment</th>
                      <th className="px-3 py-3 text-right font-semibold">GFK Fee</th>
                      <th className="px-3 py-3 text-right font-semibold">Collateral</th>
                      <th className="px-3 py-3 text-right font-semibold">Interest</th>
                      <th className="px-3 py-3 text-right font-semibold">Principal</th>
                      <th className="px-3 py-3 text-right font-semibold">Int. Accrued</th>
                      <th className="px-3 py-3 text-right font-semibold">Bal: GFK</th>
                      <th className="px-3 py-3 text-right font-semibold">Bal: Collateral</th>
                      <th className="px-3 py-3 text-right font-semibold">Bal: Interest</th>
                      <th className="px-3 py-3 text-right font-semibold">Bal: Principal</th>
                    </tr>
                    </thead>
                    <tbody>
                    {calculations.schedule.map((row, idx) => (
                        <tr
                            key={idx}
                            className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        >
                          <td className="px-3 py-2 font-medium text-black">{row.week}</td>
                          <td className="px-3 py-2 text-right text-black font-semibold">
                            {row.totalPayment.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-purple-600">
                            {row.gfkFeePayment.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-green-600">
                            {row.collateralPayment.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-orange-600">
                            {row.interestPayment.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-blue-600">
                            {row.principalPayment.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-red-600 text-xs">
                            +{row.weeklyInterestAccrued.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {row.remainingGfkFee.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {row.remainingCollateral.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {row.remainingInterest.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
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
                    <strong>Waterfall Payment Order:</strong> Each 2,200 KES payment is allocated in priority:
                    (1) GFK Fee (GFK components + 5% GFF fee), (2) Collateral (10% fee), (3) Outstanding Interest (accrues weekly at {interestRate}% p.a.), (4) Principal.
                    Upfront amount is applied to these categories in the same order before payments begin.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
