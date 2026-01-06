import React, { useState } from "react";
import { PaymentStatusMeter } from "./components/PaymentStatusMeter";

const App: React.FC = () => {
  const [txHashInput, setTxHashInput] = useState("");
  const [txHashToTrack, setTxHashToTrack] = useState("");
  const [targetConfirmations, setTargetConfirmations] = useState(50);

  const handleStartTracking = (e: React.FormEvent) => {
    e.preventDefault();
    setTxHashToTrack(txHashInput.trim());
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        paddingTop: 40,
      }}
    >
      <div style={{ color: "#000000ff",width: "100%", maxWidth: 600, padding: "0 16px" }}>
        <h2
          style={{
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          ETH Payment Progress Demo
        </h2>

        <form
          onSubmit={handleStartTracking}
          style={{
            marginBottom: 16,
            padding: 16,
            borderRadius: 12,
            background: "#1c1b1bff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <label
            style={{ display: "block", fontSize: 14, marginBottom: 4, color: "white" }}
          >
            Ethereum Tx Hash
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={txHashInput}
            onChange={(e) => setTxHashInput(e.target.value)}
            style={{
              width: "95%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #2b2a2aff",
              fontSize: 14,
              marginBottom: 12,
            }}
          />

          <label
            style={{ display: "block", fontSize: 14, marginBottom: 4, color: "white" }}
          >
            Target Confirmations
          </label>
          <input
            type="number"
            min={1}
            value={targetConfirmations}
            onChange={(e) => setTargetConfirmations(Number(e.target.value))}
            style={{
              width: "95%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #090909ff",
              fontSize: 14,
              marginBottom: 12,
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: 4,
              padding: "8px 14px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(90deg, #ff9634ff, #ff9634ff)",
              color: "#fffdfdff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Start / Refresh Tracking
          </button>
        </form>

        <PaymentStatusMeter
          txHash={txHashToTrack}
          targetConfirmations={targetConfirmations}
          backendBaseUrl="http://localhost:4000"
        />
      </div>
    </div>
  );
};

export default App;
