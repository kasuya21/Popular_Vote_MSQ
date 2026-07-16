const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// Authenticate Admin via HTTP-Only Cookie
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.admin_token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Admin not found.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid token.' });
  }
};

// Role-Based Access Control Middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Admin not authenticated.' });
    }

    // SUPER_ADMIN has access to everything
    if (req.admin.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden. You do not have permission to perform this action.' 
      });
    }

    next();
  };
};

module.exports = {
  authenticateAdmin,
  requireRole
};
