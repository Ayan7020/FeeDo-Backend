import { z } from "zod";

export const envSchema = z.object({
    NodePort: z.string().nonempty("The NodePort should be present"),
    DB_Host: z.string(),
    DB_PORT: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string().nonempty("The PostGress_DB should be present"),
    DATABASE_URL: z.string(),
    REDISHOST: z.string(),
    REDISPASS: z.string(),
    RABBITMQUSER: z.string(),
    RABBITMQPASSWORD: z.string(),
    RABBITMQHOST: z.string(),
    RABBITMQPORT: z.number(),
    JWT_SECRET: z.string().nonempty("JWT_SECRET is required for authentication")
})