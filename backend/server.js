const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { ethers } = require('ethers');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: './.env' });

const app = express();
const port = process.env.PORT || 5000;

// --- MongoDB Setup ---
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
    mongoose.connect(MONGO_URI).then(() => console.log("✅ MongoDB connected")).catch(err => console.error(err));
}

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    token: { type: String, unique: true, sparse: true },
    walletAddress: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", UserSchema);

const ApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: String,
    applicantAddress: String,
    schemeId: Number,
    schemeName: String,
    status: { type: String, default: 'Pending' }, // Pending, Approved, Disbursed
    appliedAt: { type: Date, default: Date.now },
    txHash: String
});
const Application = mongoose.model("Application", ApplicationSchema);

// --- Blockchain Configuration ---
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xFA02abb7e53Ac4e7bA8ae25532322dF8fBD1da28";

const SIMPLE_MODE = String(process.env.SIMPLE_CONTRACT || "").toLowerCase() === "true";
const ABI_SIMPLE = [
    "function owner() view returns (address)",
    "function depositFunds() payable",
    "function addBeneficiary(address,string,string)",
    "function approveBeneficiary(address)",
    "function disburseFunds(address,uint256)",
    "function getBeneficiaryDetails(address) view returns (string,string,bool,uint256)",
    "function getContractBalance() view returns (uint256)",
    "event BeneficiaryAdded(address indexed beneficiaryAddress, string name, string scheme)",
    "event BeneficiaryApproved(address indexed beneficiaryAddress)",
    "event FundsDisbursed(address indexed beneficiaryAddress, uint256 amount, string scheme)",
    "event FundsDeposited(address indexed depositor, uint256 amount)"
];
const ABI_FULL = [
    "function createScheme(string,uint256,uint256,uint256,uint256,uint8)",
    "function depositToScheme(uint256) payable",
    "function registerProfile(string,uint256,uint8,uint256)",
    "function applyForScheme(uint256)",
    "function owner() view returns (address)",
    "function schemeCount() view returns (uint256)",
    "function schemes(uint256) view returns (uint256 id, string name, uint256 budget, uint256 amountPerBeneficiary, uint256 maxIncomeThreshold, uint256 minAge, uint256 maxAge, uint8 genderRequirement, bool isActive)",
    "function beneficiaries(address) view returns (string name, uint256 age, uint8 gender, uint256 income, bool isRegistered, uint256 totalReceived)",
    "function getContractBalance() view returns (uint256)",
    "event SchemeCreated(uint256 indexed id, string name, uint256 budget)",
    "event FundsDistributed(uint256 indexed schemeId, address indexed beneficiary, uint256 amount)",
    "event FundsDeposited(address indexed sender, uint256 amount)"
];
const ABI = SIMPLE_MODE ? ABI_SIMPLE : ABI_FULL;

let provider, wallet, contract, ethersInitialized = false;
try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    ethersInitialized = true;
} catch (e) { console.error("Ethers init failed", e); }

// --- Admin Configuration ---
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
const ADMIN_WALLETS_ENV = (process.env.ADMIN_WALLETS || "").toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
const HARDCODED_ADMIN = "0xca24ce91e18f5a4646e25db91c01b7d5f21cf775";
const ADMIN_WALLETS = Array.from(new Set([...ADMIN_WALLETS_ENV, HARDCODED_ADMIN]));
function computeRoleForUser(user) {
    if (!user) return 'user';
    const email = (user.email || '').toLowerCase();
    const walletAddr = (user.walletAddress || '').toLowerCase();
    if ((email && ADMIN_EMAILS.includes(email)) || (walletAddr && ADMIN_WALLETS.includes(walletAddr))) {
        return 'admin';
    }
    return 'user';
}

// --- Middleware ---
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
// Basic security headers
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
});
app.use(express.json());
// Enforce X-Requested-With for state-changing requests
app.use((req, res, next) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        const h = req.get("X-Requested-With");
        if (!h) {
            return res.status(400).json({ message: "Missing required header" });
        }
    }
    next();
});
// Optional HTTPS enforcement behind proxy/load balancer
app.use((req, res, next) => {
    const enforce = String(process.env.ENFORCE_HTTPS || "").toLowerCase() === "true";
    if (!enforce) return next();
    const xfproto = (req.headers["x-forwarded-proto"] || "").toString().toLowerCase();
    if (xfproto && xfproto !== "https") {
        return res.status(400).json({ message: "HTTPS required" });
    }
    next();
});

