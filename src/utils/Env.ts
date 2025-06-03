import { envSchema } from "../schemas/env.schema";
import { config } from "dotenv";

config()

const ParseEnv = envSchema.safeParse(process.env)

if (!ParseEnv.success) {
    console.error("[ENV_ERROR] Environment variable validation failed.\n");
    console.error(
        ParseEnv.error.format()
    );
    process.exit(1);
}

export const ParseEnvData = ParseEnv.data;
