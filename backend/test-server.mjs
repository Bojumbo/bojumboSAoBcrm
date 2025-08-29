import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const users = [
  { id: 1, email: 'admin@example.com', password: 'admin123', role: 'admin', first_name: 'Admin', last_name: 'User' },
  { id: 2, email: 'ivan.p@example.com', password: 'head123', role: 'head', first_name: 'Іван', last_name: 'Петров' },
  { id: 3, email: 'maria.i@example.com', password: 'manager123', role: 'manager', first_name: 'Марія', last_name: 'Іванова' }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    'test-secret-key',
    { expiresIn: '24h' }
  );
  
  res.json({
    user: {
      manager_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    },
    token
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, 'test-secret-key');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({
      manager_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Test endpoints
app.get('/api/managers', (req, res) => {
  res.json({
    data: users.map(u => ({
      manager_id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      role: u.role
    })),
    total: users.length,
    page: 1,
    limit: 10
  });
});

app.get('/api/projects', (req, res) => {
  res.json({
    data: [
      { project_id: 1, name: 'Тестовий проект 1', forecast_amount: 10000 },
      { project_id: 2, name: 'Тестовий проект 2', forecast_amount: 20000 }
    ],
    total: 2,
    page: 1,
    limit: 10
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('📝 This is a test server without database for API testing');
});
