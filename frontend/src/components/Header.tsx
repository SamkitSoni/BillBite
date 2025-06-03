'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

export default function Header() {
  const { login, logout, authenticated } = usePrivy();
  const { address } = useAccount();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">🍽️</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {address && (
                    <span className="font-mono">
                      {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-heading font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-heading font-medium transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
