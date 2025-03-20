import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { User } from '../models';

// Generate JWT Token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// Hash Password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare Password
export const comparePassword = async (
  enteredPassword: string,
  storedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(enteredPassword, storedPassword);
};

// Get user from token
export const getUserFromToken = async (token: string) => {
  if (!token || !token.startsWith('Bearer ')) {
    return null;
  }

  try {
    // Extract token from Authorization header (remove 'Bearer ')
    const tokenValue = token.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET as string) as { id: string };
    
    // Find user by id from token
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}; 