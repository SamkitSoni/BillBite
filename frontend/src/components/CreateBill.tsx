'use client';

import { useState, useEffect } from 'react';
import { useBillBite } from '../hooks/useBillBite';
import { usePrivy } from '@privy-io/react-auth';
import { decodeEventLog } from 'viem';
import { BILLBITE_ABI } from '../lib/contract';

interface MenuItem {
  name: string;
  cost: string;
}

export default function CreateBill() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: '', cost: '' }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [createdBillId, setCreatedBillId] = useState<number | null>(null);
  
  const { createBill, isPending, isConfirming, isConfirmed, receipt } = useBillBite();
  const { authenticated } = usePrivy();

  // Extract bill ID from transaction receipt when confirmed
  useEffect(() => {
    if (isConfirmed && receipt && receipt.logs) {
      try {
        for (const log of receipt.logs) {
          try {
            const decodedLog = decodeEventLog({
              abi: BILLBITE_ABI,
              data: log.data,
              topics: log.topics,
            });
            
            if (decodedLog.eventName === 'BillCreated') {
              const billId = Number(decodedLog.args.billId);
              setCreatedBillId(billId);
              break;
            }
          } catch (error) {
            // Skip logs that don't match our ABI
            continue;
          }
        }
      } catch (error) {
        console.error('Error parsing transaction logs:', error);
      }
    }
  }, [isConfirmed, receipt]);

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: '', cost: '' }]);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) return;

    const validItems = menuItems.filter(item => item.name && item.cost);
    if (validItems.length === 0) return;

    try {
      setCreatedBillId(null); // Reset previous bill ID
      await createBill(validItems);
      setMenuItems([{ name: '', cost: '' }]);
      // Don't close the form immediately so user can see the bill ID
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  };

  const totalCost = menuItems
    .filter(item => item.cost)
    .reduce((sum, item) => sum + parseFloat(item.cost || '0'), 0);

  if (!authenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-gray-800 font-medium">Please connect your wallet to create bills.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-heading font-semibold text-gray-900">Create New Bill</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-heading font-medium transition-colors"
        >
          {isOpen ? 'Cancel' : 'New Bill'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-heading font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
                    placeholder="e.g., Pizza Margherita"
                    required
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-heading font-medium text-gray-700 mb-1">
                    Cost (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={item.cost}
                    onChange={(e) => updateMenuItem(index, 'cost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
                    placeholder="0.01"
                    required
                  />
                </div>
                {menuItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMenuItem(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={addMenuItem}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-heading font-medium transition-colors"
            >
              + Add Item
            </button>
          </div>

          {totalCost > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-heading font-medium text-gray-700">
                Total: <span className="text-lg font-bold text-gray-900">{totalCost.toFixed(4)} ETH</span>
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-heading font-medium transition-colors"
            >
              {isPending ? 'Creating...' : isConfirming ? 'Confirming...' : 'Create Bill'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-heading font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

          {isConfirmed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-gray-800 text-sm mb-2 font-medium">✓ Bill created successfully!</p>
              {createdBillId !== null && (
                <div className="bg-white border border-green-300 rounded-lg p-3 mb-3">
                  <p className="text-gray-800 font-heading font-medium">Your Bill ID: <span className="text-xl font-bold text-gray-900">{createdBillId}</span></p>
                  <p className="text-gray-600 text-sm mt-1">Use this ID to view and manage your bill in the Bill Viewer section.</p>
                </div>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setCreatedBillId(null);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-heading font-medium transition-colors"
              >
                Create Another Bill
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
