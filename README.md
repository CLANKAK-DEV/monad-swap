# monad-v3-swap

🔁 **Uniswap V3 Swap Script for Monad Blockchain**

## 📖 Overview

**monad-v3-swap** is a Node.js script designed to automate token swaps on the Monad blockchain using the Uniswap V3 protocol. It supports multiple trading pairs (e.g., USDC ↔ WMON, USDC ↔ USDT) across various fee tiers (0.01% to 1%) and provides:

* **Balance Checks:** Verifies sufficient token balances before swapping.
* **Token Approvals:** Automatically approves tokens for the Uniswap V3 router.
* **Swap Execution:** Uses the `exactInputSingle` method for precise swaps.
* **Comprehensive Testing:** Tests multiple pairs and fee tiers, reporting success rates and final balances.

This script is ideal for developers and traders looking to execute token swaps on Monad with maximum success probability.

## 🌍 Global Usage Note

This script is designed for global use with the Monad blockchain, accessible to developers and traders worldwide. Key points for universal adoption:

* **Network Compatibility:** Works with any Monad RPC endpoint (testnet or mainnet), available through providers like Alchemy or Infura.
* **Token Availability:** Supports globally traded tokens (USDC, USDT, WMON, CHOOG).
* **Decentralized Access:** Leverages Uniswap V3’s decentralized protocol, allowing swaps without geographic restrictions.
* **Language Support:** Written in JavaScript (Node.js), platform-agnostic and adaptable.
* **Safety First:** Always test on Monad’s testnet before using real funds.

For support, join the Monad developer community or the Uniswap V3 forums.

## 📋 Prerequisites

Before running the script, ensure you have:

* ✅ Node.js (v18 or newer)
* ✅ A terminal (Command Prompt, Bash, etc.)
* ✅ A wallet private key (testnet for safety)
* ✅ A Monad RPC endpoint (Alchemy, Infura, etc.)
* ✅ Sufficient tokens (USDC, WMON, USDT, CHOOG)
* ✅ MON for gas fees

> ⚠️ **Security Warning:** Never share your private key or .env file. Use a testnet wallet to avoid financial loss.

## 🛠️ Step-by-Step Setup

### 1. 📂 Create Project Directory

```bash
mkdir monad-v3-swap
cd monad-v3-swap
```

### 2. 🧱 Initialize Node.js Project

```bash
npm init -y
```

### 3. 📦 Install Dependencies

```bash
npm install ethers dotenv
```

* `ethers`: Interacts with the Monad blockchain and Uniswap V3 contracts.
* `dotenv`: Loads environment variables securely.

### 4. 🔑 Configure .env File

Create a `.env` file in the project root:

```env
PRIVATE_KEY=your_private_key_here
RPC_URL=https://your-monad-rpc-url-here
```

### 5. 📜 Create the Swap Script

Create a file `swap-v3.js` and paste in your Uniswap V3 swap logic.

### 6. 🚀 Run the Script

```bash
node swap-v3.js
```

## ✅ Example Output

```
🏦 Wallet: 0xYourWalletAddress
🔄 Uniswap V3 Routers:
   1. 0x021724a16c7831be1faa306a324438ed95a6144e
🌐 Chain ID: 1234

📊 Initial Token Balances:
   USDC: 83.48538
   WMON: 0.0
   CHOOG: 0.0
   USDT: 50.0

🎯 ==================== ROUTER 1 ====================
[1/12] V3 Swap: WMON → USDC
❌ Insufficient WMON balance

[2/12] V3 Swap: USDC → WMON
🟢 USDC already approved
✅ Gas estimation successful
⏳ Transaction hash: 0x123...
✅ V3 Swap SUCCESS!

📊 Final Balances:
   USDC: 80.48538
   WMON: 2.95
   USDT: 50.0
```

## 🔢 Tokens Used

| Token | Symbol | Address                                      |
| ----- | ------ | -------------------------------------------- |
| USDC  | USDC   | `0xf817257fed379853cde0fa4f97ab987181b1e5ea` |
| WMON  | WMON   | `0x760afe86e5de5fa0ee542fc7b7b713e1c5425701` |
| CHOOG | CHOOG  | `0xe0590015a873bf326bd645c3e1266d4db41c4e6b` |
| USDT  | USDT   | `0x88b8e2161dedc77ef4ab7585569d2415a1c1055d` |

## 🌐 Uniswap V3 Router

| Name   | Address                                      |
| ------ | -------------------------------------------- |
| Router | `0x021724a16c7831be1faa306a324438ed95a6144e` |

## 🛠️ Troubleshooting

* **“Insufficient balance”**: Top up token or MON balance.
* **“No liquidity pool”**: Check the trading pair and fee tier.
* **“RPC error”**: Validate your RPC URL.
* **“Approval failed”**: Verify token contract and MON balance.
* **Low success rate**: Narrow down pairs or fee tiers.

## ⚠️ Important Notes

* Use testnet before mainnet.
* Slippage protection is disabled (`amountOutMinimum = 0`) — not recommended for production.
* Ensure gas fee coverage with MON.


