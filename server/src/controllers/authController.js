import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { generateTokens, setRefreshCookie, clearRefreshCookie } from '../utils/token.js';
import { AppError } from '../middleware/errorHandler.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, storeName, storeDescription } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400, 'VALIDATION_ERROR');
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400, 'VALIDATION_ERROR');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400, 'VALIDATION_ERROR');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // NFR-02: Prevent client from assigning admin role
    const assignedRole = role === 'vendor' ? 'vendor' : 'customer';

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole
    };

    if (assignedRole === 'vendor') {
      userData.vendorProfile = {
        storeName: storeName?.trim() || `${name.trim()}'s Store`,
        storeDescription: storeDescription?.trim() || '',
        status: 'pending'
      };
    }

    const user = await User.create(userData);
    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorProfile: user.vendorProfile
        },
        accessToken
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email and password required', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Rotate refresh tokens: keep only recent 5
    user.refreshTokens = user.refreshTokens.slice(-4);
    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorProfile: user.vendorProfile
        },
        accessToken
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingToken) {
      throw new AppError('Refresh token required', 401, 'UNAUTHORIZED');
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(incomingToken)) {
      throw new AppError('Invalid refresh token reuse or expired', 401, 'UNAUTHORIZED');
    }

    // Token rotation: remove old token and add new one
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    user.refreshTokens = user.refreshTokens.filter(t => t !== incomingToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorProfile: user.vendorProfile
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (incomingToken && req.user) {
      req.user.refreshTokens = req.user.refreshTokens.filter(t => t !== incomingToken);
      await req.user.save();
    }
    clearRefreshCookie(res);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        vendorProfile: req.user.vendorProfile
      }
    }
  });
}
