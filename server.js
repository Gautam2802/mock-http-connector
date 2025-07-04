const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());


let users = [
  {
    userId: "Gautam",
    password: "123456",
    role: "super_admin",
    notes: "Default admin user",
    roles: ["admin"],
    isLocked: false,
    createdAt: new Date()
  }
];
let roles = ['super_admin','admin', 'hr_manager', 'viewer'];


let currentAccessToken = null;

// OAuth2 token endpoint
app.post('/token', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.userId === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Always generate a new access token
    const token = `mock-token-${Date.now()}`;
    currentAccessToken = token;

    res.json({ access_token: token, token_type: 'bearer', expires_in: 3600 });
});

// Middleware to check token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== currentAccessToken) {
        return res.status(401).json({ message: 'Unauthorized or expired token' });
    }

    next();
}

app.get('/users', authenticateToken, (req, res) => {
    res.json(users);
});


app.post('/user/create', authenticateToken, (req, res) => {
  const { userId, password, role, notes } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const user = {
    userId,
    password,
    role,
    notes,
    roles:[],
    createdAt: new Date()
  };

  users.push(user);

  res.json({ message: 'User created successfully', user });
});

app.post('/user/:userId/roles', authenticateToken, (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    const user = users.find(u => u.userId === userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!roles.includes(role)) return res.status(400).json({ message: "Invalid role" });

    // ✅ Initialize roles array if not present
    if (!Array.isArray(user.roles)) {
        user.roles = [];
    }

    // ✅ Prevent duplicate role assignment
    if (!user.roles.includes(role)) {
        user.roles.push(role);
    }

    res.json({ message: "Role assigned", user });
});

app.get('/user/:userId/roles', authenticateToken, (req, res) => {
    const { userId } = req.params;

    const user = users.find(u => u.userId === userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If roles are not defined, return empty array
    const userRoles = Array.isArray(user.roles) ? user.roles : [];

    const formattedRoles = userRoles.map(role => ({
    userId,
    roleName: role
}));

res.json(formattedRoles);

});

// Lock user
app.post('/user/:userId/lock', authenticateToken, (req, res) => {
    const { userId } = req.params;
    const user = users.find(u => u.userId === userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.isLocked = true;
    res.status(200).json({ message: `User ${userId} locked.` });
});

// Unlock user
app.post('/user/:userId/unlock', authenticateToken, (req, res) => {
    const { userId } = req.params;
    const user = users.find(u => u.userId === userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.isLocked = false;
    res.status(200).json({ message: `User ${userId} unlocked.` });
});


app.listen(port, () => {
    console.log(`Mock HTTP connector running at http://localhost:${port}`);
});