import axios from "axios";

// Using the rock-solid V1 endpoint
const ETHERSCAN_BASE_URL = "https://api.etherscan.io/api";

export async function getEthTxReceipt(txHash: string) {
  // 1. Clean the hash (remove spaces, ensure lowercase)
  const cleanHash = txHash.trim().toLowerCase();
  const apiKey = (process.env.ETHERSCAN_API_KEY || "").trim();

  try {
    // 2. Use a template string for the URL to avoid param encoding issues
    const url = `${ETHERSCAN_BASE_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${cleanHash}&apikey=${apiKey}`;
    
    const res = await axios.get(url);

    // DEBUG: Let's see exactly what Etherscan said
    if (res.data.error) {
       console.log("Etherscan API Error Object:", res.data.error);
    }

    return res.data.result || null;
  } catch (error) {
    console.error("Axios request failed:", error);
    return null;
  }
}

export async function getEthLatestBlockNumber(): Promise<bigint> {
  const apiKey = (process.env.ETHERSCAN_API_KEY || "").trim();
  const url = `${ETHERSCAN_BASE_URL}?module=proxy&action=eth_blockNumber&apikey=${apiKey}`;

  const res = await axios.get(url);
  const hex = res.data.result;

  if (!hex || typeof hex !== "string") {
    throw new Error("Could not fetch latest block");
  }

  return BigInt(hex);
}