// --- Simple Rate Limiter (in-memory) ---
function createRateLimiter({ windowMs = 60_000, max = 60 } = {}) {
    const hits = new Map();
    return (req, res, next) => {
        const key = `${req.ip}:${req.path}`;
        const now = Date.now();
        const windowStart = now - windowMs;
        const arr = hits.get(key) || [];
        const recent = arr.filter(ts => ts > windowStart);
        recent.push(now);
        hits.set(key, recent);
        if (recent.length > max) {
            return res.status(429).json({ message: "Too many requests, please try later" });
        }
        next();
    };
}
const authLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });
const adminLimiter = createRateLimiter({ windowMs: 60_000, max: 100 });
const contractLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });

// Apply limiters to route groups
app.use('/api/auth', authLimiter);
app.use('/api/admin', authenticateToken, adminLimiter);
app.use('/api/contract', (req, res, next) => {
    if (req.method === 'GET') return next();
    return contractLimiter(req, res, next);
});

async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Auth required" });
    const token = authHeader.split(' ')[1];
    const user = await User.findOne({ token });
    if (!user) return res.status(403).json({ message: "Invalid token" });
    const role = computeRoleForUser(user);
    if (user.role !== role) {
        user.role = role;
        await user.save();
    }
    req.user = user;
    next();
}

function authorizeAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
}

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        email = String(email).trim().toLowerCase();
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "Email already registered" });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
        await new User({ email, passwordHash, role }).save();
        return res.status(201).json({ message: "Registered" });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        email = String(email).trim().toLowerCase();
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });
        if (!user.passwordHash) {
            return res.status(400).json({ message: "Password login not set. Use wallet login." });
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: "Invalid credentials" });
        const token = crypto.randomBytes(32).toString('hex');
        user.token = token;
        user.role = computeRoleForUser(user);
        await user.save();
        return res.json({ id: user._id, email: user.email, token, role: user.role });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

app.post('/api/auth/wallet-login', async (req, res) => {
    const { address, signature } = req.body;
    const recovered = ethers.verifyMessage("Login to E-Fund System", signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) return res.status(401).json({ message: "Failed" });
    let user = await User.findOne({ email: address.toLowerCase() });
    if (!user) user = new User({ email: address.toLowerCase(), walletAddress: address });
    // Ensure walletAddress persists even if user existed previously
    user.walletAddress = address;
    const token = crypto.randomBytes(32).toString('hex');
    user.token = token;
    user.role = computeRoleForUser(user);
    await user.save();
    res.json({ id: user._id, email: user.email, token, role: user.role });
});

app.post('/api/auth/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(200).json({ message: "Logged out" });
        const token = authHeader.split(' ')[1];
        if (!token) return res.status(200).json({ message: "Logged out" });
        const user = await User.findOne({ token });
        if (user) {
            user.token = undefined;
            await user.save();
        }
        return res.json({ message: "Logged out" });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

app.get('/api/auth/validate', authenticateToken, (req, res) => {
    res.json({ id: req.user._id, email: req.user.email, role: req.user.role, walletAddress: req.user.walletAddress || null });
});

// --- Contract Routes ---
app.get('/api/contract/stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        if (!ethersInitialized) {
            return res.json({
                contractBalance: "0",
                totalSchemes: SIMPLE_MODE ? 0 : 0,
                totalApprovedBeneficiaries: userCount,
                totalFundsDisbursed: "0"
            });
        }
        const balance = await contract.getContractBalance();
        const count = SIMPLE_MODE ? 0n : await contract.schemeCount();
        res.json({
            contractBalance: ethers.formatEther(balance),
            totalSchemes: SIMPLE_MODE ? 0 : Number(count),
            totalApprovedBeneficiaries: userCount,
            totalFundsDisbursed: "0"
        });
    } catch (e) {
        const userCount = await User.countDocuments();
        return res.json({
            contractBalance: "0",
            totalSchemes: 0,
            totalApprovedBeneficiaries: userCount,
            totalFundsDisbursed: "0"
        });
    }
});

