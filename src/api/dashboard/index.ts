import { RequestValidator } from "@/controllers/request";
import { prisma } from "@/lib/Database";
import { BusinessSetupSchema, TypedBusinessSetupSchema } from "@/schemas/business.schema";
import { AuthServices } from "@/services/auth.services";
import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response, Router } from "express";


const router = Router();


router.post("/business-setup", RequestValidator.bodyValidator(BusinessSetupSchema), asyncHandler(async (req: Request, res: Response) => {
    try {
        const body: TypedBusinessSetupSchema = req.body;
        const user = await AuthServices.findUserByEmail(body.email)
        if (!user) {
            throw new Error("User Didn't found")
        }
        const business = await prisma.businessProfile.create({
            data: {
                userId: user.id,
                businessName: body.businessName,
                businessType: body.businessType,
                customerType: body.customerType,
                Description: body.Description,
                analysisGoals: body?.analysisGoals || "",
                targetRegions: body.targetRegions
            }
        })

        return RequestValidator.handleSuccess(res, {
            message: "business-setup is Done Successfully",
        })
    } catch (error: any) {
        console.error("[BusinessSetup]: ", error)
        throw new Error(error)
    }
}))
