import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const register = async (req, res) => {
  try {
    const { role, email, password, profile } = req.body;
    if (!role || !email || !password) return res.status(400).json({ error: 'role, email and password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ role, email, passwordHash: hash, profile });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, role: user.role, email: user.email, profile: user.profile } });
  } catch (err) {
    console.error('register err', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, role: user.role, email: user.email, profile: user.profile } });
  } catch (err) {
    console.error('login err', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const me = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing token' });
    const token = auth.replace('Bearer ', '');
    const data = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(data.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('me err', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Public: get a user's profile/meta by user id (no auth required)
export const getUserProfile = async (req, res) => {
  try {
    // Now lookup by email (required path parameter)
    const { email } = req.params;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Missing or invalid email parameter' });
    }
    const user = await User.findOne({ email }).select('profile role email createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Return only the stored profile and basic meta
    return res.json({ id: user._id, role: user.role, email: user.email, profile: user.profile, createdAt: user.createdAt });
  } catch (err) {
    console.error('getUserProfile err', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Update the authenticated user's location in profile
export const updateLocation = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing token' });
    const token = auth.replace('Bearer ', '');
    const data = jwt.verify(token, JWT_SECRET);

    const { lat, lng, address } = req.body || {};
    if (typeof lat !== 'number' || typeof lng !== 'number' || !address) {
      return res.status(400).json({ error: 'lat, lng (numbers) and address (string) required' });
    }

    const user = await User.findById(data.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.profile = user.profile || {};
    user.profile.location = { lat, lng, address };
    await user.save();

    res.json({ ok: true, profile: user.profile });
  } catch (err) {
    console.error('updateLocation err', err);
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    res.status(500).json({ error: 'Server error' });
  }
};
