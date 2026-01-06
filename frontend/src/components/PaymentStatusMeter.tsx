import React, { useEffect, useState } from "react";

// Types
type Status = "not_found" | "pending" | "confirming" | "confirmed";

interface TxStatusResponse {
  status: Status;
  confirmations: number;
  targetConfirmations: number;
  progressPercent: number;
  txBlockNumber?: string | null;
  latestBlockNumber?: string;
  etaSeconds?: number;
}

interface Props {
  txHash: string;
  targetConfirmations?: number;
  pollIntervalMs?: number;
  backendBaseUrl?: string;
}

export const PaymentStatusMeter: React.FC<Props> = ({
  txHash,
  targetConfirmations = 50,
  pollIntervalMs = 6000,
  backendBaseUrl = "http://localhost:4000",
}) => {
  const [data, setData] = useState<TxStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!txHash) return;
    let intervalId: number | null = null;

    const fetchStatus = async () => {
      try {
        const timestamp = Date.now();
        const url = `${backendBaseUrl}/api/eth-tx-status?txHash=${txHash}&targetConfirmations=${targetConfirmations}&t=${timestamp}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: TxStatusResponse = await res.json();

        setData((prevData) => {
          if (!prevData) return json;
          if (json.status === "confirmed") return json;
          // High Water Mark Logic
          if (json.confirmations > prevData.confirmations) return json;
          return prevData;
        });

        if (json.status === "confirmed" && intervalId) {
          window.clearInterval(intervalId);
        }
      } catch (e: any) {
        setError(e.message || "Failed to fetch status");
      }
    };

    fetchStatus();
    intervalId = window.setInterval(fetchStatus, pollIntervalMs);
    return () => { if (intervalId) window.clearInterval(intervalId); };
  }, [txHash, targetConfirmations, pollIntervalMs, backendBaseUrl]);

  // --- HELPER FUNCTIONS ---
  const formatEta = (seconds?: number) => {
    if (seconds == null || seconds <= 0) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins <= 0) return `${secs}s remaining (approx.)`;
    return `${mins}m ${secs}s remaining (approx.)`;
  };

  const getStatusText = () => {
    if (!data) return "Connecting to network...";
    switch (data.status) {
      case "not_found": return "Searching for transaction...";
      case "pending": return "Transaction found! Waiting to be mined...";
      case "confirming": return `Confirming on-chain...`;
      case "confirmed": return "Transaction Confirmed! ✅";
      default: return "Unknown status";
    }
  };

  const progressPercent = data ? data.progressPercent : 0;

  return (
    <div style={{ 
      padding: "24px", 
      border: "1px solid #eee", 
      borderRadius: "16px", 
      maxWidth: "400px", 
      backgroundColor: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      fontFamily: "system-ui, sans-serif"
    }}>
      <h3 style={{ margin: "0 0 16px 0", color: "#111" }}>Ethereum Tracker</h3>
      
      {/* Status Title */}
      <p style={{ margin: "0 0 8px 0", color: "#111", fontWeight: "600", fontSize: "16px" }}>
        {getStatusText()}
      </p>

      {/* Progress Bar Container */}
      <div style={{ width: "100%", background: "#f0f0f0", height: "12px", borderRadius: "6px", marginBottom: "8px", overflow: "hidden" }}>
        <div style={{ 
          width: `${progressPercent}%`, 
          background: "linear-gradient(90deg, #ff9634, #ffb36b)", 
          height: "100%", 
          borderRadius: "6px",
          transition: "width 1.5s ease-in-out" 
        }} />
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666", fontWeight: "500" }}>
        <span>{data ? `${data.confirmations}/${data.targetConfirmations}` : "0/50"} confirmations</span>
        <span>{progressPercent}%</span>
      </div>

      {/* ETA Section */}
      {data && data.status !== "confirmed" && (
        <div style={{ 
          marginTop: "20px", 
          padding: "12px", 
          backgroundColor: "#fff9f2", 
          borderRadius: "8px",
          border: "1px solid #ffe8d1",
          textAlign: "center"
        }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#ff9634", fontWeight: "600" }}>
            {formatEta(data.etaSeconds)}
          </p>
        </div>
      )}

      {error && (
        <p style={{ color: "#d93025", fontSize: "12px", marginTop: "12px", textAlign: "center" }}>
          Error: {error}
        </p>
      )}

      <p style={{ marginTop: "16px", fontSize: "10px", color: "#aaa", textAlign: "center" }}>
        Network: Ethereum Mainnet • Polling: {pollIntervalMs / 1000}s
      </p>
    </div>
  );
};