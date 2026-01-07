# Ethereum Transaction Confirmation Tracker
A robust, real-time Ethereum monitoring tool that tracks transaction confirmations with high-precision status updates and dynamic ETA calculations.

## Key Features
1. Real-Time Monitoring: Automated polling every 6 seconds to capture the fastest available blockchain updates.

2. High Water Mark Logic: Custom state-management logic that handles "out-of-sync" blockchain nodes, ensuring the UI never flickers or jumps backward. (Needed because not all nodes that are being called via Etherscan are up to date...)

3. Cache-Busting Architecture: Implements unique request signatures to bypass browser caching (304 Not Modified) for 100% data freshness.

4. Dynamic ETA: Real-time calculation of remaining time based on average Ethereum block intervals (~12s).

5. UI: Features a smooth-transition progress meter and detailed confirmation stats.

## 🛠️ Technical Implementation


**Distributed System Consistency**

One of the primary challenges was handling Etherscan's load-balanced node architecture. Occasionally (or more precisely - often), an API request would hit a "lagging" node, causing the confirmation count to temporarily drop.

The Solution: I implemented a Monotonic Progress Logic in the React layer. The application maintains a "High Water Mark" state, where it only accepts new data if the block confirmation count is strictly greater than the current displayed value.

**Network Efficiency & Rate Limiting**

To ensure the application remains within the Etherscan Free Tier limits while maintaining high responsiveness, I optimized the polling interval to 6 seconds. This "2x block speed" sampling rate maximizes the chance of catching a newly mined block immediately without triggering 429 Rate Limit errors.

## 📦 Tech Stack
**Frontend**: React, TypeScript, Vite

**Backend**: Node.js, Express, Axios

Blockchain API: [Etherscan](https://etherscan.io/myaccount) (Proxy & RPC modules)

## 🔧 Installation
1. Open your Terminal
1. Clone the repo using this command in your terminal:
```python
git clone https://github.com/sao-lee/crypto-confirmation-tracker.git
```
2. Setup Backend
```python
cd ../backend
```
_(changes the directory to the "backend" folder. You must be in this folder and then move to next steps)_
- **cp .env.example .env**  _(Copies the template to a real .env file. This is where you pass your API key that you get from Etherscan)_
- **npm install** 
- **Open the .env file and paste your Etherscan API key before running the next command**
- **npm run dev**

3. Setup Frontend
- **cd ../frontend**
- **npm install**
- **npm run dev**