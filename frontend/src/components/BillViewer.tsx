'use client';

import { useState, useEffect } from 'react';
import { useBillBite } from '../hooks/useBillBite';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

// Utility function to format wallet address
const formatAddress = (address: string) => {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return 'Available';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Component to display all bills
function AllBillsSection() {
  const { useGetAllBills } = useBillBite();
  const { authenticated } = usePrivy();
  const { address } = useAccount();
  const { data: allBillsData, totalBills } = useGetAllBills();

  if (!authenticated) {
    return null;
  }

  if (totalBills === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">All Bills</h3>
        <p className="text-gray-500">No bills have been created yet.</p>
      </div>
    );
  }

  // Filter out fully paid bills (where all menus are owned)
  const activeBills = allBillsData.filter(bill => {
    const { data: billDetail } = bill.detail;
    if (!billDetail || billDetail.length === 0) return false;
    
    // Keep bills that have at least one unowned menu
    return billDetail.some(menu => menu.owner === '0x0000000000000000000000000000000000000000');
  });

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-heading font-semibold text-gray-900 mb-4">All Active Bills</h3>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        Showing {activeBills.length} active bills out of {totalBills} total bills created.
        Paid bills are automatically removed from this list.
      </p>
      
      {activeBills.length === 0 ? (
        <p className="text-gray-500">All bills have been fully paid! 🎉</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeBills.map(bill => {
            const { data: billDetail } = bill.detail;
            const { data: billCost } = bill.cost;
            const { data: restaurant } = bill.restaurant;

            if (!billDetail) return null;

            const myMenus = billDetail.filter(menu => 
              menu.owner.toLowerCase() === address?.toLowerCase()
            );
            const availableMenus = billDetail.filter(menu => 
              menu.owner === '0x0000000000000000000000000000000000000000'
            );

            return (
              <div key={bill.billId} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-heading font-semibold text-gray-900">Bill #{bill.billId}</h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    Active
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Restaurant: </span>
                    <span className="font-mono text-xs">
                      {restaurant ? `${restaurant.slice(0, 6)}...${restaurant.slice(-4)}` : 'Loading...'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Total Cost: </span>
                    <span className="font-semibold">
                      {billCost ? formatEther(billCost) : '0'} ETH
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">My Items: </span>
                    <span className="font-medium text-blue-600">{myMenus.length}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Available: </span>
                    <span className="font-medium text-orange-600">{availableMenus.length}</span>
                  </div>
                </div>

                {billDetail.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="space-y-1">
                      {billDetail.slice(0, 2).map((menu, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="truncate">{menu.name}</span>
                          <span className={`px-1 rounded text-xs ${
                            menu.owner === '0x0000000000000000000000000000000000000000' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : menu.owner.toLowerCase() === address?.toLowerCase()
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {formatAddress(menu.owner)}
                          </span>
                        </div>
                      ))}
                      {billDetail.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{billDetail.length - 2} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BillViewer() {
  const [billId, setBillId] = useState<string>('');
  const [selectedMenus, setSelectedMenus] = useState<number[]>([]);
  
  const { 
    useGetBillDetail, 
    useGetBillCost, 
    useGetBillRestaurant,
    useCurrentBillId,
    useGetAllBills,
    useBillPaymentStatus,
    selectMenu,
    payBill,
    isPending,
    isConfirming,
    isConfirmed 
  } = useBillBite();
  
  const { authenticated } = usePrivy();
  const { address } = useAccount();

  const { data: currentBillId } = useCurrentBillId();
  const billIdNum = billId ? parseInt(billId) : 0;
  const { data: billDetail, refetch: refetchBillDetail } = useGetBillDetail(billIdNum);
  const { data: billCost } = useGetBillCost(billIdNum);
  const { data: restaurant } = useGetBillRestaurant(billIdNum);

  // Auto-refresh data when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      refetchBillDetail();
    }
  }, [isConfirmed, refetchBillDetail]);

  const handleMenuSelection = (menuIndex: number) => {
    setSelectedMenus(prev => 
      prev.includes(menuIndex) 
        ? prev.filter(i => i !== menuIndex)
        : [...prev, menuIndex]
    );
  };

  const handleSelectMenus = async () => {
    if (!authenticated || selectedMenus.length === 0) return;
    
    try {
      await selectMenu(billIdNum, selectedMenus);
      setSelectedMenus([]);
    } catch (error) {
      console.error('Error selecting menus:', error);
    }
  };

  const handlePayBill = async () => {
    if (!authenticated) return;
    
    // Using a mock ERC20 token address for demonstration
    const mockTokenAddress = '0x0000000000000000000000000000000000000000';
    
    try {
      await payBill(billIdNum, mockTokenAddress);
    } catch (error) {
      console.error('Error paying bill:', error);
    }
  };

  const myMenus = billDetail?.filter(menu => 
    menu.owner.toLowerCase() === address?.toLowerCase()
  ) || [];

  const myCost = myMenus.reduce((sum, menu) => sum + menu.cost, BigInt(0));

  if (!authenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 font-medium">Please connect your wallet to view and interact with bills.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* All Bills Section */}
      <AllBillsSection />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-4">View Specific Bill</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-heading font-medium text-gray-700 mb-2">
          Bill ID
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            value={billId}
            onChange={(e) => setBillId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Enter bill ID (e.g., 0, 1, 2...)"
          />
          {currentBillId !== undefined && currentBillId > 0 && (
            <button
              onClick={() => setBillId((Number(currentBillId) - 1).toString())}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-heading font-medium transition-colors whitespace-nowrap"
            >
              Latest Bill
            </button>
          )}
        </div>
        {currentBillId !== undefined && (
          <p className="text-xs text-gray-500 mt-1">
            Total bills created: {Number(currentBillId)} (Latest ID: {Number(currentBillId) - 1})
          </p>
        )}
      </div>

      {billDetail && billDetail.length > 0 && (
        <div className="space-y-6">
          {/* Bill Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-heading font-medium text-gray-600">Restaurant</p>
                <p className="font-mono text-sm text-gray-900">
                  {restaurant ? `${restaurant.slice(0, 6)}...${restaurant.slice(-4)}` : 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-sm font-heading font-medium text-gray-600">Total Cost</p>
                <p className="font-heading font-bold text-lg text-gray-900">
                  {billCost ? formatEther(billCost) : '0'} ETH
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div>
            <h3 className="text-xl font-heading font-semibold text-gray-900 mb-3">Menu Items</h3>
            <div className="space-y-2">
              {billDetail.map((menu, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    menu.owner === '0x0000000000000000000000000000000000000000'
                      ? 'border-gray-200 bg-white'
                      : menu.owner.toLowerCase() === address?.toLowerCase()
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {menu.owner === '0x0000000000000000000000000000000000000000' && (
                      <input
                        type="checkbox"
                        checked={selectedMenus.includes(index)}
                        onChange={() => handleMenuSelection(index)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                    <div>
                      <p className="font-heading font-medium text-gray-900">{menu.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatEther(menu.cost)} ETH
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {menu.owner === '0x0000000000000000000000000000000000000000' ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-mono">
                        {formatAddress(menu.owner)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Selection Summary */}
          {myMenus.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-heading font-semibold text-blue-900 mb-2">My Selection</h4>
              <div className="space-y-1">
                {myMenus.map((menu, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-800">{menu.name}</span>
                    <span className="text-gray-800 font-mono">{formatEther(menu.cost)} ETH</span>
                  </div>
                ))}
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between font-heading font-semibold">
                    <span className="text-blue-900">Total:</span>
                    <span className="text-blue-900 font-mono">{formatEther(myCost)} ETH</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {selectedMenus.length > 0 && (
              <button
                onClick={handleSelectMenus}
                disabled={isPending || isConfirming}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-heading font-medium transition-colors"
              >
                {isPending ? 'Selecting...' : isConfirming ? 'Confirming...' : `Select ${selectedMenus.length} Item(s)`}
              </button>
            )}
            
            {myMenus.length > 0 && (
              <button
                onClick={handlePayBill}
                disabled={isPending || isConfirming}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-heading font-medium transition-colors"
              >
                {isPending ? 'Processing...' : isConfirming ? 'Confirming...' : 'Pay My Share'}
              </button>
            )}
          </div>

          {isConfirmed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm font-medium">✓ Transaction completed successfully!</p>
            </div>
          )}
        </div>
      )}

      {billId && (!billDetail || billDetail.length === 0) && (
        <div className="text-center py-8">
          <p className="text-gray-500 font-medium">No bill found with ID {billId}</p>
        </div>
      )}
      </div>
    </div>
  );
}