app.get('/api/contract/disbursements', async (req, res) => {
    try {
        if (!ethersInitialized) {
            return res.json([]);
        }
        let list = [];
        if (SIMPLE_MODE) {
            const filter = contract.filters.FundsDisbursed();
            const events = await contract.queryFilter(filter, -1000);
            const blocks = await Promise.all(events.map(e => provider.getBlock(e.blockNumber)));
            list = events.map((e, idx) => ({
                beneficiaryAddress: e.args[0],
                amount: ethers.formatEther(e.args[1]),
                scheme: e.args[2],
                timestamp: Number(blocks[idx]?.timestamp || 0),
                hash: e.transactionHash
            }));
        } else {
            const filter = contract.filters.FundsDistributed();
            const events = await contract.queryFilter(filter, -1000);
            const blocks = await Promise.all(events.map(e => provider.getBlock(e.blockNumber)));
            list = events.map((e, idx) => ({
                beneficiaryAddress: e.args[1],
                amount: ethers.formatEther(e.args[2]),
                schemeId: Number(e.args[0]),
                timestamp: Number(blocks[idx]?.timestamp || 0),
                hash: e.transactionHash
            }));
        }
        res.json(list);
    } catch (e) { res.json([]); }
});

// Admin: view all applications
app.get('/api/admin/applications', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const apps = await Application.find().sort({ appliedAt: -1 });
        res.json(apps);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/contract/create-scheme', authenticateToken, authorizeAdmin, async (req, res) => {
    const { name, amount, maxIncome, minAge, maxAge, gender } = req.body;
    try {
        if (!ethersInitialized) {
            return res.status(503).json({ message: "Blockchain not configured on server" });
        }
        if (SIMPLE_MODE) {
            return res.status(405).json({ message: "Not supported in simple contract mode" });
        }
        if (!name || typeof name !== "string") return res.status(400).json({ message: "Invalid scheme name" });
        if (!amount || Number(amount) <= 0) return res.status(400).json({ message: "Invalid amount" });
        if (!maxIncome || Number(maxIncome) < 0) return res.status(400).json({ message: "Invalid maxIncome" });
        const minA = Number(minAge), maxA = Number(maxAge);
        if (!Number.isFinite(minA) || !Number.isFinite(maxA) || minA < 0 || maxA < minA) return res.status(400).json({ message: "Invalid age range" });
        const g = Number(gender);
        if (!Number.isFinite(g) || g < 0 || g > 2) return res.status(400).json({ message: "Invalid gender" });
        try {
            const owner = await contract.owner();
            const serverAddr = await wallet.getAddress();
            if (owner.toLowerCase() !== serverAddr.toLowerCase()) {
                return res.status(412).json({ message: "Server wallet is not contract owner. Update PRIVATE_KEY to deployer address." });
            }
        } catch (e) {
            // If owner not available in ABI/network, continue but errors will be caught below
        }
        const tx = await contract.createScheme(name, ethers.parseEther(amount), ethers.parseEther(maxIncome), minAge, maxAge, gender);
        await tx.wait();
        res.json({ hash: tx.hash });
    } catch (e) { 
        const msg = e?.shortMessage || e?.message || "Create scheme failed";
        // Common OZ Ownable revert presents as CALL_EXCEPTION with missing revert data during estimateGas
        if (/owner/i.test(String(msg)) || /CALL_EXCEPTION/i.test(String(msg))) {
            return res.status(403).json({ message: "Only contract owner can create schemes. Ensure backend PRIVATE_KEY matches deployer." });
        }
        res.status(500).json({ message: msg }); 
    }
});

app.get('/api/contract/schemes', async (req, res) => {
    try {
        if (!ethersInitialized) {
            return res.json([]);
        }
        if (SIMPLE_MODE) {
            return res.json([]);
        }
        const count = await contract.schemeCount();
        const list = [];
        for (let i = 1; i <= count; i++) {
            const s = await contract.schemes(i);
            list.push({
                id: Number(s.id),
                name: s.name,
                budget: ethers.formatEther(s.budget),
                amount: ethers.formatEther(s.amountPerBeneficiary),
                maxIncome: ethers.formatEther(s.maxIncomeThreshold),
                minAge: Number(s.minAge),
                maxAge: Number(s.maxAge),
                gender: Number(s.genderRequirement),
                isActive: s.isActive
            });
        }
        res.json(list);
    } catch (e) { res.json([]); }
});

