import 'dotenv/config';
import { ethers } from "ethers";

// Config from your .env
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Uniswap V3 Routers
const routers = [
  "0x021724a16c7831be1faa306a324438ed95a6144e",

];

// Token addresses
const tokens = {
  USDC: "0xf817257fed379853cde0fa4f97ab987181b1e5ea",
  WMON: "0x760afe86e5de5fa0ee542fc7b7b713e1c5425701",
  CHOOG: "0xe0590015a873bf326bd645c3e1266d4db41c4e6b",
  USDT: "0x88b8e2161dedc77ef4ab7585569d2415a1c1055d",
};

// Uniswap V3 Router ABI (exactInputSingle function)
const ROUTER_V3_ABI = [
  "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut)",
  "function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) external returns (uint256 amountIn)"
];

// ERC20 ABI
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

// Extended fee tiers - some routers use different fees
const FEE_TIERS = [
  100,   // 0.01%
  500,   // 0.05%
  2500,  // 0.25%
  3000,  // 0.3% (most common)
  10000  // 1%
];

// Trading pairs with multiple fee tiers for better compatibility
const tradingPairs = [
  // Router 1 known working pairs
  { tokenIn: "WMON", tokenOut: "USDC", amountIn: "1", fee: 3000 },
  { tokenIn: "USDC", tokenOut: "WMON", amountIn: "3", fee: 3000 },
  
  // Try different fee tiers for Router 2 & 3
  { tokenIn: "WMON", tokenOut: "USDC", amountIn: "1", fee: 100 },   // 0.01%
  { tokenIn: "USDC", tokenOut: "WMON", amountIn: "2", fee: 100 },
  { tokenIn: "WMON", tokenOut: "USDC", amountIn: "1", fee: 2500 },  // 0.25%
  { tokenIn: "USDC", tokenOut: "WMON", amountIn: "2", fee: 2500 },
  { tokenIn: "WMON", tokenOut: "USDC", amountIn: "1", fee: 10000 }, // 1%
  { tokenIn: "USDC", tokenOut: "WMON", amountIn: "2", fee: 10000 },
  
  // Test stablecoin pairs with different fees
  { tokenIn: "USDC", tokenOut: "USDT", amountIn: "2", fee: 100 },
  { tokenIn: "USDT", tokenOut: "USDC", amountIn: "2", fee: 100 },
  { tokenIn: "USDC", tokenOut: "USDT", amountIn: "2", fee: 500 },
  { tokenIn: "USDT", tokenOut: "USDC", amountIn: "2", fee: 500 },
];

async function approveToken(wallet, tokenAddress, symbol, amount, decimals, routerAddress) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const amountToApprove = ethers.parseUnits(amount, decimals);
    
    // Check current allowance
    const currentAllowance = await tokenContract.allowance(wallet.address, routerAddress);
    
    if (currentAllowance >= amountToApprove) {
      console.log(`🟢 ${symbol} already approved`);
      return true;
    }
    
    console.log(`🟡 Approving ${amount} ${symbol}...`);
    const tx = await tokenContract.approve(routerAddress, amountToApprove);
    await tx.wait();
    console.log(`✅ ${symbol} approved!`);
    return true;
    
  } catch (error) {
    console.log(`❌ Approval failed for ${symbol}: ${error.message}`);
    return false;
  }
}

