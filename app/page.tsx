'use client';

import { useState, useEffect, useMemo } from 'react';
// Ensure deleteTransaction is exported from your actions file
import { addTransaction, getTransactions, deleteTransaction } from './action'; 
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Trash2, Calendar, PieChart as PieIcon, BarChart3, LayoutDashboard } from 'lucide-react';
import { SubmitButton } from '@/components/SubmitButton';

// --- 1. CONFIGURATION ---
const CATEGORIES = [
  'Food Essential', 'Food Ultimate', 'Travel', 'General', 'Allowance', 'Bills', 'Shopping', 'Medicine', 'Stationary'
];

// Modern Neon Palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#b92a2aff', '#8b5cf6', '#6366f1', '#06b6d4', '#eb64faff', '#abf522ff'];

type Transaction = {
  id: string;
  amount: number;
  category: string;
  mode: string;
  type: string;
  createdAt: Date;
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('online'); // 'online' | 'cash' | 'overview'
  const [txType, setTxType] = useState('expense');
  const today = new Date().toISOString().split('T')[0];

  // Load Initial Data
  useEffect(() => {
    getTransactions().then(setTransactions);
  }, []);

  // --- DATA PROCESSING ---
  
  // 1. Data for specific wallets (Online/Cash)
  const currentData = useMemo(() => {
    return transactions.filter((t) => t.mode === activeTab);
  }, [transactions, activeTab]);

  // 2. Data for the Overview Dashboard
  const overviewData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Split: Online vs Cash
    const cashTotal = expenses.filter(t => t.mode === 'cash').reduce((sum, t) => sum + t.amount, 0);
    const onlineTotal = expenses.filter(t => t.mode === 'online').reduce((sum, t) => sum + t.amount, 0);

    // Daily Bar Chart Data
    const dailyMap = expenses.reduce((acc, t) => {
      // Create a sortable date key YYYY-MM-DD
      const dateKey = new Date(t.createdAt).toISOString().split('T')[0];
      acc[dateKey] = (acc[dateKey] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Sort by date and format for display
    const dailyData = Object.keys(dailyMap)
      .sort()
      .map(date => ({
        name: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        value: dailyMap[date]
      }));

    return {
      splitData: [
        { name: 'Online Spent', value: onlineTotal, color: '#3b82f6' },
        { name: 'Cash Spent', value: cashTotal, color: '#10b981' }
      ],
      dailyData
    };
  }, [transactions]);

  // 3. Category & Budget Data (for Wallet views)
  const { categoryData, budgetData, totalIncome, totalExpense } = useMemo(() => {
    const expenses = currentData.filter(t => t.type === 'expense');
    const income = currentData.filter(t => t.type === 'income');

    // Chart 1: Category Breakdown
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const catData = Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key]
    }));

    // Chart 2: Budget Usage
    const totalInc = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExp = expenses.reduce((sum, t) => sum + t.amount, 0);
    const remaining = totalInc - totalExp;

    const budData = [
      { name: 'Used', value: totalExp },
      { name: 'Remaining', value: remaining > 0 ? remaining : 0 }
    ];

    return { categoryData: catData, budgetData: budData, totalIncome: totalInc, totalExpense: totalExp };
  }, [currentData]);

  // Calculate Balance based on view
  const displayBalance = useMemo(() => {
    if (activeTab === 'overview') {
      // Total Net Worth
      return transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
    }
    // Wallet specific balance
    return currentData.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
  }, [transactions, currentData, activeTab]);

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="text-gray-200 font-bold text-sm">{label || payload[0].name}</p>
          <p className="text-white font-mono font-bold">₹{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Dynamic Theme Colors
  const getTheme = () => {
    switch(activeTab) {
      case 'online': return { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-100' };
      case 'cash': return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-100' };
      default: return { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-100' };
    }
  };
  const theme = getTheme();

  return (
    <main className="min-h-screen bg-[#0B0C15] text-white p-4 pb-24 md:p-8 flex justify-center selection:bg-indigo-500/30">
      
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600/20 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-600/10 rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl space-y-4 md:space-y-6">
        
        {/* --- HEADER CARD --- */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Balance Section */}
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Wallet className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium uppercase tracking-widest">{activeTab} Balance</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight break-all">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  ₹{displayBalance.toLocaleString()}
                </span>
              </h1>
            </div>

            {/* Toggle Tabs */}
            <div className="w-full md:w-auto flex bg-black/30 p-1.5 rounded-xl border border-white/5 overflow-x-auto">
              {['overview', 'online', 'cash'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 capitalize whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- OVERVIEW DASHBOARD --- */}
        {activeTab === 'overview' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* 1. Split Chart (Pie) */}
             <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500 opacity-50" />
                <h3 className="font-bold text-slate-300 flex items-center gap-2 mb-4">
                  <LayoutDashboard className="w-4 h-4 text-violet-400" /> Mode Distribution
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={overviewData.splitData} 
                        cx="50%" cy="50%" 
                        innerRadius={60} outerRadius={80} 
                        paddingAngle={4} 
                        dataKey="value" stroke="none"
                      >
                        {overviewData.splitData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* 2. Daily Trends (Bar) */}
             <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50" />
                <h3 className="font-bold text-slate-300 flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-blue-400" /> Daily Spending
                </h3>
                <div className="h-64 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10}} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10}} 
                        tickFormatter={(val) => `₹${val}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
           </div>
        ) : (
          /* --- WALLET DASHBOARD (Online/Cash) --- */
          <>
            {transactions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Spending Chart */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50" />
                   <h3 className="font-bold text-slate-300 flex items-center gap-2 mb-4">
                     <PieIcon className="w-4 h-4 text-blue-400" /> Spending
                   </h3>
                   <div className="h-64 w-full -ml-2">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                           {categoryData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip content={<CustomTooltip />} />
                         <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', opacity: 0.7, paddingTop: '10px' }} />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                </div>

                {/* Budget Chart */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-green-500 opacity-50" />
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-300 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" /> Budget
                      </h3>
                      <span className="text-[10px] md:text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">In: ₹{totalIncome}</span>
                   </div>
                   <div className="h-64 w-full relative">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie data={budgetData} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value" stroke="none">
                           <Cell fill="#ef4444" /> 
                           <Cell fill="#10b981" />
                         </Pie>
                         <Tooltip content={<CustomTooltip />} />
                       </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 pointer-events-none">
                        <span className="text-3xl font-black text-white">{Math.round((totalExpense/totalIncome)*100) || 0}%</span>
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Used</span>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {/* --- INPUT FORM --- */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-4 md:p-6 shadow-xl">
              <div className="flex gap-3 mb-6">
                  <button 
                    onClick={() => setTxType('expense')} 
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all border ${
                      txType === 'expense' 
                      ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                      : 'bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-800'
                    }`}>
                    <TrendingDown className="w-4 h-4" /> Expense
                  </button>
                  <button 
                    onClick={() => setTxType('income')} 
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all border ${
                      txType === 'income' 
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                      : 'bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-800'
                    }`}>
                    <TrendingUp className="w-4 h-4" /> Income
                  </button>
              </div>

              <form 
                action={async (formData) => {
                  await addTransaction(formData);
                  const newData = await getTransactions();
                  setTransactions(newData);
                }} 
                className="flex flex-col md:flex-row gap-4 items-stretch"
              >
                <input type="hidden" name="mode" value={activeTab} />
                <input type="hidden" name="type" value={txType} />

                <div className="relative md:w-40">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input 
                    name="date" 
                    type="date" 
                    defaultValue={today} 
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required 
                  />
                </div>

                <div className="relative md:w-40">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                  <input name="amount" type="number" placeholder="0" className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-8 pr-4 font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" required />
                </div>
                
                <div className="relative flex-1">
                   <select name="category" defaultValue="" className="w-full h-full min-h-[48px] bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors appearance-none" required>
                     <option value="" disabled>Select Category</option>
                     {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-slate-900">{cat}</option>)}
                   </select>
                </div>
                
                <SubmitButton colorClass={theme.bg} />
              </form>
            </div>

            {/* --- TRANSACTION LIST --- */}
            <div className="space-y-3 pb-8">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2">Recent Transactions</h3>
               {currentData.map((t) => (
                 <div key={t.id} className="group flex justify-between items-center bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-800/40 p-3 md:p-4 rounded-2xl transition-all duration-300">
                   <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                     <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                     </div>
                     <div className="min-w-0">
                       <p className="font-bold text-slate-200 truncate">{t.category}</p>
                       <p className="text-xs text-slate-500 font-mono mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 md:gap-4 shrink-0">
                     <span className={`font-mono font-bold text-base md:text-lg ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {t.type === 'income' ? '+' : '-'} ₹{t.amount}
                     </span>
                     
                     <button 
                        onClick={async () => {
                          if(confirm('Delete?')) {
                            await deleteTransaction(t.id);
                            getTransactions().then(setTransactions);
                          }
                        }} 
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               ))}
               {currentData.length === 0 && (
                 <div className="text-center py-12 text-slate-600">
                   <p>No transactions found for this wallet.</p>
                 </div>
               )}
            </div>
          </>
        )}

      </div>
    </main>
  );
}