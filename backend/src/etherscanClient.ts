import axios from "axios";

// Updated to V2 Endpoint
const ETHERSCAN_BASE_URL = "https://api.etherscan.io/v2/api";
const CHAIN_ID = "1"; 

export async function getEthTxReceipt(txHash: string) {
  const cleanHash = txHash.trim().toLowerCase();
  const apiKey = (process.env.ETHERSCAN_API_KEY || "").trim();

  try {
    const res = await axios.get(ETHERSCAN_BASE_URL, {
      params: {
        chainid: CHAIN_ID, // Required for V2
        module: "proxy",
        action: "eth_getTransactionReceipt",
        txhash: cleanHash,
        apikey: apiKey,
      },
    });

    return res.data.result || null;
  } catch (error) {
    console.error("Axios error in getEthTxReceipt:", error);
    return null;
  }
}

export async function getEthLatestBlockNumber(): Promise<bigint> {
  const apiKey = (process.env.ETHERSCAN_API_KEY || "").trim();

  const res = await axios.get(ETHERSCAN_BASE_URL, {
    params: {
      chainid: CHAIN_ID, // Required for V2
      module: "proxy",
      action: "eth_blockNumber",
      apikey: apiKey,
    },
  });

  const hex = res.data.result;

  // Check if Etherscan returned an error message instead of a result
  if (!hex || typeof hex !== "string" || !hex.startsWith("0x")) {
    console.error("Etherscan V2 Error Response:", res.data);
    throw new Error("Could not fetch latest block from V2 API");
  }

  return BigInt(hex);
}