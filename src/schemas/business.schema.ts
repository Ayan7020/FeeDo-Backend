import { z } from "zod";
export const BusinessTypeEnum = z.enum([
    "Ecommerce",
    "SaaS",
    "Healthcare",
    "EdTech",
    "FinTech",
    "Other",
]);


export const CustomerTypeEnum = z.enum([
    "B2B",
    "B2C",
    "Hybrid",
]);



export const BusinessSetupSchema = z.object({
    email: z.string().email(),
    businessName: z.string().min(1),
    businessType: BusinessTypeEnum,
    customerType: CustomerTypeEnum,
    targetRegions: z.array(z.string().min(1)),
    Description: z.string().min(10),
    analysisGoals: z.string().optional()
})

export type TypedBusinessSetupSchema = z.infer<typeof BusinessSetupSchema>