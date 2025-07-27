Dealsbe - Exclusive Software Deals for Developers and Startups
🎉 Empowering Suppliers to Post and Manage Software Deals

🧾 Description
Dealsbe is a platform for developers, startups, and software suppliers to discover, post, and manage exclusive software deals. This repository provides a Node.js-based script to help suppliers post deals and integrate with blockchain-based payments (e.g., swapping USDC to WMON for deal purchases) using decentralized exchanges (DEXs). The script automates:

Posting software deals to the Dealsbe platform.
Approving and processing token payments for deals (optional, using monad-swap logic).
Checking supplier wallet balances for token-based transactions.

This tool is ideal for suppliers looking to reach developers and startups with secure, transparent deal listings.

📦 Requirements
To use this script, you need:

✅ Node.js (v18 or newer)
✅ A terminal (Command Prompt, Bash, or VS Code)
✅ A wallet private key (testnet or mainnet, for blockchain integration)
✅ A blockchain RPC endpoint (e.g., Infura, Alchemy) for token transactions
✅ A Dealsbe API key (for posting deals)
✅ (Optional) USDC tokens for blockchain-based deal payments


📁 Setup: Step-by-Step Guide
1. 📂 Create the project folder
mkdir dealsbe-supplier
cd dealsbe-supplier

2. 🧱 Initialize the Node.js project
npm init -y

3. 📦 Install dependencies
npm install ethers dotenv axios


ethers: For blockchain interactions (e.g., token swaps).
dotenv: For managing environment variables.
axios: For making API calls to the Dealsbe platform.

4. 🛠️ Create your .env file
Create a file named .env in the project root and add:
RPC_URL=https://your-rpc-url-here
PRIVATE_KEY=your_private_key_here


⚠️ Never share this file publicly!


📜 Create the script
Create a file named post-deal.js and paste the following content:
import 'dotenv/config';
import { ethers } from 'ethers';
import axios from 'axios';

// Config from .env
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const DEALSBE_API_KEY = process.env.DEALSBE_API_KEY;
const DEALSBE_API_URL = process.env.DEALSBE_API_URL;

// Token addresses (for optional payment integration)
const tokens = {
  USDC: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
  WMON: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
};

const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

async function checkBalance(wallet, tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const decimals = await tokenContract.decimals();
  const balance = await tokenContract.balanceOf(wallet.address);
  console.log(`Balance of USDC: ${ethers.formatUnits(balance, decimals)}`);
  return balance;
}

async function postDeal(dealData) {
  try {
    const response = await axios.post(
      `${DEALSBE_API_URL}/deals`,
      dealData,
      { headers: { 'Authorization': `Bearer ${DEALSBE_API_KEY}` } }
    );
    console.log(`✅ Deal posted successfully: ${response.data.dealId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to post deal: ${error.message}`);
    throw error;
  }
}

async function main() {
  if (!RPC_URL || !PRIVATE_KEY || !DEALSBE_API_KEY) {
    console.error("Please set RPC_URL, PRIVATE_KEY, and DEALSBE_API_KEY in your .env file");
    return;
  }

  // Initialize wallet and provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log(`Using wallet: ${wallet.address}`);

  // Check USDC balance (optional, for deal payments)
  await checkBalance(wallet, tokens.USDC);

  // Example deal data
  const dealData = {
    title: "Exclusive SaaS Subscription Discount",
    description: "50% off for 6 months on our developer tools suite!",
    price: 100, // In USDC
    category: "Developer Tools",
    supplier: wallet.address,
    expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 days from now
  };

  // Post the deal to Dealsbe
  await postDeal(dealData);

  // Optional: Add logic for token approval/swaps (similar to monad-swap)
  console.log("🔔 Note: Token swap functionality can be added for deal payments.");
}

main().catch(console.error);


▶️ Run the script
In the terminal, run:
node post-deal.js

Example output:
Using wallet: 0x5cC0BeF8064901F319807d21C811bA1184EE17D8
Balance of USDC: 83.48538
✅ Deal posted successfully: deal_123456
🔔 Note: Token swap functionality can be added for deal payments.


💡 Features for Suppliers

Post Deals: Share software deals with developers and startups via the Dealsbe API.
Blockchain Integration: Optionally use USDC/WMON for secure, transparent payments (extendable with monad-swap logic).
Balance Checks: Verify wallet balances before posting deals or processing payments.


🌐 Dealsbe API Details



Endpoint
Description
Example URL



POST /deals
Create a new deal
https://api.dealsbe.com/v1/deals



API Key: Obtain from Dealsbe Dashboard.
Rate Limits: Check Dealsbe documentation for API usage limits.


⚠️ Notes

Test on a blockchain testnet (e.g., Monad testnet) before using mainnet.
Ensure sufficient USDC for deal-related payments if blockchain integration is used.
The DEALSBE_API_KEY and DEALSBE_API_URL must be provided externally (e.g., through environment variables or configuration) as they are not hardcoded in the .env template.


Enjoy posting deals 🚀
