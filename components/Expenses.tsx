
import React, { useState, useMemo } from 'react';
import type { Participant, Expense, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import Card from './common/Card';
import Button from './common/Button';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface ExpensesProps {
  participants: Participant[];
  expenses: Expense[];
  currencySymbol: string;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const Expenses: React.FC<ExpensesProps> = ({ participants, expenses, currencySymbol, addExpense, removeExpense }) => {
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0]);
  const [paidBy, setPaidBy] = useState(participants[0]?.id || '');
  const [sharedBy, setSharedBy] = useState<string[]>(participants.map(p => p.id));

  const simplifiedDebts = useMemo(() => {
    const participantMap = Object.fromEntries(participants.map(p => [p.id, p]));
    
    const balances: { [owerId: string]: { [payerId: string]: number } } = {};

    for (const expense of expenses) {
        if (expense.sharedBy.length === 0) continue;
        const share = expense.amount / expense.sharedBy.length;
        for (const owerId of expense.sharedBy) {
            if (owerId !== expense.paidBy) {
                if (!balances[owerId]) balances[owerId] = {};
                balances[owerId][expense.paidBy] = (balances[owerId][expense.paidBy] || 0) + share;
            }
        }
    }

    const finalDebts: { ower: string, owerEmoji: string, payer: string, payerEmoji: string, amount: number }[] = [];
    const pIds = participants.map(p => p.id);

    for (let i = 0; i < pIds.length; i++) {
        for (let j = i + 1; j < pIds.length; j++) {
            const p1_id = pIds[i];
            const p2_id = pIds[j];

            const p1_owes_p2 = balances[p1_id]?.[p2_id] || 0;
            const p2_owes_p1 = balances[p2_id]?.[p1_id] || 0;

            const netDebt = p1_owes_p2 - p2_owes_p1;

            if (Math.abs(netDebt) > 0.01) {
                if (netDebt > 0) {
                    finalDebts.push({ ower: participantMap[p1_id].name, owerEmoji: participantMap[p1_id].emoji, payer: participantMap[p2_id].name, payerEmoji: participantMap[p2_id].emoji, amount: netDebt });
                } else {
                    finalDebts.push({ ower: participantMap[p2_id].name, owerEmoji: participantMap[p2_id].emoji, payer: participantMap[p1_id].name, payerEmoji: participantMap[p1_id].emoji, amount: -netDebt });
                }
            }
        }
    }
    
    return finalDebts;
  }, [participants, expenses]);

  const participantSummaries = useMemo(() => {
    return participants.map(participant => {
      const expensesPaid = expenses.filter(e => e.paidBy === participant.id);
      const totalPaid = expensesPaid.reduce((acc, curr) => acc + curr.amount, 0);
      
      const categoryTotals = expensesPaid.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<ExpenseCategory, number>);

      return {
        ...participant,
        totalPaid,
        categoryTotals,
      };
    });
  }, [participants, expenses]);

  const handleAddExpense = () => {
    if (!description || !date || !amount || amount <= 0 || !paidBy || sharedBy.length === 0) {
      alert('Please fill all fields correctly.');
      return;
    }
    addExpense({ description, date, amount, category, paidBy, sharedBy });
    setShowForm(false);
    setDescription('');
    setDate(getTodayString());
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setPaidBy(participants[0]?.id || '');
    setSharedBy(participants.map(p => p.id));
  };
  
  const handleShareChange = (participantId: string) => {
    setSharedBy(prev => 
      prev.includes(participantId) 
        ? prev.filter(id => id !== participantId) 
        : [...prev, participantId]
    );
  };
  
  const getCategoryColor = (category: ExpenseCategory) => {
    switch (category) {
      case 'Eat and Drink': return 'bg-yellow-200 text-yellow-800';
      case 'Transportation': return 'bg-blue-200 text-blue-800';
      case 'Shopping': return 'bg-purple-200 text-purple-800';
      case 'Accommodation': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Expenses</h2>
        <Button onClick={() => setShowForm(!showForm)} variant="secondary">
          <PlusIcon className="h-5 w-5 inline-block mr-1" />
          {showForm ? 'Cancel' : 'Add Expense'}
        </Button>
      </div>

      {showForm && (
        <div className="space-y-4 p-4 mb-4 bg-slate-50 rounded-lg">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="exp-desc" className="block text-sm font-medium text-gray-700">Description</label>
              <input id="exp-desc" type="text" placeholder="e.g., Museum tickets" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full p-2 border rounded-md border-slate-300 focus:ring-blue-400" required />
            </div>
            <div>
              <label htmlFor="exp-date" className="block text-sm font-medium text-gray-700">Date</label>
              <input id="exp-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md border-slate-300 focus:ring-blue-400" required />
            </div>
            <div>
              <label htmlFor="exp-amount" className="block text-sm font-medium text-gray-700">Amount ({currencySymbol})</label>
              <input id="exp-amount" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value ? parseFloat(e.target.value) : '')} className="mt-1 w-full p-2 border rounded-md border-slate-300 focus:ring-blue-400" required />
            </div>
          </div>
          <div>
            <label htmlFor="exp-cat" className="block text-sm font-medium text-gray-700">Category</label>
            <select id="exp-cat" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="mt-1 w-full p-2 border rounded-md border-slate-300 focus:ring-blue-400">
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Paid by:</label>
            <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="mt-1 w-full p-2 border rounded-md border-slate-300 focus:ring-blue-400">
              {participants.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Shared by:</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {participants.map(p => (
                <label key={p.id} className="flex items-center space-x-3 p-2 bg-white rounded-md cursor-pointer border border-slate-200">
                  <input type="checkbox" checked={sharedBy.includes(p.id)} onChange={() => handleShareChange(p.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span>{p.emoji} {p.name}</span>
                </label>
              ))}
            </div>
          </div>
          <Button onClick={handleAddExpense} className="w-full">Add</Button>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-slate-700">Debt Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {simplifiedDebts.length > 0 ? simplifiedDebts.map((debt, index) => (
                <div key={`${debt.ower}-${debt.payer}-${index}`} className="p-3 bg-slate-100 rounded-lg flex items-center justify-center text-center flex-wrap gap-x-2">
                    <span className="font-semibold text-slate-800">{debt.owerEmoji} {debt.ower}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    <span className="font-semibold text-green-700">{debt.payerEmoji} {debt.payer}</span>
                    <span className="font-bold text-gray-800">{currencySymbol}{debt.amount.toFixed(2)}</span>
                </div>
            )) : (
                <div className="md:col-span-2 text-center p-3 bg-slate-100 rounded-lg">
                    <p className="text-gray-500 italic">Everyone is settled up! 🎉</p>
                </div>
            )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">Participant Summaries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {participantSummaries.map(summary => (
            <div key={summary.id} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{summary.emoji}</span>
                <h4 className="font-semibold text-lg text-gray-800">{summary.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Total Paid: <span className="font-bold text-lg text-slate-800">{currencySymbol}{summary.totalPaid.toFixed(2)}</span>
              </p>
              
              {summary.totalPaid > 0 ? (
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Category Breakdown:</h5>
                  <div className="space-y-2">
                    {Object.entries(summary.categoryTotals).map(([category, amount]) => {
                       const percentage = (amount / summary.totalPaid) * 100;
                       const categoryTyped = category as ExpenseCategory;
                       return (
                         <div key={category}>
                           <div className="flex justify-between text-xs mb-1">
                             <span className={`font-medium ${getCategoryColor(categoryTyped).split(' ')[1]}`}>{category}</span>
                             <span className="font-semibold text-gray-700">{currencySymbol}{amount.toFixed(2)}</span>
                           </div>
                           <div className="w-full bg-slate-200 rounded-full h-2.5">
                             <div 
                               className={`${getCategoryColor(categoryTyped).split(' ')[0]} h-2.5 rounded-full`}
                               style={{ width: `${percentage}%` }}
                               title={`${category}: ${percentage.toFixed(0)}%`}
                             ></div>
                           </div>
                         </div>
                       )
                    })}
                  </div>
                </div>
              ) : <p className="text-xs text-gray-400 italic">No expenses paid by {summary.name} yet.</p>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">History</h3>
        <ul className="space-y-2">
            {expenses.length > 0 ? [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => {
                const payer = participants.find(p => p.id === expense.paidBy);
                const formattedDate = new Date(expense.date + 'T00:00:00').toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                return (
                    <li key={expense.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800">{expense.description}</p>
                            <p className="text-sm text-gray-500">
                              {formattedDate} &bull; Paid {currencySymbol}{expense.amount.toFixed(2)} by {payer?.name || 'Unknown'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(expense.category)}`}>
                                {expense.category}
                            </span>
                            <button onClick={() => removeExpense(expense.id)} className="text-gray-400 hover:text-red-500 p-1">
                                <TrashIcon className="h-4 w-4"/>
                            </button>
                        </div>
                    </li>
                );
            }) : <p className="text-gray-500 italic">No expenses added yet.</p>}
        </ul>
      </div>

    </Card>
  );
};

export default Expenses;