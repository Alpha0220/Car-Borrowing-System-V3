import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    employeeId: string;
    role: 'SUPER_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  };
}

export const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.substring(7);
  

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as {
      id: string;
      employeeId: string;
      role: 'SUPER_ADMIN' | 'MANAGER' | 'EMPLOYEE';
    };

    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token111',token: token });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (...roles: Array<'SUPER_ADMIN' | 'MANAGER' | 'EMPLOYEE'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

