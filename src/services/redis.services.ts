import RedisClient from "@/lib/Redis";
import Redis from "ioredis";

class Service {
  private static instance: Service;
  private RedisCacheClient!: RedisClient;
  private Client!: Redis;

  private constructor() {
    this.RedisCacheClient = new RedisClient();
    this.Client = this.RedisCacheClient.getClient();
  }
 
  public static getInstance(): Service {
    if (!Service.instance) {
      Service.instance = new Service();
    }
    return Service.instance;
  }

  public async createHash(
    key: string | number,
    object: Record<string, any>,
    prefix: string,
    expiryinMin?: number
  ): Promise<boolean | undefined> {
    try {
      if (!key || typeof object !== "object" || Object.keys(object).length === 0) {
        console.warn("[Redis][createHash] Invalid key or object");
        return false;
      }

      if (!prefix || typeof prefix !== "string") {
        console.warn("[Redis][createHash] Invalid Prefix");
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
      } else {
        console.error("[Redis][createHash] Unknown error:", error);
      }
      throw new Error(String(error));
    }
  }

  public async getHash(
    key: string | number,
    prefix: string
  ): Promise<Record<string, string> | null> {
    try {
      if (!key || !prefix) return null;

      const KEY = `${prefix}:${key}`;
      const result = await this.Client.hgetall(KEY);

      return Object.keys(result).length > 0 ? result : null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("[Redis][getHash]:", error.message);
      } else {
        console.error("[Redis][getHash] Unknown error:", error);
      }
      throw new Error(String(error));
    }
  }
}

export const RedisCacheSingletonService = Service.getInstance();