import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRightLeft,
  FileSpreadsheet,
  Download,
  Filter
} from 'lucide-react';

// Mock data representing the system's expected ROP (Record of Payment) for the day
const mockSystemData = [
  { id: 'ROP-1001', date: '2026-06-22', rep: 'John Doe', route: 'North-East-01', customer: 'ABC Supermart', paymentMode: 'Cash', expected: 1500.00 },
  { id: 'ROP-1002', date: '2026-06-22', rep: 'John Doe', route: 'North-East-01', customer: 'City Grocery', paymentMode: 'Cheque', expected: 850.50 },
  { id: 'ROP-1003', date: '2026-06-22', rep: 'Jane Smith', route: 'South-West-02', customer: 'Quick Stop', paymentMode: 'Cash', expected: 200.00 },
  { id: 'ROP-1004', date: '2026-06-22', rep: 'Jane Smith', route: 'South-West-02', customer: 'Mega Mart', paymentMode: 'Transfer', expected: 3400.00 },
  { id: 'ROP-1005', date: '2026-06-22', rep: 'Alex Johnson', route: 'Central-01', customer: 'Corner Shop', paymentMode: 'Cash', expected: 120.00 },
  { id: 'ROP-1006', date: '2026-06-22', rep: 'Alex Johnson', route: 'Central-01', customer: 'Downtown Express', paymentMode: 'Cash', expected: 450.00 },
];

export default function ROPReconciliationScreen() {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-06-22');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize data with actual/variance fields
  useEffect(() => {
    const initializedData = mockSystemData.map(item => ({
      ...item,
      actual: '', // Blank initially for clerk to fill
      variance: null,
      remarks: ''
    }));
    setRecords(initializedData);
  }, []);

  const handleActualChange = (id, value) => {
    setRecords(prevRecords => 
      prevRecords.map(record => {
        if (record.id === id) {
          // Allow empty string or valid numbers
          const numericValue = value === '' ? '' : parseFloat(value);
          const variance = value === '' ? null : (numericValue - record.expected);
          
          return {
            ...record,
            actual: value,
            variance: variance
          };
        }
        return record;
      })
    );
  };

  const handleRemarksChange = (id, value) => {
    setRecords(prevRecords => 
      prevRecords.map(record => record.id === id ? { ...record, remarks: value } : record)
    );
  };

  const autoFillMatchAll = () => {
    if (window.confirm("Are you sure you want to auto-fill all empty 'Actual' amounts with the 'Expected' amounts?")) {
      setRecords(prevRecords => 
        prevRecords.map(record => ({
          ...record,
          actual: record.actual === '' ? record.expected.toString() : record.actual,
          variance: record.actual === '' ? 0 : record.variance
        }))
      );
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert("Daily ROP Reconciliation Data Saved Successfully. Proceeding to reporting...");
    }, 1000);
  };

  // Derived state for calculations and filtering
  const filteredRecords = useMemo(() => {
    return records.filter(record => 
      record.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.rep.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [records, searchQuery]);

  const totals = useMemo(() => {
    return filteredRecords.reduce((acc, record) => {
      acc.expected += record.expected || 0;
      acc.actual += (parseFloat(record.actual) || 0);
      return acc;
    }, { expected: 0, actual: 0 });
  }, [filteredRecords]);

  const totalVariance = totals.actual - totals.expected;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ArrowRightLeft className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">ROP Variance Reconciliation</h1>
            <p className="text-sm text-slate-500">DCC SFA Clerk Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-700">System Status: <span className="text-emerald-600">Online</span></span>
            <span className="text-xs text-slate-500">Last Sync: Today, 13:20 PM</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
        
        {}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Date Picker */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Search Box */}
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search Rep, Customer, or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>

          <div className="flex items-center gap-3">
             <button 
              onClick={autoFillMatchAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Auto-Fill Expected
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>
        </div>

        {}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-24">ROP ID</th>
                  <th className="px-4 py-3">Sales Rep / Route</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 w-28">Mode</th>
                  <th className="px-4 py-3 text-right w-36">Expected ROP ($)</th>
                  <th className="px-4 py-3 text-right w-44 bg-blue-50/50">Actual Received ($)</th>
                  <th className="px-4 py-3 text-right w-32">Variance ($)</th>
                  <th className="px-4 py-3 w-32 text-center">Status</th>
                  <th className="px-4 py-3 w-48">Remarks</th>
                </tr>
              </thead>
              
              {}
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 font-medium text-slate-900">{record.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{record.rep}</div>
                        <div className="text-xs text-slate-500">{record.route}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{record.customer}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium 
                          ${record.paymentMode === 'Cash' ? 'bg-amber-100 text-amber-800' : 
                            record.paymentMode === 'Cheque' ? 'bg-indigo-100 text-indigo-800' : 
                            'bg-purple-100 text-purple-800'}`}>
                          {record.paymentMode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {record.expected.toFixed(2)}
                      </td>
                      
                      {/* Interactive Clerk Input Cell */}
                      <td className="px-4 py-2 bg-blue-50/30">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={record.actual}
                            onChange={(e) => handleActualChange(record.id, e.target.value)}
                            className={`w-full pl-7 pr-3 py-1.5 border rounded-md text-right text-sm outline-none transition-all
                              ${record.variance !== null && record.variance !== 0 
                                ? 'border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-amber-50' 
                                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                            placeholder="0.00"
                          />
                        </div>
                      </td>

                      {/* Calculated Variance */}
                      <td className={`px-4 py-3 text-right font-bold
                        ${record.variance === null ? 'text-slate-400' : 
                          record.variance === 0 ? 'text-emerald-600' : 
                          record.variance < 0 ? 'text-rose-600' : 'text-blue-600'}`}
                      >
                        {record.variance === null ? '-' : 
                          record.variance > 0 ? `+${record.variance.toFixed(2)}` : 
                          record.variance.toFixed(2)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {record.variance === null ? (
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Pending</span>
                          ) : record.variance === 0 ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Matched
                            </span>
                          ) : record.variance < 0 ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-100 px-2 py-1 rounded-full">
                              <AlertCircle className="w-3 h-3" /> Short
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                              <AlertCircle className="w-3 h-3" /> Excess
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Remarks Input */}
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={record.remarks}
                          onChange={(e) => handleRemarksChange(record.id, e.target.value)}
                          placeholder="Add note..."
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-400 bg-transparent group-hover:bg-white transition-colors"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center text-slate-500">
                      No records found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {}
          <div className="bg-slate-800 text-white p-4 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total Expected</div>
                <div className="text-xl font-bold">${totals.expected.toFixed(2)}</div>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div>
                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total Actual Received</div>
                <div className="text-xl font-bold text-blue-400">${totals.actual.toFixed(2)}</div>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div>
                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Net Variance</div>
                <div className={`text-xl font-bold ${
                  totalVariance === 0 ? 'text-emerald-400' : 
                  totalVariance < 0 ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {totalVariance > 0 ? '+' : ''}{totalVariance.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving & Reconciling...' : 'Confirm & Save Reconciliation'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}