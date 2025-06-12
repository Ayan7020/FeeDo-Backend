import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ParseEnvData } from '@/utils/Env';
import { User } from '@prisma/client';
import { prisma } from "@/lib/Database";
import otpGenerator from 'otp-generator';
import { Request, NextFunction, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt';

export class AuthServices {

    static async EncryptPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    static async verifyPassword(plainPassword: string, hashedPassword: any): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    static async findUserByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    static generateOTP(length: number = 6): string {
        return otpGenerator.generate(length, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true,
        });
    }

    static async markUserAsVerified(userId: number): Promise<void> {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { isverified: true },
            });
        } catch (error) {
            console.error("[AuthService][markUserAsVerified]:", error);
            throw new Error("Failed to mark user as verified.");
        }
    }

    static async GenerateToken(email: string): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                throw new Error("User not found");
            }

            const tokenID = uuidv4();
            const accessToken = generateAccessToken(String(user.id));
            const refreshToken = generateRefreshToken(String(user.id), tokenID);

            
            return { accessToken, refreshToken };
        } catch (error: unknown) {
            console.error("[AuthService][GenerateToken]: ", error instanceof Error ? error.message : 'Unknown error');
            throw error;  
        }
    }

    static setAuthCookies = (res: Response, refreshToken: string) => {
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })
    }
}