const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');
const logger = require('../utils/logger');
const { redisClient } = require('../config/redis');

/**
 * Authentication Controller
 * Handles user registration, login, logout, password reset, and token management
 * Implements OWASP security best practices
 */
class AuthController {
  /**
   * Register a new user
   * @swagger
   * /api/v1/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - username
   *               - password
   *               - first_name
   *               - last_name
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               username:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 100
   *               password:
   *                 type: string
   *                 minLength: 8
   *               first_name:
   *                 type: string
   *               last_name:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [admin, manager, caseworker, viewer]
   *               department:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Validation error or user already exists
   */
  static async register(req, res, next) {
    try {
      const { 
        email, 
        username, 
        password, 
        first_name, 
        last_name, 
        role = 'caseworker',
        department,
        phone 
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          $or: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
          ]
        }
      });

      if (existingUser) {
        logger.logSecurityEvent('Registration Attempt - User Exists', {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'User with this email or username already exists',
          timestamp: new Date().toISOString()
        });
      }

      // Validate password strength
      const passwordErrors = AuthController.validatePasswordStrength(password);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Password does not meet security requirements',
          details: passwordErrors,
          timestamp: new Date().toISOString()
        });
      }

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const user = await User.create({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password_hash: password, // Will be hashed in the model hook
        first_name,
        last_name,
        role,
        department,
        phone,
        email_verification_token: emailVerificationToken,
        email_verified: false // In production, require email verification
      });

      // Log successful registration
      logger.logAudit('USER_REGISTRATION', {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      // In production, send verification email here
      // await EmailService.sendVerificationEmail(user.email, emailVerificationToken);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification instructions.',
        data: {
          user: user.toJSON(),
          emailVerificationRequired: true
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  /**
   * User login
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: Authenticate user and return JWT tokens
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   *       423:
   *         description: Account locked
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const clientIP = req.ip;
      const userAgent = req.get('User-Agent');

      // Find user by email or username
      // Convert email to lowercase for case-insensitive matching
      const lowercasedEmail = email.toLowerCase();
      
      let user = await User.findOne({
        where: { email: lowercasedEmail }
      });
      
      // If user not found by email, try username
      if (!user) {
        user = await User.findOne({
          where: { username: lowercasedEmail }
        });
      }

      if (!user) {
        logger.logSecurityEvent('Login Attempt - User Not Found', {
          email: email.toLowerCase(),
          ip: clientIP,
          userAgent
        });

        return res.status(401).json({
          success: false,
          error: 'UnauthorizedError',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString()
        });
      }

      // Check if account is locked
      if (user.isLocked()) {
        logger.logSecurityEvent('Login Attempt - Account Locked', {
          userId: user.id,
          email: user.email,
          ip: clientIP,
          userAgent,
          lockedUntil: user.locked_until
        });

        return res.status(423).json({
          success: false,
          error: 'AccountLocked',
          message: 'Account is temporarily locked due to too many failed login attempts',
          lockedUntil: user.locked_until,
          timestamp: new Date().toISOString()
        });
      }

      // Check if account is active
      if (!user.is_active) {
        logger.logSecurityEvent('Login Attempt - Inactive Account', {
          userId: user.id,
          email: user.email,
          ip: clientIP,
          userAgent
        });

        return res.status(401).json({
          success: false,
          error: 'UnauthorizedError',
          message: 'Account is deactivated',
          timestamp: new Date().toISOString()
        });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      
      if (!isValidPassword) {
        await user.incrementFailedLogins();
        
        logger.logSecurityEvent('Login Attempt - Invalid Password', {
          userId: user.id,
          email: user.email,
          ip: clientIP,
          userAgent,
          failedAttempts: user.failed_login_attempts
        });

        return res.status(401).json({
          success: false,
          error: 'UnauthorizedError',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString()
        });
      }

      // Reset failed login attempts on successful login
      await user.resetFailedLogins();

      // Generate JWT tokens
      const { accessToken, refreshToken } = await AuthController.generateTokens(user);

      // Store session in Redis and database
      const sessionId = crypto.randomUUID();
      const sessionData = {
        userId: user.id,
        sessionId,
        ipAddress: clientIP,
        userAgent,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      // Store in Redis for fast lookups
      if (redisClient && redisClient.isOpen) {
        await redisClient.setEx(
          `session:${sessionId}`,
          parseInt(process.env.JWT_EXPIRES_IN_SECONDS) || 3600,
          JSON.stringify(sessionData)
        );
      }

      // Store refresh token securely
      if (redisClient && redisClient.isOpen) {
        await redisClient.setEx(
          `refresh_token:${user.id}`,
          parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS) || 604800, // 7 days
          refreshToken
        );
      }

      // Log successful login
      logger.logAudit('USER_LOGIN', {
        userId: user.id,
        email: user.email,
        sessionId,
        ip: clientIP,
        userAgent,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: parseInt(process.env.JWT_EXPIRES_IN_SECONDS) || 3600
          },
          session: {
            sessionId,
            lastActivity: sessionData.lastActivity
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  /**
   * Refresh access token
   * @swagger
   * /api/v1/auth/refresh:
   *   post:
   *     summary: Refresh access token using refresh token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *       401:
   *         description: Invalid refresh token
   */
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'UnauthorizedError',
          message: 'Refresh token is required',
          timestamp: new Date().toISOString()
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          error: 'UnauthorizedError',
          message: 'Invalid refresh token',
          timestamp: new Date().toISOString()
        });
      }

      // Check if refresh token exists in Redis
      if (redisClient && redisClient.isOpen) {
        const storedToken = await redisClient.get(`refresh_token:${user.id}`);
        if (storedToken !== refreshToken) {
          return res.status(401).json({
            success: false,
            error: 'UnauthorizedError',
            message: 'Invalid refresh token',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await AuthController.generateTokens(user);

      // Update refresh token in Redis
      if (redisClient && redisClient.isOpen) {
        await redisClient.setEx(
          `refresh_token:${user.id}`,
          parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS) || 604800,
          newRefreshToken
        );
      }

      logger.logAudit('TOKEN_REFRESH', {
        userId: user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken,
            tokenType: 'Bearer',
            expiresIn: parseInt(process.env.JWT_EXPIRES_IN_SECONDS) || 3600
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'UnauthorizedError',
          message: 'Invalid or expired refresh token',
          timestamp: new Date().toISOString()
        });
      }
      
      logger.error('Token refresh error:', error);
      next(error);
    }
  }

  /**
   * Logout user
   * @swagger
   * /api/v1/auth/logout:
   *   post:
   *     summary: Logout user and invalidate tokens
   *     tags: [Authentication]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   */
  static async logout(req, res, next) {
    try {
      const user = req.user;

      if (user) {
        // Remove refresh token from Redis
        if (redisClient && redisClient.isOpen) {
          await redisClient.del(`refresh_token:${user.id}`);
        }

        // Remove all sessions for the user
        if (redisClient && redisClient.isOpen) {
          const sessions = await redisClient.keys(`session:*`);
          for (const sessionKey of sessions) {
            const sessionData = await redisClient.get(sessionKey);
            if (sessionData) {
              const session = JSON.parse(sessionData);
              if (session.userId === user.id) {
                await redisClient.del(sessionKey);
              }
            }
          }
        }

        logger.logAudit('USER_LOGOUT', {
          userId: user.id,
          email: user.email,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      // Always return success to prevent email enumeration
      const successResponse = {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        timestamp: new Date().toISOString()
      };

      if (!user) {
        logger.logSecurityEvent('Password Reset Request - User Not Found', {
          email: email.toLowerCase(),
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        return res.json(successResponse);
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await user.update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires
      });

      // In production, send password reset email here
      // await EmailService.sendPasswordResetEmail(user.email, resetToken);

      logger.logAudit('PASSWORD_RESET_REQUEST', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      res.json(successResponse);

    } catch (error) {
      logger.error('Forgot password error:', error);
      next(error);
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        where: {
          password_reset_token: token,
          password_reset_expires: {
            $gt: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid or expired password reset token',
          timestamp: new Date().toISOString()
        });
      }

      // Validate password strength
      const passwordErrors = AuthController.validatePasswordStrength(password);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Password does not meet security requirements',
          details: passwordErrors,
          timestamp: new Date().toISOString()
        });
      }

      // Update password and clear reset tokens
      await user.update({
        password_hash: password, // Will be hashed in the model hook
        password_reset_token: null,
        password_reset_expires: null,
        failed_login_attempts: 0,
        locked_until: null
      });

      logger.logAudit('PASSWORD_RESET_COMPLETED', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Password has been reset successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Reset password error:', error);
      next(error);
    }
  }

  /**
   * Generate JWT tokens
   */
  static async generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: 'hmcts-task-api',
        audience: 'hmcts-task-frontend'
      }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'hmcts-task-api',
        audience: 'hmcts-task-frontend'
      }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return errors;
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = req.user;

      res.json({
        success: true,
        data: {
          user: user.toJSON()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res, next) {
    try {
      const user = req.user;
      const allowedUpdates = ['first_name', 'last_name', 'phone', 'department', 'preferences'];
      const updates = {};

      // Only allow specific fields to be updated
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      await user.update(updates);

      logger.logAudit('PROFILE_UPDATE', {
        userId: user.id,
        email: user.email,
        updatedFields: Object.keys(updates),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: user.toJSON()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }

  /**
   * Change password
   */
  static async changePassword(req, res, next) {
    try {
      const user = req.user;
      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Current password is incorrect',
          timestamp: new Date().toISOString()
        });
      }

      // Validate new password strength
      const passwordErrors = AuthController.validatePasswordStrength(newPassword);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'New password does not meet security requirements',
          details: passwordErrors,
          timestamp: new Date().toISOString()
        });
      }

      // Update password
      await user.update({
        password_hash: newPassword // Will be hashed in the model hook
      });

      logger.logAudit('PASSWORD_CHANGE', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Change password error:', error);
      next(error);
    }
  }
}

module.exports = AuthController;
