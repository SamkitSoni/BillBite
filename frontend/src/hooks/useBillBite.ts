'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BILLBITE_ABI, CONTRACT_ADDRESS } from '../lib/contract';
import { parseEther } from 'viem';

export function useBillBite() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Read functions
  const useGetBillDetail = (billId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: BILLBITE_ABI,
      functionName: 'getBillDetail',
      args: [BigInt(billId)],
      query: {
        enabled: !!CONTRACT_ADDRESS && billId > 0,
      },
    });
  };

  const useGetBillCost = (billId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: BILLBITE_ABI,
      functionName: 'getBillCost',
      args: [BigInt(billId)],
      query: {
        enabled: !!CONTRACT_ADDRESS && billId > 0,
      },
    });
  };

  const useGetBillRestaurant = (billId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: BILLBITE_ABI,
      functionName: 'billRestaurant',
      args: [BigInt(billId)],
      query: {
        enabled: !!CONTRACT_ADDRESS && billId > 0,
      },
    });
  };

  const useCurrentBillId = () => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: BILLBITE_ABI,
      functionName: 'currentBillId',
      query: {
        enabled: !!CONTRACT_ADDRESS,
      },
    });
  };

  // Get all bills (from 0 to current bill ID)
  const useGetAllBills = () => {
    const { data: currentBillId } = useCurrentBillId();
    const billCount = currentBillId ? Number(currentBillId) : 0;
    
    // Create a fixed array of bill data queries based on max possible bills
    // This ensures hooks are called in the same order every time
    const maxBills = 100; // Set a reasonable maximum
    const billQueries = [];
    
    for (let i = 0; i < maxBills; i++) {
      const shouldFetch = i < billCount;
      billQueries.push({
        billId: i,
        detail: useReadContract({
          address: CONTRACT_ADDRESS,
          abi: BILLBITE_ABI,
          functionName: 'getBillDetail',
          args: [BigInt(i)],
          query: {
            enabled: !!CONTRACT_ADDRESS && shouldFetch,
          },
        }),
        cost: useReadContract({
          address: CONTRACT_ADDRESS,
          abi: BILLBITE_ABI,
          functionName: 'getBillCost',
          args: [BigInt(i)],
          query: {
            enabled: !!CONTRACT_ADDRESS && shouldFetch,
          },
        }),
        restaurant: useReadContract({
          address: CONTRACT_ADDRESS,
          abi: BILLBITE_ABI,
          functionName: 'billRestaurant',
          args: [BigInt(i)],
          query: {
            enabled: !!CONTRACT_ADDRESS && shouldFetch,
          },
        }),
      });
    }
    
    // Only return the bills that actually exist
    return {
      data: billQueries.slice(0, billCount),
      totalBills: billCount,
    };
  };

  // Check if a bill has been fully paid by checking if all menus have owners
  const useBillPaymentStatus = (billId: number) => {
    const { data: billDetail } = useGetBillDetail(billId);
    
    if (!billDetail || billDetail.length === 0) {
      return { isPaid: false, isFullyOwned: false };
    }
    
    const isFullyOwned = billDetail.every(menu => 
      menu.owner !== '0x0000000000000000000000000000000000000000'
    );
    
    // For now, we'll consider a bill "paid" if all menus are owned
    // In a real implementation, you might want to track payment status separately
    return {
      isPaid: isFullyOwned,
      isFullyOwned,
    };
  };

  // Write functions
  const createBill = async (menus: { name: string; cost: string }[]) => {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }
    
    const menuStructs = menus.map(menu => ({
      name: menu.name,
      cost: parseEther(menu.cost),
      owner: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    }));

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: BILLBITE_ABI,
      functionName: 'createBill',
      args: [menuStructs],
    });
  };

  const selectMenu = async (billId: number, menuIndices: number[]) => {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: BILLBITE_ABI,
      functionName: 'selectMenu',
      args: [BigInt(billId), menuIndices.map(i => BigInt(i))],
    });
  };

  const payBill = async (billId: number, tokenAddress: string) => {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: BILLBITE_ABI,
      functionName: 'pay',
      args: [BigInt(billId), tokenAddress as `0x${string}`],
    });
  };

  return {
    // Read hooks
    useGetBillDetail,
    useGetBillCost,
    useGetBillRestaurant,
    useCurrentBillId,
    useGetAllBills,
    useBillPaymentStatus,
    
    // Write functions
    createBill,
    selectMenu,
    payBill,
    
    // Transaction states
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    receipt,
  };
}
