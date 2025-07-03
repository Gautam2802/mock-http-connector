const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let users = [];
let roles = ['admin', 'hr_manager', 'viewer'];



app.get('/users', (req, res) => {
    res.json(users);
});


app.post('/user/create', (req, res) => {
  const { userId, password, role, notes } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const user = {
    userId,
    password,
    role,
    notes,
    createdAt: new Date()
  };

  users.push(user);

  res.json({ message: 'User created successfully', user });
});

app.get('/userroles', (req, res) => {
  const { username } = req.query; // this matches Pathlock XML

  const user = users.find(u => u.userId === username); // userId still in data
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ roles: user.roles });
});


app.post('/user/:userId/roles', (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    const user = users.find(u => u.userId === userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!roles.includes(role)) return res.status(400).json({ message: "Invalid role" });

    if (!user.roles.includes(role)) user.roles.push(role);

    res.json({ message: "Role assigned", user });
});

app.listen(port, () => {
    console.log(`Mock HTTP connector running at http://localhost:${port}`);
});