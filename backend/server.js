const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'personal_finance_tracker_local_secret_key_2026';

// --- Local Storage Paths ---
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function getUserDataPath(userId) {
    ensureDataDir();
    return path.join(DATA_DIR, `${userId}_data.json`);
}

function getUsers() {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
        initDefaultData();
    }
    try {
        const content = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(content || '[]');
    } catch (e) {
        console.error('Error reading users file:', e);
        return [];
    }
}

function saveUsers(users) {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function getUserData(userId) {
    const filePath = getUserDataPath(userId);
    if (!fs.existsSync(filePath)) {
        return { assets: [], transactions: [], goals: [], learnedMappings: {} };
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content || '{}');
    } catch (e) {
        console.error(`Error reading data for user ${userId}:`, e);
        return { assets: [], transactions: [], goals: [], learnedMappings: {} };
    }
}

function saveUserData(userId, data) {
    const filePath = getUserDataPath(userId);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function initDefaultData() {
    ensureDataDir();
    const demoHashedPassword = bcrypt.hashSync('password123', 10);
    const demoUser = {
        id: 'usr_demo_123',
        username: 'DemoUser',
        email: 'demo@example.com',
        password: demoHashedPassword,
        createdAt: new Date().toISOString()
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify([demoUser], null, 2), 'utf8');

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    const demoFinancialData = {
        assets: [
            { id: 101, name: 'HDFC Bank Savings', type: 'cash', purchasePrice: 50000, currentValue: 65000, quantity: 1 },
            { id: 102, name: 'Nifty 50 Index Fund', type: 'mutual_fund', purchasePrice: 120000, currentValue: 145000, quantity: 1 },
            { id: 103, name: 'Reliance Industries', type: 'stock', purchasePrice: 45000, currentValue: 52000, quantity: 20 },
            { id: 104, name: 'Sovereign Gold Bonds', type: 'gold', purchasePrice: 60000, currentValue: 72000, quantity: 10 }
        ],
        transactions: [
            { id: 201, date: `${year}-${month}-01`, merchant: 'Tech Corp Salary', amount: 85000, type: 'income', category: 'Salary' },
            { id: 202, date: `${year}-${month}-03`, merchant: 'House Rent', amount: 22000, type: 'expense', category: 'Bills' },
            { id: 203, date: `${year}-${month}-05`, merchant: 'Zomato & Dining', amount: 4200, type: 'expense', category: 'Food' },
            { id: 204, date: `${year}-${month}-08`, merchant: 'Electricity & Wifi', amount: 3100, type: 'expense', category: 'Bills' },
            { id: 205, date: `${year}-${month}-11`, merchant: 'Uber Commute', amount: 2400, type: 'expense', category: 'Transport' },
            { id: 206, date: `${year}-${month}-15`, merchant: 'Freelance Design', amount: 25000, type: 'income', category: 'Freelance' },
            { id: 207, date: `${year}-${month}-18`, merchant: 'Amazon Shopping', amount: 5500, type: 'expense', category: 'Shopping' }
        ],
        goals: [
            { id: 301, name: 'Emergency Fund', targetAmount: 200000, currentAmount: 140000, targetDate: `${year}-12-31`, category: 'Emergency' },
            { id: 302, name: 'Vacation to Japan', targetAmount: 150000, currentAmount: 60000, targetDate: `${year + 1}-05-01`, category: 'Travel' }
        ],
        learnedMappings: {
            'zomato': 'Food',
            'swiggy': 'Food',
            'uber': 'Transport',
            'amazon': 'Shopping'
        }
    };
    saveUserData('usr_demo_123', demoFinancialData);
}

// Initialize files if needed
ensureDataDir();
if (!fs.existsSync(USERS_FILE)) {
    initDefaultData();
}

// --- Middleware ---
app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Dev-Supabase-Redirect", "X-Correlation-ID", "X-Amzn-Trace-Id"]
}));

app.use(express.json());

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// --- Routes ---
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: '🚀 Personal Finance Tracker Backend is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    const users = getUsers();
    res.json({
        status: 'healthy',
        database: 'local_json_db',
        usersCount: users.length,
        timestamp: new Date().toISOString()
    });
});

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    console.log("📥 Signup request:", { username, email });

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim();

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        return res.status(409).json({ error: 'An account with this email already exists' });
    }
    if (users.some(u => u.username.toLowerCase() === normalizedUsername.toLowerCase())) {
        return res.status(409).json({ error: 'This username is already taken' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        // Initialize empty financial data for new user
        saveUserData(newUser.id, {
            assets: [],
            transactions: [],
            goals: [],
            learnedMappings: {}
        });

        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log("✅ User registered locally:", newUser.email);
        return res.status(201).json({
            ok: true,
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (err) {
        console.error("❌ Signup error:", err);
        return res.status(500).json({ error: 'Signup failed', details: err.message });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("🔐 Login request:", { email });

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log("✅ User logged in:", user.email);
        return res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error("❌ Login error:", err);
        return res.status(500).json({ error: 'Login error', details: err.message });
    }
});

// Current User Profile
app.get('/api/user', authenticateToken, (req, res) => {
    const users = getUsers();
    const user = users.find(u => u.id === req.user.id);
    if (user) {
        return res.json({ id: user.id, username: user.username, email: user.email });
    }
    return res.json({ id: req.user.id, username: req.user.username, email: req.user.email });
});

// Financial Data (Assets, Transactions, Goals, Learned Mappings)
app.get('/api/data', authenticateToken, (req, res) => {
    const data = getUserData(req.user.id);
    return res.json(data);
});

app.post('/api/data', authenticateToken, (req, res) => {
    const { assets, transactions, goals, learnedMappings } = req.body;
    const current = getUserData(req.user.id);
    const updated = {
        assets: Array.isArray(assets) ? assets : current.assets || [],
        transactions: Array.isArray(transactions) ? transactions : current.transactions || [],
        goals: Array.isArray(goals) ? goals : current.goals || [],
        learnedMappings: learnedMappings && typeof learnedMappings === 'object' ? learnedMappings : current.learnedMappings || {}
    };
    saveUserData(req.user.id, updated);
    return res.json({ success: true, updated: new Date().toISOString() });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Personal Finance Tracker Backend running on http://localhost:${PORT}`);
});
