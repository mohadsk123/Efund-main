# eFund Sepolia DApp – Setup & Verification

Environment variables (.env):
- RPC_URL: Sepolia RPC endpoint (e.g. https://eth-sepolia.g.alchemy.com/v2/KEY)
- PRIVATE_KEY: Admin wallet private key for contract owner actions
- CONTRACT_ADDRESS: FundDistribution contract address on Sepolia
- MONGO_URI: Optional for server persistence

Backend (Truffle & Node):
- cd backend
- npx truffle compile
- npx truffle migrate --network sepolia
- node server.js

REST endpoints:
- POST /api/scheme – admin addScheme(name, budgetWei, deadlineTs)
- POST /api/apply – beneficiary applyToScheme(schemeId, ipfsHash)
- GET /api/schemes – list on-chain schemes (simple mode)
- GET /api/diagnostics – server/network diagnostics

Frontend:
- npm run dev
- Admin: Add Scheme on Sepolia via MetaMask in AdminSchemes
- Beneficiary: Apply to Scheme in Schemes with IPFS hash

Verification:
- truffle test
- Create a scheme, then apply; view tx on https://sepolia.etherscan.io/
