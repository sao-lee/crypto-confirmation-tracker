// backend/src/server.ts
import dotenv from "dotenv";
// 1. Initialize dotenv at the absolute top
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors"; 
import {
  getEthLatestBlockNumber,
  getEthTxReceipt,
} from "./etherscanClient";


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const AVG_BLOCK_TIME_SEC = 12;

interface TxStatusResponse {
  status: "not_found" | "pending" | "confirming" | "confirmed";
  confirmations: number;
  targetConfirmations: number;
  progressPercent: number;
  txBlockNumber?: string | null;
  latestBlockNumber?: string;
  etaSeconds?: number;
}

app.get("/api/eth-tx-status", async (req: Request, res: Response) => {
  try {
    const txHash = req.query.txHash as string;
    const targetConfirmations = parseInt((req.query.targetConfirmations as string) || "50", 10);

    if (!txHash) {
      return res.status(400).json({ error: "txHash query param is required" });
    }

    // Log incoming requests for visibility in terminal
    console.log(`[API Request] Hash: ${txHash.substring(0, 10)}...`);

    const receipt = await getEthTxReceipt(txHash);

    console.log("--- DEBUG START ---");
    console.log("Transaction Hash:", txHash);
    console.log("Receipt found?:", receipt ? "YES" : "NO");
    if (receipt) console.log("Block Number from Receipt:", receipt.blockNumber);
    console.log("--- DEBUG END ---");
    
    if (!receipt) {
      const latest = await getEthLatestBlockNumber();
      return res.json({
        status: "not_found",
        confirmations: 0,
        targetConfirmations,
        progressPercent: 0,
        txBlockNumber: null,
        latestBlockNumber: latest.toString(16),
        etaSeconds: targetConfirmations * AVG_BLOCK_TIME_SEC,
      });
    }

    if (!receipt.blockNumber) {
      const latest = await getEthLatestBlockNumber();
      return res.json({
        status: "pending",
        confirmations: 0,
        targetConfirmations,
        progressPercent: 0,
        txBlockNumber: null,
        latestBlockNumber: latest.toString(16),
        etaSeconds: targetConfirmations * AVG_BLOCK_TIME_SEC,
      });
    }

    const txBlock = BigInt(receipt.blockNumber);
    const latestBlock = await getEthLatestBlockNumber();

    const rawDiff = latestBlock - txBlock + 1n;
    const confirmations = Number(rawDiff < 0n ? 0n : rawDiff);

    const progress = confirmations >= targetConfirmations ? 1 : confirmations / targetConfirmations;
    const remaining = Math.max(targetConfirmations - confirmations, 0);
    const etaSeconds = remaining * AVG_BLOCK_TIME_SEC;

    const status: TxStatusResponse["status"] = confirmations >= targetConfirmations ? "confirmed" : "confirming";

    return res.json({
      status,
      confirmations,
      targetConfirmations,
      progressPercent: Math.round(progress * 100),
      txBlockNumber: txBlock.toString(16),
      latestBlockNumber: latestBlock.toString(16),
      etaSeconds,
    });
  } catch (e: any) {
    console.error("Error in /api/eth-tx-status:", e.message);
    return res.status(500).json({ error: e.message || "Internal error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
  console.log(`🔑 API Key Status: ${process.env.ETHERSCAN_API_KEY ? "CONFIGURED ✅" : "MISSING ❌"}`);
});