app.get('/api/contract/admin-status', async (req, res) => {
    try {
        if (!ethersInitialized) {
            return res.json({ address: null, balance: null });
        }
        const address = await wallet.getAddress();
        const bal = await provider.getBalance(address);
        return res.json({ address, balance: ethers.formatEther(bal) });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});
app.get('/api/contract/meta', async (req, res) => {
    try {
        if (!ethersInitialized) {
            return res.json({ contractAddress: null, chainId: null });
        }
        const net = await provider.getNetwork();
        return res.json({ contractAddress: CONTRACT_ADDRESS, chainId: Number(net.chainId) });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});
// Diagnostics for admin troubleshooting
app.get('/api/diagnostics', async (req, res) => {
    try {
        const diag = {
            ethersInitialized,
            contractAddress: CONTRACT_ADDRESS || null,
            networkChainId: null,
            serverWallet: null,
            contractOwner: null,
            ownerMatches: null,
            adminEmailsCount: ADMIN_EMAILS.length,
            adminWalletsCount: ADMIN_WALLETS.length
        };
        if (ethersInitialized) {
            try {
                const net = await provider.getNetwork();
                diag.networkChainId = Number(net.chainId);
            } catch {}
            try {
                const serverAddr = await wallet.getAddress();
                diag.serverWallet = serverAddr;
            } catch {}
            try {
                const owner = await contract.owner();
                diag.contractOwner = owner;
                if (diag.serverWallet) {
                    diag.ownerMatches = owner.toLowerCase() === diag.serverWallet.toLowerCase();
                }
            } catch {}
        }
        res.json(diag);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});
app.post('/api/contract/register-profile', authenticateToken, async (req, res) => {
    const { name, age, gender, income } = req.body;
    try {
        if (!ethersInitialized) {
            return res.status(503).json({ message: "Blockchain not configured on server" });
        }
        if (SIMPLE_MODE) {
            return res.status(405).json({ message: "Not supported in simple contract mode" });
        }
        const tx = await contract.registerProfile(name, age, gender, ethers.parseEther(income));
        await tx.wait();
        res.json({ hash: tx.hash });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/contract/apply-scheme', authenticateToken, async (req, res) => {
    const { schemeId } = req.body;
    try {
        if (!ethersInitialized) {
            return res.status(503).json({ message: "Blockchain not configured on server" });
        }
        if (SIMPLE_MODE) {
            return res.status(405).json({ message: "Not supported in simple contract mode" });
        }
        const s = await contract.schemes(schemeId);
        const tx = await contract.applyForScheme(schemeId);
        await tx.wait();
        
        // Save application to DB
        await new Application({
            userId: req.user._id,
            userEmail: req.user.email,
            applicantAddress: req.user.walletAddress || null,
            schemeId,
            schemeName: s.name,
            txHash: tx.hash
        }).save();

        res.json({ hash: tx.hash });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Record an application that was executed client-side with wallet signer
app.post('/api/applications/record', authenticateToken, async (req, res) => {
    const { schemeId, txHash } = req.body;
    try {
        let schemeName = "";
        if (ethersInitialized) {
            const s = await contract.schemes(schemeId);
            schemeName = s.name;
        }
        await new Application({
            userId: req.user._id,
            userEmail: req.user.email,
            applicantAddress: req.user.walletAddress || null,
            schemeId,
            schemeName,
            txHash
        }).save();
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.get('/api/contract/my-applications', authenticateToken, async (req, res) => {
    try {
        const apps = await Application.find({ userId: req.user._id }).sort({ appliedAt: -1 });
        res.json(apps);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin route to see all applications
app.get('/api/admin/applications', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const apps = await Application.find().sort({ appliedAt: -1 });
        res.json(apps);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin route to see all users (beneficiaries)
app.get('/api/admin/beneficiaries', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.find({}, 'email walletAddress createdAt').sort({ createdAt: -1 });
        res.json(users);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Authenticated users: view beneficiaries list (limited fields)
app.get('/api/beneficiaries', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({}, 'email walletAddress createdAt').sort({ createdAt: -1 });
        res.json(users);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin route to list users with roles
app.get('/api/admin/users', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.find({}, 'email walletAddress role createdAt').sort({ createdAt: -1 });
        res.json(users);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/contract/approve-beneficiary', authenticateToken, authorizeAdmin, async (req, res) => {
    const { applicationId } = req.body;
    try {
        if (applicationId) {
            await Application.findByIdAndUpdate(applicationId, { status: 'Approved' });
        }
        return res.json({ ok: true });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/contract/deposit', authenticateToken, authorizeAdmin, async (req, res) => {
    const { schemeId, amount } = req.body;
    try {
        if (!ethersInitialized) {
            return res.status(503).json({ message: "Blockchain not configured on server" });
        }
        let tx;
        if (SIMPLE_MODE) {
            tx = await contract.depositFunds({ value: ethers.parseEther(amount) });
        } else {
            tx = await contract.depositToScheme(schemeId, { value: ethers.parseEther(amount) });
        }
        await tx.wait();
        res.json({ hash: tx.hash });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/contract/beneficiary/:address', async (req, res) => {
    try {
        if (!ethersInitialized) {
            return res.status(404).json({ message: "Not found" });
        }
        if (SIMPLE_MODE) {
            const [name, scheme, isApproved, totalReceived] = await contract.getBeneficiaryDetails(req.params.address);
            if (!name) return res.status(404).json({ message: "Not found" });
            res.json({
                name,
                scheme,
                approved: Boolean(isApproved),
                totalReceived: ethers.formatEther(totalReceived)
            });
        } else {
            const b = await contract.beneficiaries(req.params.address);
            if (!b.isRegistered) return res.status(404).json({ message: "Not found" });
            res.json({
                name: b.name,
                age: Number(b.age),
                gender: Number(b.gender),
                income: ethers.formatEther(b.income),
                totalReceived: ethers.formatEther(b.totalReceived),
                approved: true
            });
        }
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Simple contract owner functions
app.post('/api/contract/add-beneficiary', authenticateToken, authorizeAdmin, async (req, res) => {
    const { address, name, scheme } = req.body;
    try {
        if (!SIMPLE_MODE) return res.status(405).json({ message: "Not supported in current contract mode" });
        if (!ethersInitialized) return res.status(503).json({ message: "Blockchain not configured on server" });
        if (!/^0x[a-fA-F0-9]{40}$/.test(String(address))) return res.status(400).json({ message: "Invalid address" });
        if (!name || !scheme) return res.status(400).json({ message: "Missing data" });
        const owner = await contract.owner();
        const serverAddr = await wallet.getAddress();
        if (owner.toLowerCase() !== serverAddr.toLowerCase()) return res.status(403).json({ message: "Only owner can add beneficiary" });
        const tx = await contract.addBeneficiary(address, String(name), String(scheme));
        await tx.wait();
        res.json({ hash: tx.hash });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/contract/approve-beneficiary-chain', authenticateToken, authorizeAdmin, async (req, res) => {
    const { address } = req.body;
    try {
        if (!SIMPLE_MODE) return res.status(405).json({ message: "Not supported in current contract mode" });
        if (!ethersInitialized) return res.status(503).json({ message: "Blockchain not configured on server" });
        if (!/^0x[a-fA-F0-9]{40}$/.test(String(address))) return res.status(400).json({ message: "Invalid address" });
        const owner = await contract.owner();
        const serverAddr = await wallet.getAddress();
        if (owner.toLowerCase() !== serverAddr.toLowerCase()) return res.status(403).json({ message: "Only owner can approve beneficiary" });
        const tx = await contract.approveBeneficiary(address);
        await tx.wait();
        res.json({ hash: tx.hash });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/contract/disburse', authenticateToken, authorizeAdmin, async (req, res) => {
    const { address, amount } = req.body;
    try {
        if (!SIMPLE_MODE) return res.status(405).json({ message: "Not supported in current contract mode" });
        if (!ethersInitialized) return res.status(503).json({ message: "Blockchain not configured on server" });
        if (!/^0x[a-fA-F0-9]{40}$/.test(String(address))) return res.status(400).json({ message: "Invalid address" });
        const eth = String(amount);
        if (!eth || Number(eth) <= 0) return res.status(400).json({ message: "Invalid amount" });
        const owner = await contract.owner();
        const serverAddr = await wallet.getAddress();
        if (owner.toLowerCase() !== serverAddr.toLowerCase()) return res.status(403).json({ message: "Only owner can disburse" });
        const tx = await contract.disburseFunds(address, ethers.parseEther(eth));
        await tx.wait();
        res.json({ hash: tx.hash });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/tx/:hash', async (req, res) => {
    try {
        if (!ethersInitialized) return res.status(503).json({ message: "Blockchain not configured on server" });
        const receipt = await provider.getTransactionReceipt(req.params.hash);
        if (!receipt) return res.json({ status: 'pending' });
        const latest = await provider.getBlockNumber();
        const confirmations = Number(latest - receipt.blockNumber);
        res.json({ status: receipt.status === 1 ? 'success' : 'failed', blockNumber: Number(receipt.blockNumber), confirmations });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

async function estimateCost(gas) {
    const fee = await provider.getFeeData();
    const g = BigInt(gas);
    let wei;
    if (fee.maxFeePerGas) {
        wei = g * fee.maxFeePerGas;
    } else if (fee.gasPrice) {
        wei = g * fee.gasPrice;
    } else {
        wei = g * ethers.parseUnits("1", "gwei");
    }
    return { gas: g.toString(), costEth: ethers.formatEther(wei), gasPrice: fee.gasPrice?.toString() || null, maxFeePerGas: fee.maxFeePerGas?.toString() || null, maxPriorityFeePerGas: fee.maxPriorityFeePerGas?.toString() || null };
}

app.post('/api/contract/estimate-deposit', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        if (!ethersInitialized) return res.status(503).json({ message: "Blockchain not configured on server" });
        const { amount, schemeId } = req.body || {};
        if (!amount || Number(amount) <= 0) return res.status(400).json({ message: "Invalid amount" });
        let gas;
        if (SIMPLE_MODE) {
            gas = await contract.estimateGas.depositFunds({ value: ethers.parseEther(String(amount)) });
        } else {
            const id = BigInt(Number(schemeId || 1));
            gas = await contract.estimateGas.depositToScheme(id, { value: ethers.parseEther(String(amount)) });
        }
        const fee = await estimateCost(gas);
        res.json(fee);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/contract/estimate-add', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        if (!ethersInitialized) return res.status(503).json({ message: "Blockchain not configured on server" });
        if (!SIMPLE_MODE) return res.status(405).json({ message: "Not supported in current contract mode" });
        const { address, name, scheme } = req.body || {};
        if (!/^0x[a-fA-F0-9]{40}$/.test(String(address))) return res.status(400).json({ message: "Invalid address" });
        if (!name || !scheme) return res.status(400).json({ message: "Missing data" });
        const gas = await contract.estimateGas.addBeneficiary(address, String(name), String(scheme));
        const fee = await estimateCost(gas);
        res.json(fee);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/contract/estimate-approve', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        if (!ethersInitialized) return res.status(503).json({ message: "Blockchain not configured on server" });
        if (!SIMPLE_MODE) return res.status(405).json({ message: "Not supported in current contract mode" });
        const { address } = req.body || {};
        if (!/^0x[a-fA-F0-9]{40}$/.test(String(address))) return res.status(400).json({ message: "Invalid address" });
        const gas = await contract.estimateGas.approveBeneficiary(address);
        const fee = await estimateCost(gas);
        res.json(fee);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/contract/estimate-disburse', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        if (!ethersInitialized) return res.status(503).json({ message: "Blockchain not configured on server" });
        if (!SIMPLE_MODE) return res.status(405).json({ message: "Not supported in current contract mode" });
        const { address, amount } = req.body || {};
        if (!/^0x[a-fA-F0-9]{40}$/.test(String(address))) return res.status(400).json({ message: "Invalid address" });
        if (!amount || Number(amount) <= 0) return res.status(400).json({ message: "Invalid amount" });
        const gas = await contract.estimateGas.disburseFunds(address, ethers.parseEther(String(amount)));
        const fee = await estimateCost(gas);
        res.json(fee);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => console.log(`🚀 Backend on ${port}`));
}

module.exports = { app, computeRoleForUser, User, __attachContractForTest: (p, w, c) => { provider = p; wallet = w; contract = c; ethersInitialized = true; } };
