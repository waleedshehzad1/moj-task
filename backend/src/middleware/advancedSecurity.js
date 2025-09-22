const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Advanced Security Middleware
 *
 * A toolbox of optional protections that can be enabled per route/app:
 * - Tiered rate limits (auth/api/public) with Redis-backed stores
 * - Progressive delays for abusive clients
 * - IP blocklist backed by Redis + temporary auto-unblock
 * - Basic geolocation logging, payload size checks
 * - Suspicious pattern detection for common attack signatures
 * - Basic CSRF token guard (for non-API-key, stateful contexts)
 *
 * Integrate by selecting the policies you need, e.g.:
 *   const sec = require('./advancedSecurity');
 *   app.use(sec.ipBlockingMiddleware());
 *   app.use(sec.createProgressiveDelay());
 */
class SecurityMiddleware {
  constructor() {
    this.suspiciousIPs = new Set();
    this.blockedIPs = new Set();
    this.loadBlockedIPs();
  }

  /**
   * Load blocked IPs from Redis on startup
   */
  async loadBlockedIPs() {
    try {
      if (redisClient && redisClient.isOpen) {
        const blockedIPs = await redisClient.sMembers('security:blocked_ips');
        this.blockedIPs = new Set(blockedIPs);
        logger.info(`Loaded ${blockedIPs.length} blocked IPs from Redis`);
      }
    } catch (error) {
      logger.error('Failed to load blocked IPs from Redis:', error);
    }
  }

  /**
   * Advanced rate limiting with different tiers
   */
  createAdvancedRateLimit() {
    return {
      // Strict rate limiting for authentication endpoints
      strict: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per window
        message: {
          error: 'Too many authentication attempts',
          retryAfter: 900, // 15 minutes
          type: 'RATE_LIMIT_AUTH'
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: redisClient ? new (require('rate-limit-redis'))({
          client: redisClient,
          prefix: 'rl:auth:'
        }) : undefined,
        keyGenerator: (req) => {
          return `${req.ip}_${req.path}`;
        },
        onLimitReached: (req, res, options) => {
          this.handleRateLimitExceeded(req, 'AUTH_RATE_LIMIT');
        }
      }),

      // Medium rate limiting for API endpoints
      api: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        message: {
          error: 'Too many API requests',
          retryAfter: 900,
          type: 'RATE_LIMIT_API'
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: redisClient ? new (require('rate-limit-redis'))({
          client: redisClient,
          prefix: 'rl:api:'
        }) : undefined,
        onLimitReached: (req, res, options) => {
          this.handleRateLimitExceeded(req, 'API_RATE_LIMIT');
        }
      }),

