# Pre-Demo Checklist (Run 1 Hour Before)

## 🔴 CRITICAL (Must Pass)
- [ ] Backend running (`cd backend && npm run dev`)
- [ ] Frontend running (`cd frontend && npm run dev`)
- [ ] MetaMask connected to Mantle Sepolia (Chain ID: 5003)
- [ ] MetaMask has testnet MNT
- [ ] Private key in `backend/.env` is valid (not placeholder)

## ⚡ Performance Tests
- [ ] Click "Verify AML" → Completes in <5 seconds
- [ ] Terminal logs appear in real-time (not buffered)
- [ ] Mantle Explorer link opens immediately
- [ ] Auditor Dashboard loads in <2 seconds

## 🎨 Visual Polish
- [ ] Terminal font size ≥ 14px (readable from 6 feet away)
- [ ] Terminal has black background, green text
- [ ] Amount field shows "blurred" or "privacy" indicator
- [ ] Commitment hash visible after submit
- [ ] Button labels say "Prepare" not "Generate"

## 📹 Safety Net
- [ ] Take screenshot of working KYC verification
- [ ] Take screenshot of working AML verification (with logs)
- [ ] Take screenshot of Mantle Explorer showing AuditCompleted event
- [ ] Record 1-minute video of full flow (backup if demo fails)

## 🧪 Test Cases
### Success Case
- [ ] User submits transaction → Commitment hash shown
- [ ] Auditor clicks "Verify AML" → Proof generates → TX hash shown
- [ ] Explorer link works → AuditCompleted event visible

### Failure Case (Demo "Privacy ≠ Immunity")
- [ ] Change user address to sanctioned one
- [ ] AML proof generation fails
- [ ] Error shown in terminal: "Sanctioned address detected"

## 🎤 Talking Points Memorized
- [ ] "Built on Mantle v2 Skadi"
- [ ] "KYC/Yield off-chain, AML on-chain—intentional cost design"
- [ ] "95% cost reduction vs Ethereum L1"
- [ ] "Privacy doesn't mean immunity"

## ✅ Final Check
Before judges arrive:
1. Clear browser cache
2. Restart backend/frontend
3. Connect MetaMask
4. Run through demo once
5. Close all other browser tabs
6. Increase terminal font to maximum readable size
7. Position terminal window in visible area

**If all ✅ → You're ready. Good luck!** 🍀
