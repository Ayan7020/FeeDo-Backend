import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ParseEnvData } from '@/utils/Env';
import { PrismaClient, User } from '@prisma/client';
import otpGenerator from 'otp-generator';

const prisma = new PrismaClient();

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
}