      // Generous rate limiting for public endpoints
      public: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // 1000 requests per window
        message: {
          error: 'Too many requests',
          retryAfter: 900,
          type: 'RATE_LIMIT_PUBLIC'
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: redisClient ? new (require('rate-limit-redis'))({
          client: redisClient,
          prefix: 'rl:public:'
        }) : undefined
      })
    };
  }

  /**
   * Progressive delay for repeated requests
   */
  createProgressiveDelay() {
    return slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 10, // allow 10 requests per window without delay
      delayMs: 100, // add 100ms delay per request after delayAfter
      maxDelayMs: 5000, // maximum delay of 5 seconds
      store: redisClient ? new (require('rate-limit-redis'))({
        client: redisClient,
        prefix: 'sd:'
      }) : undefined
    });
  }

  /**
   * IP blocking middleware
   */
  ipBlockingMiddleware() {
    return (req, res, next) => {
      const clientIP = this.getClientIP(req);

      // Check if IP is blocked
      if (this.blockedIPs.has(clientIP)) {
        logger.logSecurityEvent('Blocked IP Access Attempt', {
          ip: clientIP,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          timestamp: new Date().toISOString()
        });

        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Geolocation blocking middleware (basic implementation)
   */
  geolocationMiddleware() {
    return async (req, res, next) => {
      try {
        const clientIP = this.getClientIP(req);
        
        // Skip for local development
        if (this.isLocalIP(clientIP)) {
          return next();
        }

        // In a real implementation, you would use a geolocation service
        // For now, we'll just log the IP for monitoring
        logger.info(`Request from IP: ${clientIP}`, {
          endpoint: req.originalUrl,
          userAgent: req.get('User-Agent')
        });

        next();
      } catch (error) {
        logger.error('Geolocation middleware error:', error);
        next(); // Don't block on errors
      }
    };
  }

  /**
   * Request size limiting middleware
   */
  requestSizeLimiter() {
    return (req, res, next) => {
      const contentLength = parseInt(req.get('Content-Length') || '0');
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (contentLength > maxSize) {
        logger.logSecurityEvent('Request Size Exceeded', {
          ip: this.getClientIP(req),
          contentLength,
          maxSize,
          endpoint: req.originalUrl,
          timestamp: new Date().toISOString()
        });

        return res.status(413).json({
          error: 'PayloadTooLarge',
          message: 'Request payload too large',
          maxSize: `${maxSize / (1024 * 1024)}MB`,
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Suspicious activity detection middleware
   */
  suspiciousActivityDetector() {
    return async (req, res, next) => {
      try {
        const clientIP = this.getClientIP(req);
        const suspiciousPatterns = [
          // SQL Injection patterns
          /(\bor\b|\band\b).*[=<>]/i,
          /union.*select/i,
          /insert\s+into/i,
          /drop\s+table/i,
          
          // XSS patterns
          /<script.*?>.*?<\/script>/i,
          /javascript:/i,
          /on\w+\s*=/i,
          
          // Path traversal
          /\.\.[\/\\]/,
          /\.\.[\/\\].*[\/\\]/,
          
          // Command injection
          /;\s*(cat|ls|pwd|whoami|id|uname)/i,
          /\|\s*(cat|ls|pwd|whoami|id|uname)/i
        ];

        const requestData = JSON.stringify({
          url: req.originalUrl,
          query: req.query,
          body: req.body,
          headers: req.headers
        });

        let suspiciousScore = 0;
        const detectedPatterns = [];

        // Check for suspicious patterns
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(requestData)) {
            suspiciousScore++;
            detectedPatterns.push(pattern.toString());
          }
        }

        // Check for excessive headers
        if (Object.keys(req.headers).length > 50) {
          suspiciousScore++;
          detectedPatterns.push('excessive_headers');
        }

        // Check for unusual user agents
        const userAgent = req.get('User-Agent') || '';
        if (userAgent.length > 500 || /(?:curl|wget|python|nikto|sqlmap|nmap)/i.test(userAgent)) {
          suspiciousScore++;
          detectedPatterns.push('suspicious_user_agent');
        }

        // If suspicious activity detected
        if (suspiciousScore > 0) {
          await this.handleSuspiciousActivity(req, suspiciousScore, detectedPatterns);
          
          // Block if score is too high
          if (suspiciousScore >= 3) {
            return res.status(403).json({
              error: 'Forbidden',
              message: 'Suspicious activity detected',
              timestamp: new Date().toISOString()
            });
          }
        }

        next();
      } catch (error) {
        logger.error('Suspicious activity detector error:', error);
        next(); // Don't block on errors
      }
    };
  }

  /**
   * CSRF protection middleware
   */
  csrfProtection() {
    return (req, res, next) => {
      // Skip CSRF check for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      // Skip for API key authentication
      if (req.headers['x-api-key']) {
        return next();
      }

      const token = req.headers['x-csrf-token'] || req.body._csrf;
      const sessionToken = req.session?.csrfToken;

      if (!token || !sessionToken || token !== sessionToken) {
        logger.logSecurityEvent('CSRF Token Mismatch', {
          ip: this.getClientIP(req),
          endpoint: req.originalUrl,
          method: req.method,
          providedToken: token ? 'present' : 'missing',
          sessionToken: sessionToken ? 'present' : 'missing',
          timestamp: new Date().toISOString()
        });

        return res.status(403).json({
          error: 'Forbidden',
          message: 'CSRF token mismatch',
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Handle rate limit exceeded events
   */
  async handleRateLimitExceeded(req, type) {
    const clientIP = this.getClientIP(req);
    
    logger.logSecurityEvent('Rate Limit Exceeded', {
      ip: clientIP,
      type: type,
      endpoint: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Add to suspicious IPs
    this.suspiciousIPs.add(clientIP);

    // Temporarily block IP if too many rate limit violations
    try {
      if (redisClient && redisClient.isOpen) {
        const key = `security:violations:${clientIP}`;
        const violations = await redisClient.incr(key);
        await redisClient.expire(key, 3600); // Expire in 1 hour

        if (violations >= 5) {
          await this.blockIP(clientIP, 'Excessive rate limit violations', 3600);
        }
      }
    } catch (error) {
      logger.error('Failed to track rate limit violations:', error);
    }
  }

  /**
   * Handle suspicious activity
   */
  async handleSuspiciousActivity(req, score, patterns) {
    const clientIP = this.getClientIP(req);
    
    logger.logSecurityEvent('Suspicious Activity Detected', {
      ip: clientIP,
      score: score,
      patterns: patterns,
      endpoint: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Add to suspicious IPs
    this.suspiciousIPs.add(clientIP);

    // Store in Redis for analysis
    try {
      if (redisClient && redisClient.isOpen) {
        const key = `security:suspicious:${clientIP}`;
        const data = {
          timestamp: new Date().toISOString(),
          score,
          patterns,
          endpoint: req.originalUrl,
          method: req.method,
          userAgent: req.get('User-Agent')
        };
        
        await redisClient.lPush(key, JSON.stringify(data));
        await redisClient.lTrim(key, 0, 99); // Keep last 100 events
        await redisClient.expire(key, 86400); // Expire in 24 hours
      }
    } catch (error) {
      logger.error('Failed to store suspicious activity:', error);
    }
  }

  /**
   * Block an IP address
   */
  async blockIP(ip, reason, duration = 3600) {
    try {
      this.blockedIPs.add(ip);

      if (redisClient && redisClient.isOpen) {
        await redisClient.sAdd('security:blocked_ips', ip);
        await redisClient.setEx(`security:block_reason:${ip}`, duration, reason);
      }

      logger.logSecurityEvent('IP Blocked', {
        ip: ip,
        reason: reason,
        duration: duration,
        timestamp: new Date().toISOString()
      });

      // Auto-unblock after duration
      setTimeout(() => {
        this.unblockIP(ip);
      }, duration * 1000);

    } catch (error) {
      logger.error('Failed to block IP:', error);
    }
  }

  /**
   * Unblock an IP address
   */
  async unblockIP(ip) {
    try {
      this.blockedIPs.delete(ip);

      if (redisClient && redisClient.isOpen) {
        await redisClient.sRem('security:blocked_ips', ip);
        await redisClient.del(`security:block_reason:${ip}`);
      }

      logger.info(`IP ${ip} has been unblocked`);
    } catch (error) {
      logger.error('Failed to unblock IP:', error);
    }
  }

  /**
   * Get client IP address
   */
  getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '0.0.0.0';
  }

  /**
   * Check if IP is local/private
   */
  isLocalIP(ip) {
    const localPatterns = [
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^::1$/,
      /^localhost$/i
    ];

    return localPatterns.some(pattern => pattern.test(ip));
  }

  /**
   * Get security status
   */
  getSecurityStatus() {
    return {
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousIPs: Array.from(this.suspiciousIPs),
      totalBlocked: this.blockedIPs.size,
      totalSuspicious: this.suspiciousIPs.size
    };
  }
}

module.exports = new SecurityMiddleware();
