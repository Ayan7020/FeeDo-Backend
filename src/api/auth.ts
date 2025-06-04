import { RequestValidator } from "@/controllers/request";
import { prisma } from "@/lib/Database";
import { SignupSchema, TypedSignupSchema } from "@/schemas/auth.schema";
import { AuthServices } from "@/services/auth.services";
import { RedisCacheSingletonService } from "@/services/redis.services";
import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response, Router } from "express";

const router = Router();

router.post("/register", RequestValidator.bodyValidator(SignupSchema), asyncHandler(async (req: Request, res: Response) => {
    try {
        const body: TypedSignupSchema = req.body;
        const HashedPassword = await AuthServices.EncryptPassword(body.password);

        const user = await prisma.user.create({
            data: {
                name: body.name,
                username: body.username,
                email: body.email,
                password: HashedPassword
            }
        })

        const OTP = AuthServices.generateOTP(); 
        const redisOBJ = {
            email: user.email,
            otp: OTP
        };

        const isOtpCacheSet = RedisCacheSingletonService.createHash(user.id, redisOBJ, "OTP", 5);

        if (!isOtpCacheSet) {
            RequestValidator.handleError(res, {
                status: 500,
                errorType: "server",
                message: "Internal error: could not send OTP. Please try again."
            })
        }

        return res.status(200).json({
            status: "success",
            message: "user created successfully"
        })

    } catch (error) {
        throw error;
    }
}))

// router.post("/google-register");
// router.post("/verify-account")
// router.post("/login")
// router.post("/google-login")
// router.post("/forgot-password/request-otp")
// router.post("/forgot-password/verify-otp")
// router.post("/forgot-password/reset-password")

export { router as AuthRoute }

