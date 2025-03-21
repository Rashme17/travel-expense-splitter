import React, { useState } from "react";
import { FaPlus, FaTrash, FaBell } from "react-icons/fa";
import "./App.css";


const Card = ({ children }) => (
  <div className="border rounded-lg p-4 shadow-md bg-white">{children}</div>
);

const Button = ({ onClick, children, className }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded ${className}`}>
    {children}
  </button>
);

const TravelExpenseSplitter = () => {
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const addExpense = () => {
    if (name && amount) {
      setExpenses([...expenses, { name, amount: parseFloat(amount) }]);
      setName("");
      setAmount("");
    }
  };

  const removeExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const perPersonShare = expenses.length > 0 ? totalAmount / expenses.length : 0;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Travel Expense Splitter</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <Button onClick={addExpense} className="bg-green-500 text-white p-2 rounded">
          <FaPlus />
        </Button>
      </div>
      <Card>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No expenses added.</p>
        ) : (
          <ul>
            {expenses.map((expense, index) => (
              <li key={index} className="flex justify-between p-2 border-b">
                <span>{expense.name}: ${expense.amount.toFixed(2)}</span>
                <Button onClick={() => removeExpense(index)} className="text-red-500">
                  <FaTrash />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <h3 className="text-lg font-semibold mt-4">Total: ${totalAmount.toFixed(2)}</h3>
        <h3 className="text-lg font-semibold">Per Person: ${perPersonShare.toFixed(2)}</h3>
      </Card>
      <Button className="mt-4 bg-blue-500 text-white p-2 rounded flex items-center gap-2">
        <FaBell /> Send Payment Reminders
      </Button>
    </div>
  );
};

export default TravelExpenseSplitter;