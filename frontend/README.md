# BillBite Frontend

A NextJS frontend application for the BillBite smart contract that enables seamless restaurant bill splitting using cryptocurrency.

## Features

- 🔐 **Wallet Integration**: Connect using Privy (supports email, wallet connections)
- 🍽️ **Restaurant Bill Creation**: Restaurants can create itemized bills
- 👥 **Group Bill Splitting**: Customers can select their items and pay their share
- 💎 **Blockchain Powered**: Transparent and trustless transactions
- 🎨 **Modern UI**: Built with TailwindCSS for a beautiful user experience

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file and add:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
NEXT_PUBLIC_CONTRACT_ADDRESS=0x79086a9930fc1997a3e09859842700d4a806fef8
NEXT_PUBLIC_CHAIN_ID=11155111
```

**Get your Privy App ID:**
1. Visit [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app or use an existing one
3. Copy the App ID from your dashboard
4. Replace `your_privy_app_id_here` with your actual App ID

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## How to Use

### For Restaurants:
1. Connect your wallet
2. Click "New Bill" in the Create Bill section
3. Add menu items with names and prices (in ETH)
4. Click "Create Bill" to deploy to blockchain
5. Share the Bill ID with customers

### For Customers:
1. Connect your wallet
2. Enter the Bill ID in the View Bill section
3. Select the menu items you ordered by checking the boxes
4. Click "Select Items" to claim your items
5. Click "Pay My Share" to pay for your selected items

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS
- **Wallet Integration**: Privy
- **Web3 Library**: Wagmi, Viem
- **Smart Contract**: Solidity (deployed on Sepolia testnet)

## Smart Contract Integration

The frontend interacts with the BillBite smart contract deployed at:
- **Contract Address**: `0x79086a9930fc1997a3e09859842700d4a806fef8`
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

1. Configure environment variables in your deployment platform
2. Build the application: `npm run build`
3. Deploy to your preferred platform (Vercel, Netlify, etc.)

## Notes

- Make sure you have Sepolia testnet ETH for transactions
- The contract address is configured for Sepolia testnet
- For production, update the contract address and chain ID accordingly