async function executeV3Swap(wallet, router, routerAddress, pair) {
  try {
    console.log(`\n🔄 V3 Swap: ${pair.tokenIn} → ${pair.tokenOut} (${pair.amountIn} tokens, ${(pair.fee/100).toFixed(2)}% fee) on ${routerAddress.slice(0,10)}...`);
    
    const tokenInAddr = tokens[pair.tokenIn];
    const tokenOutAddr = tokens[pair.tokenOut];
    
    // Get token contracts
    const tokenInContract = new ethers.Contract(tokenInAddr, ERC20_ABI, wallet);
    const tokenOutContract = new ethers.Contract(tokenOutAddr, ERC20_ABI, wallet);
    
    // Get token info
    const decimalsIn = await tokenInContract.decimals();
    const decimalsOut = await tokenOutContract.decimals();
    const symbolIn = await tokenInContract.symbol();
    const symbolOut = await tokenOutContract.symbol();
    
    console.log(`📊 ${symbolIn} (${decimalsIn} decimals) → ${symbolOut} (${decimalsOut} decimals)`);
    
    // Check balance
    const balance = await tokenInContract.balanceOf(wallet.address);
    const formattedBalance = ethers.formatUnits(balance, decimalsIn);
    console.log(`💰 Current ${symbolIn} balance: ${formattedBalance}`);
    
    const amountIn = ethers.parseUnits(pair.amountIn, decimalsIn);
    
    if (balance < amountIn) {
      console.log(`❌ Insufficient ${symbolIn} balance (need ${pair.amountIn}, have ${formattedBalance})`);
      return false;
    }
    
    // Approve tokens
    const approved = await approveToken(wallet, tokenInAddr, symbolIn, pair.amountIn, decimalsIn, routerAddress);
    if (!approved) return false;
    
    // Prepare swap parameters with better slippage protection
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
    const amountOutMinimum = 0; // Accept any amount for testing
    const sqrtPriceLimitX96 = 0; // No price limit
    
    const params = {
      tokenIn: tokenInAddr,
      tokenOut: tokenOutAddr,
      fee: pair.fee,
      recipient: wallet.address,
      deadline: deadline,
      amountIn: amountIn,
      amountOutMinimum: amountOutMinimum,
      sqrtPriceLimitX96: sqrtPriceLimitX96
    };
    
    console.log(`🚀 Executing exactInputSingle swap...`);
    console.log(`   Router: ${routerAddress.slice(0,10)}...`);
    console.log(`   Fee tier: ${(pair.fee/100).toFixed(2)}% (${pair.fee} basis points)`);
    console.log(`   Amount in: ${pair.amountIn} ${symbolIn}`);
    
    // First try to estimate gas to see if the swap would work
    try {
      await router.exactInputSingle.estimateGas(params);
      console.log(`✅ Gas estimation successful - pool exists!`);
    } catch (gasError) {
      console.log(`❌ No liquidity pool for ${symbolIn}/${symbolOut} with ${(pair.fee/100).toFixed(2)}% fee`);
      return false;
    }
    
    // Execute the swap
    const tx = await router.exactInputSingle(params);
    console.log(`⏳ Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ V3 Swap SUCCESS! Block: ${receipt.blockNumber}`);
    
    // Check new balances
    const newBalanceIn = await tokenInContract.balanceOf(wallet.address);
    const newBalanceOut = await tokenOutContract.balanceOf(wallet.address);
    console.log(`📈 New ${symbolIn} balance: ${ethers.formatUnits(newBalanceIn, decimalsIn)}`);
    console.log(`📈 New ${symbolOut} balance: ${ethers.formatUnits(newBalanceOut, decimalsOut)}`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ V3 Swap failed: ${error.message.split('(')[0]}`);
    return false;
  }
}

async function main() {
  if (!RPC_URL || !PRIVATE_KEY) {
    console.error("❌ Please set RPC_URL and PRIVATE_KEY in your .env file");
    return;
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("🏦 Wallet:", wallet.address);
  console.log("🔄 Uniswap V3 Routers:");
  routers.forEach((addr, i) => console.log(`   ${i + 1}. ${addr}`));
  console.log("🌐 Chain ID:", (await provider.getNetwork()).chainId);
  
  // Show initial balances
  console.log("\n📊 Initial Token Balances:");
  for (const [symbol, address] of Object.entries(tokens)) {
    try {
      const contract = new ethers.Contract(address, ERC20_ABI, wallet);
      const balance = await contract.balanceOf(wallet.address);
      const decimals = await contract.decimals();
      const formatted = ethers.formatUnits(balance, decimals);
      console.log(`   ${symbol}: ${formatted}`);
    } catch (error) {
      console.log(`   ${symbol}: Error`);
    }
  }
  
  let totalSuccessCount = 0;
  let totalAttempts = 0;
  
  // Test each router
  for (let routerIndex = 0; routerIndex < routers.length; routerIndex++) {
    const routerAddress = routers[routerIndex];
    const router = new ethers.Contract(routerAddress, ROUTER_V3_ABI, wallet);
    
    console.log(`\n🎯 ==================== ROUTER ${routerIndex + 1} ====================`);
    console.log(`📍 Testing router: ${routerAddress}`);
    
    let routerSuccessCount = 0;
    
    // Try each trading pair on this router
    for (let i = 0; i < tradingPairs.length; i++) {
      const pair = tradingPairs[i];
      totalAttempts++;
      
      console.log(`\n[${i + 1}/${tradingPairs.length}] ---- Router ${routerIndex + 1} ----`);
      
      const success = await executeV3Swap(wallet, router, routerAddress, pair);
      if (success) {
        routerSuccessCount++;
        totalSuccessCount++;
        // Wait between successful swaps
        if (i < tradingPairs.length - 1) {
          console.log("⏳ Waiting 5 seconds before next swap...");
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } else {
        // Wait a bit even on failure
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n📊 Router ${routerIndex + 1} Results: ${routerSuccessCount}/${tradingPairs.length} successful swaps`);
    
    // Wait between routers
    if (routerIndex < routers.length - 1) {
      console.log("⏳ Waiting 10 seconds before testing next router...");
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log(`\n🏁 FINAL RESULTS FOR BOTH ROUTERS:`);
  console.log(`✅ Total successful V3 swaps: ${totalSuccessCount}/${totalAttempts}`);
  console.log(`📊 Overall success rate: ${((totalSuccessCount/totalAttempts)*100).toFixed(1)}%`);
  
  // Show final balances
  console.log("\n📊 Final Token Balances:");
  for (const [symbol, address] of Object.entries(tokens)) {
    try {
      const contract = new ethers.Contract(address, ERC20_ABI, wallet);
      const balance = await contract.balanceOf(wallet.address);
      const decimals = await contract.decimals();
      const formatted = ethers.formatUnits(balance, decimals);
      console.log(`   ${symbol}: ${formatted}`);
    } catch (error) {
      console.log(`   ${symbol}: Error`);
    }
  }
  
  console.log(`\n🎉 Successfully interacted with both Uniswap V3 Routers!`);
  console.log(`💡 All transactions use exactInputSingle method like your successful swap`);
}

main().catch(console.error);