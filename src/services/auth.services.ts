import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ParseEnvData } from '@/utils/Env'; 
import { User } from '@prisma/client';
import { prisma } from "@/lib/Database";
import otpGenerator from 'otp-generator';

export class AuthServices {

    static async EncryptPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
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
}