import React, { useState, useEffect } from 'react';
import { AlertCircle, DollarSign, Send, Plus, Trash2, Users, CreditCard, Calendar, User } from 'lucide-react';
import './App.css';

// Main App Component
function App() {
  const [expenses, setExpenses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpensePayer, setNewExpensePayer] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [activeTab, setActiveTab] = useState('expenses');
  const [showReminders, setShowReminders] = useState(false);

  // Calculate balances whenever expenses or participants change
  const [balances, setBalances] = useState({});

  useEffect(() => {
    calculateBalances();
  }, [expenses, participants]);

  // Function to calculate who owes what to whom
  const calculateBalances = () => {
    if (participants.length === 0 || expenses.length === 0) {
      setBalances({});
      return;
    }

    let tempBalances = {};
    participants.forEach(participant => {
      tempBalances[participant.id] = { name: participant.name, owes: {}, paid: 0, totalOwed: 0 };
    });

    // Calculate what each person paid
    expenses.forEach(expense => {
      const payer = expense.payer;
      const perPersonAmount = expense.amount / participants.length;
      
      if (tempBalances[payer]) {
        tempBalances[payer].paid += expense.amount;
      }
      
      // Calculate what each person owes to the payer
      participants.forEach(participant => {
        if (participant.id !== payer) {
          if (!tempBalances[participant.id].owes[payer]) {
            tempBalances[participant.id].owes[payer] = 0;
          }
          tempBalances[participant.id].owes[payer] += perPersonAmount;
          tempBalances[participant.id].totalOwed += perPersonAmount;
        }
      });
    });

    // Round all values to 2 decimal places
    Object.keys(tempBalances).forEach(personId => {
      tempBalances[personId].paid = Number(tempBalances[personId].paid.toFixed(2));
      tempBalances[personId].totalOwed = Number(tempBalances[personId].totalOwed.toFixed(2));
      
      Object.keys(tempBalances[personId].owes).forEach(owedTo => {
        tempBalances[personId].owes[owedTo] = Number(tempBalances[personId].owes[owedTo].toFixed(2));
      });
    });

    setBalances(tempBalances);
  };

  // Add a new expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount || !newExpensePayer) {
      alert("Please fill in all expense fields");
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      name: newExpenseName,
      amount: parseFloat(newExpenseAmount),
      payer: newExpensePayer,
      date: new Date().toLocaleDateString()
    };

    setExpenses([...expenses, newExpense]);
    setNewExpenseName('');
    setNewExpenseAmount('');
    setNewExpensePayer('');
  };

  // Delete an expense
  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Add a new participant
  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!newParticipantName) {
      alert("Please enter a participant name");
      return;
    }

    const newParticipant = {
      id: Date.now().toString(),
      name: newParticipantName,
      email: newParticipantEmail
    };

    setParticipants([...participants, newParticipant]);
    setNewParticipantName('');
    setNewParticipantEmail('');
  };

  // Delete a participant
  const handleDeleteParticipant = (id) => {
    // Check if participant is associated with any expenses
    const hasExpenses = expenses.some(expense => expense.payer === id);
    if (hasExpenses) {
      alert("Cannot remove participant who has paid for expenses. Delete their expenses first.");
      return;
    }
    
    setParticipants(participants.filter(participant => participant.id !== id));
  };

  // Send a payment reminder
  const sendReminder = (fromId, toId, amount) => {
    const from = participants.find(p => p.id === fromId);
    const to = participants.find(p => p.id === toId);
    
    alert(`Payment reminder sent to ${from.name} to pay ${to.name} ₹${amount}`);
    // In a real app, this would integrate with an email API
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Travel Expense Splitter</h1>
        <div className="flex justify-center mb-6">
          <TabButton 
            active={activeTab === 'expenses'} 
            onClick={() => setActiveTab('expenses')}
            icon={<CreditCard size={16} />}
            label="Expenses"
          />
          <TabButton 
            active={activeTab === 'participants'} 
            onClick={() => setActiveTab('participants')}
            icon={<Users size={16} />}
            label="Participants"
          />
          <TabButton 
            active={activeTab === 'summary'} 
            onClick={() => setActiveTab('summary')}
            icon={<DollarSign size={16} />}
            label="Summary"
          />
        </div>
      </header>

      <main>
        {activeTab === 'participants' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Add Participants</h2>
            <form onSubmit={handleAddParticipant} className="mb-6 bg-white p-4 rounded-lg shadow">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      className="pl-8 p-2 w-full border rounded"
                      placeholder="Enter name"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                    className="p-2 w-full border rounded"
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} className="mr-1" /> Add Participant
              </button>
            </form>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-gray-500">
                        No participants added yet. Add some participants to get started.
                      </td>
                    </tr>
                  ) : (
                    participants.map(participant => (
                      <tr key={participant.id} className="border-t">
                        <td className="py-2 px-4">{participant.name}</td>
                        <td className="py-2 px-4">{participant.email || '-'}</td>
                        <td className="py-2 px-4 text-right">
                          <button 
                            onClick={() => handleDeleteParticipant(participant.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'expenses' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
            {participants.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle size={20} className="text-yellow-500 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Please add participants first before adding expenses.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddExpense} className="mb-6 bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Expense Name</label>
                    <input
                      type="text"
                      value={newExpenseName}
                      onChange={(e) => setNewExpenseName(e.target.value)}
                      className="p-2 w-full border rounded"
                      placeholder="e.g., Dinner, Taxi, Hotel"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                        className="pl-8 p-2 w-full border rounded"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Paid By</label>
                    <select
                      value={newExpensePayer}
                      onChange={(e) => setNewExpensePayer(e.target.value)}
                      className="p-2 w-full border rounded"
                    >
                      <option value="">Select person</option>
                      {participants.map(participant => (
                        <option key={participant.id} value={participant.id}>
                          {participant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                >
                  <Plus size={16} className="mr-1" /> Add Expense
                </button>
              </form>
            )}

            <h2 className="text-xl font-semibold mb-4">Expense List</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Description</th>
                    <th className="py-2 px-4 text-left">Paid By</th>
                    <th className="py-2 px-4 text-right">Amount</th>
                    <th className="py-2 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-gray-500">
                        No expenses added yet. Add some expenses to calculate splits.
                      </td>
                    </tr>
                  ) : (
                    expenses.map(expense => {
                      const payer = participants.find(p => p.id === expense.payer);
                      return (
                        <tr key={expense.id} className="border-t">
                          <td className="py-2 px-4">{expense.date}</td>
                          <td className="py-2 px-4">{expense.name}</td>
                          <td className="py-2 px-4">{payer ? payer.name : 'Unknown'}</td>
                          <td className="py-2 px-4 text-right">₹{expense.amount.toFixed(2)}</td>
                          <td className="py-2 px-4 text-right">
                            <button 
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {expenses.length > 0 && (
                  <tfoot className="bg-gray-50 font-medium">
                    <tr>
                      <td colSpan="3" className="py-2 px-4 text-right">Total:</td>
                      <td className="py-2 px-4 text-right">
                        ₹{expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>
        )}

        {activeTab === 'summary' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Settlement Summary</h2>
              <button 
                onClick={() => setShowReminders(!showReminders)}
                className="flex items-center text-sm bg-blue-100 text-blue-700 py-1 px-3 rounded hover:bg-blue-200 transition-colors"
              >
                <Send size={14} className="mr-1" /> 
                {showReminders ? "Hide Reminders" : "Show Reminders"}
              </button>
            </div>

            {(participants.length === 0 || expenses.length === 0) ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle size={20} className="text-yellow-500 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Add both participants and expenses to see the settlement summary.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {participants.map(participant => {
                    const participantBalance = balances[participant.id] || { paid: 0, totalOwed: 0, owes: {} };
                    const netBalance = participantBalance.paid - participantBalance.totalOwed;
                    
                    return (
                      <div key={participant.id} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-medium text-lg mb-2">{participant.name}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Paid:</span>
                            <span className="font-medium">₹{participantBalance.paid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Owed:</span>
                            <span className="font-medium">₹{participantBalance.totalOwed.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t">
                            <span className="text-gray-600">Net Balance:</span>
                            <span className={`font-medium ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {netBalance >= 0 ? `+₹${netBalance.toFixed(2)}` : `-₹${Math.abs(netBalance).toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <h3 className="font-medium text-lg mb-3">Who Pays What</h3>
                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 text-left">From</th>
                        <th className="py-2 px-4 text-left">To</th>
                        <th className="py-2 px-4 text-right">Amount</th>
                        {showReminders && <th className="py-2 px-4 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(balances).map(personId => {
                        const person = balances[personId];
                        return Object.keys(person.owes).map(owedToId => {
                          const amount = person.owes[owedToId];
                          if (amount <= 0) return null;
                          
                          const from = participants.find(p => p.id === personId);
                          const to = participants.find(p => p.id === owedToId);
                          
                          if (!from || !to) return null;
                          
                          return (
                            <tr key={`${personId}-${owedToId}`} className="border-t">
                              <td className="py-2 px-4">{from.name}</td>
                              <td className="py-2 px-4">{to.name}</td>
                              <td className="py-2 px-4 text-right">₹{amount.toFixed(2)}</td>
                              {showReminders && (
                                <td className="py-2 px-4 text-right">
                                  <button 
                                    onClick={() => sendReminder(personId, owedToId, amount.toFixed(2))}
                                    className="text-blue-500 hover:text-blue-700"
                                    disabled={!from.email}
                                    title={!from.email ? "No email provided for this participant" : ""}
                                  >
                                    <Send size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        }).filter(Boolean);
                      }).flat()}
                      
                      {Object.keys(balances).length === 0 && (
                        <tr>
                          <td colSpan={showReminders ? 4 : 3} className="py-4 text-center text-gray-500">
                            No settlements needed.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// Tab Button Component with Props
const TabButton = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 mx-1 rounded-t border-t border-l border-r ${
        active 
          ? 'bg-white border-gray-200 -mb-px text-blue-600' 
          : 'bg-gray-100 border-transparent text-gray-600 hover:text-gray-800'
      }`}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </button>
  );
};

export default App;