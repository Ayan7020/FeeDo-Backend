import RedisClient from "@/lib/Redis";
import Redis from "ioredis";

class Service {
    private cacheClient: RedisClient;
    private Client: Redis;

    constructor() {
        this.cacheClient = new RedisClient();
        this.Client = this.cacheClient.getClient();
    }

    public async createHash(key: string | number, object: Record<string, any>, prefix: string, expiryinMin?: number): Promise<boolean | undefined> {
        try {
            if (!key || typeof object !== 'object' || Object.keys(object).length === 0) {
                console.warn("[Redis][createHash] Invalid key or object");
                return false;
            }

            const KEY = `${prefix}:${key}`;
            const pipeline = this.Client.pipeline();

            pipeline.hmset(KEY, object);

            if (expiryinMin) {
                const expiryInSeconds = expiryinMin * 60;
                pipeline.expire(KEY, expiryInSeconds);
            }

            await pipeline.exec();
            return true;

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("[Redis][createHash]:", error.message);
            }
            else {
                console.error("[Redis][createHash] Unknown error : ", error);
            }
            throw new Error(String(error))
        }
    }

    public async getHash() {
        try {

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("[Redis][gethash]:", error.message);
            }
            else {
                console.error("[Redis][gethash] Unknown error : ", error);
            }
            throw new Error(String(error))
        }
    }
}

let redisService: Service;

export function getRedisService() {
    if (!redisService) {
        redisService = new Service();
    }
    return redisService;
}