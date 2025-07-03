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
  const roleAssignments = [];

  users.forEach(user => {
    user.roles.forEach(role => {
      roleAssignments.push({
        Code: `${user.userId}-${role}`,
        Description: `Role ${role} assigned to ${user.userId}`,
        Identifier: `RID-${user.userId}-${role}`,
        UserName: user.userId,
        RoleName: role,
        IsChildRole: role.startsWith("CR") ? true : false,
        AssignDate: "2025-07-01 10:00:00",
        UntilDate: "2025-12-31 23:59:59",
        AssignmentBy: "admin@company.com",
        RoleAttributes: "READ_ONLY",
        RoleAttributesJson: JSON.stringify({ access: "read", level: "low" })
      });
    });
  });

  res.json(roleAssignments);
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