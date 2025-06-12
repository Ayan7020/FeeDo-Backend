import jwt from 'jsonwebtoken';
import { ParseEnvData } from './Env';

export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, ParseEnvData.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string, tokenId: string) {
  return jwt.sign({ userId, tokenId }, ParseEnvData.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string, secret: string) {
  return jwt.verify(token, secret);
}
