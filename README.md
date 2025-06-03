# 🍽️ BillBite

**Seamlessly split restaurant bills with cryptocurrency on the blockchain**

BillBite is a decentralized application (dApp) that revolutionizes bill splitting for restaurants and dining groups. Built on Ethereum, it enables transparent, secure, and trustless bill management where restaurants can create itemized bills and customers can select and pay for only their ordered items using cryptocurrency.

## ✨ Features

### 🏪 For Restaurants
- **Create Itemized Bills**: Generate detailed bills with individual menu items and costs
- **Direct Payments**: Receive payments directly to your wallet address
- **Transparent Tracking**: Monitor bill status and payment progress in real-time

### 👥 For Customers
- **Fair Splitting**: Select only the items you ordered from the bill
- **Cryptocurrency Payments**: Pay using ERC-20 tokens
- **No Overpaying**: Eliminate disputes by paying exactly your share

### 🔗 Blockchain Benefits
- **Transparency**: All transactions are recorded on-chain
- **Security**: Cryptographically secure payments
- **Trustless**: No intermediaries or central authority required
- **Immutable Records**: Permanent transaction history

## 🛠️ Technology Stack

### Smart Contract (Backend)
- **Solidity** ^0.8.21
- **Foundry** - Development framework
- **OpenZeppelin Contracts** - Security standards
- **Ethereum Network** - Deployed on Sepolia testnet

### Frontend
- **Next.js** 15.3.3 - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** 4.0 - Styling
- **Privy** - Web3 authentication
- **Wagmi** - Ethereum interactions
- **Viem** - Ethereum utilities

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet
- Foundry (for smart contract development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/BillBite.git
   cd BillBite
   ```

2. **Setup Backend (Smart Contract)**
   ```bash
   cd backend
   npm install
   forge install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Development

1. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Deploy smart contracts (if needed)**
   ```bash
   cd backend
   forge script script/Deploy.s.sol --rpc-url <your-rpc-url> --private-key <your-private-key> --broadcast
   ```

### Environment Setup

Create environment variables for:
- RPC endpoints for blockchain networks
- Private keys for deployment (use test networks only)
- Frontend environment variables for Web3 providers

## 📋 How It Works

### For Restaurants:
1. **Connect Wallet**: Authenticate using a Web3 wallet
2. **Create Bill**: Add menu items with names and costs
3. **Share Bill ID**: Provide the generated bill ID to customers
4. **Receive Payment**: Get paid directly when customers complete their payments

### For Customers:
1. **Connect Wallet**: Authenticate using a Web3 wallet
2. **Enter Bill ID**: Access the shared bill using the ID
3. **Select Items**: Choose only the menu items you ordered
4. **Pay Share**: Pay your portion using ERC-20 tokens

## 📁 Project Structure

```
BillBite/
├── backend/                 # Smart contract and blockchain logic
│   ├── src/
│   │   └── BillBite.sol    # Main smart contract
│   ├── script/
│   │   └── Deploy.s.sol    # Deployment script
│   ├── test/               # Contract tests
│   └── foundry.toml        # Foundry configuration
├── frontend/               # Next.js web application
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and contract ABI
│   └── public/            # Static assets
└── README.md              # This file
```

## 🔐 Smart Contract

**Contract Address**: `0x79086a9930fc1997a3e09859842700d4a806fef8` (Sepolia Testnet)

## 🧪 Testing

Run smart contract tests:
```bash
cd backend
forge test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## 🌐 Deployment

The smart contract is deployed on Ethereum Sepolia testnet. For production deployment:

1. Configure network settings in `foundry.toml`
2. Set up environment variables
3. Deploy using Foundry scripts
4. Update frontend contract addresses
5. Deploy frontend to Vercel or similar platform

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
