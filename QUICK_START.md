# Quick Start Guide - Using the Vault

## What You'll See in the UI

### 1. Start the App

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

### 2. Go to Main Dashboard
Open: `http://localhost:3001`

**What you'll see:**
- Main dashboard with transactions
- NEW: **"View Vault"** button in the header (🛡️ icon)

### 3. Click "View Vault"
This takes you to: `http://localhost:3001/vault`

**You'll see:**
- 🟢 **VAULT: COMPLIANT** (big green banner at top)
- **Total A UM**: 0 mETH (starts at zero)
- **🛡️ Curator has NO withdrawal rights** (security badge)
- **💧 Get Test mETH** button (top right)
- **🔒 Record PAC** button (in Private Activity section)

---

## How to Test (3 Clicks!)

### Step 1: Get Test Tokens
Click: **💧 Get Test mETH** button

**What happens:**
1. MetaMask pops up - approve connection
2. Backend mints 1000 mETH to your wallet
3. Alert shows: "✅ Claimed 1000 mETH!"

*You'll see this in backend logs:*
```
[mETH Faucet] 💧 Minting MockMETH...
[mETH Faucet] To: 0x...
[mETH Faucet] Amount: 1000.0 mETH
[mETH Faucet] ✅ Tokens minted successfully!
```

### Step 2: Record a Private Activity
Click: **🔒 Record PAC** button

**What happens:**
1. MetaMask pops up - approve connection
2. Backend records a Private Activity Commitment
3. Alert shows: "✅ PAC Recorded! Private activity is hidden on-chain."
4. Page refreshes and you see the new PAC hash in the list

*You'll see this in backend logs:*
```
[PAC] 🔒 Recording Private Activity Commitment...
[PAC] Curator: 0x...
[PAC] PAC Hash: 0x1234...
[PAC] ✅ PAC Recorded on-chain!
[PAC] NOTE: Trade details are PRIVATE - only commitment hash is stored
```

**In the UI you'll see:**
- PAC hash displayed: `0x7f3a...2b9c`
- Label: **HIDDEN** (orange badge)
- NO trade details, NO amounts - just the hash

### Step 3: View in Auditor Dashboard
Go to: `http://localhost:3001/auditor`

**What you'll see:**
- Your PAC transaction in the list
- Click it to verify compliance
- Generate ZK proofs (KYC, AML, Yield)
- Proof that activity is compliant BUT private

---

## Demo Script (< 3 minutes)

**Opening (30s):**
"This is a curator vault on Mantle managing mETH with transaction-level privacy."

Point to:
- 🟢 VAULT: COMPLIANT (big green banner)
- Total AUM (publicly visible)
- 🛡️ Curator has NO withdrawal rights (security)

**Action (60s):**
1. Click "💧 Get Test mETH" → Show minting
2. Click "🔒 Record PAC" → Show recording
3. Refresh → Point to PAC hash (HIDDEN label)
4. "Trade happened, but details are private. Only hash is public."

**Proof (45s):**
5. Go to Auditor Dashboard
6. Find PAC transaction
7. Verify compliance proofs
8. "Fully compliant, fully private!"

**Closing (15s):**
Point to Mantle callout:
"$0.03 per proof on Mantle vs $87 on Ethereum L1. Only works economically here."

**Total: ~2:30** ✅

---

## What Makes It Work

**Privacy:**
- Individual trades: HIDDEN ❌
- Position sizes: HIDDEN ❌
- Strategy details: HIDDEN ❌
- PAC hash: PUBLIC ✅ (but meaningless without context)
- Total AUM: PUBLIC ✅
- Compliance status: PUBLIC ✅

**Security:**
- Curator CANNOT withdraw funds (enforced by smart contract)
- Only depositors can withdraw
- All actions logged with PACs
- ZK proofs verify compliance without revealing details

---

## That's It!

Everything is in the UI now - no scripts needed. Just click buttons and watch the magic happen! 🎉
