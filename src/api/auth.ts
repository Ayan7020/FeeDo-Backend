import { RequestValidator } from "@/controllers/request";
import { prisma } from "@/lib/Database";
import { SignupSchema, TypedSignupSchema } from "@/schemas/auth.schema";
import { AuthServices } from "@/services/auth.services";
import { EmailQueueService } from "@/services/queue/emailQueue.services";
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

        res.status(200).json({
            status: "success",
            message: "user created successfully"
        })

        const payload = {
            user_firstname: body.name,
            otp: OTP,
            email: body.email
        }

        await EmailQueueService.sendMailToQueue(payload);
    } catch (error) {
        throw error;
    }
}))

router.post("/verify-account/:email/:otp", asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.params;

        if (!email || !otp) {
            return RequestValidator.handleError(res, {
                status: 400,
                message: "Email and OTP are required in URL params.",
            });
        }

        const isUser = await AuthServices.findUserByEmail(email);
        if (!isUser) {
            return RequestValidator.handleError(res, {
                status: 404,
                message: "User does not exist in the database.",
            });
        }

        const userRedis = await RedisCacheSingletonService.getHash<{ email: string; otp: string }>(
            isUser.id,
            "OTP"
        );

        if (!userRedis?.email || !userRedis?.otp) {
            return RequestValidator.handleError(res, {
                status: 400,
                errorType: "Expired",
                message: "OTP has expired or was never generated.",
            });
        }

        const emailMatch = userRedis.email === email;
        const otpMatch = userRedis.otp === otp;

        if (!emailMatch || !otpMatch) {
            return RequestValidator.handleError(res, {
                status: 401,
                errorType: "Invalid",
                message: "Invalid OTP or email. Verification failed.",
            });
        }

        await AuthServices.markUserAsVerified(isUser.id);

        await RedisCacheSingletonService.deleteKey(isUser.id, "OTP");


        return res.status(200).json({
            success: true,
            message: "Account verified successfully.",
        });

    } catch (error: any) {
        throw (error)
    }
})
);

// router.post("/google-register");
// router.post("/login")
// router.post("/google-login")
// router.post("/forgot-password/request-otp")
// router.post("/forgot-password/verify-otp")
// router.post("/forgot-password/reset-password")

export { router as AuthRoute }

