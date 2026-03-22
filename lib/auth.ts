import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

export interface UserPayload extends JwtPayload {
    id: string;
    role: string;
}

export const signToken = (id: string, role: string = 'user') => {
    return jwt.sign({ id, role }, JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const verifyToken = (token: string): UserPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === 'string') {
            return null; // We expect an object payload
        }
        return decoded as UserPayload;
    } catch (error) {
        return null;
    }
};

export const authenticate = async (request: NextRequest): Promise<UserPayload | null> => {
    // Check Authorization header
    let token = request.headers.get('Authorization')?.split(' ')[1];
    
    // Fallback to cookie
    if (!token) {
        token = request.cookies.get('token')?.value;
    }

    if (!token) return null;
    
    const decoded = verifyToken(token);
    if (!decoded) return null;
    
    return decoded;
};
