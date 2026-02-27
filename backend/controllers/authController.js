const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

function signToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
}

exports.register = asyncHandler(async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
        return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
        message: 'Account created successfully.',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            onboardingCompleted: user.onboardingCompleted,
            role: user.role,
        },
    });
});

exports.ngoRegister = asyncHandler(async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
        return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const user = await User.create({ name, email, password, role: 'ngo', onboardingCompleted: true });
    const token = signToken(user._id);

    res.status(201).json({
        message: 'NGO Partner account created successfully.',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            onboardingCompleted: user.onboardingCompleted,
            role: user.role,
        },
    });
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    res.json({
        message: 'Login successful.',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            onboardingCompleted: user.onboardingCompleted,
            role: user.role,
        },
    });
});

exports.ngoLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.role !== 'ngo' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. You are not an authorized NGO Partner.' });
    }

    const token = signToken(user._id);

    res.json({
        message: 'Portal Login successful.',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            onboardingCompleted: user.onboardingCompleted,
            role: user.role,
        },
    });
});
