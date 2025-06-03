import { ParseEnvData } from "@/utils/Env";
import Redis from "ioredis";

class RedisClient {
    private client!: Redis;
    private readonly maxRetries: number = 10;
    private readonly retryDelay: number = 3000;
    private readonly maxRetriesPerRequest: number = 3;
    private readonly RedisPort: number = 6379;
    private readonly RedisUsername: string = "default";
    private retryCount: number = 0;

    constructor() {
        this.initializeClient();
    }

    private initializeClient() {
        this.client = new Redis({
            host: ParseEnvData.REDISHOST,   
            port: this.RedisPort,
            username: this.RedisUsername,
            password: ParseEnvData.REDISPASS,

            retryStrategy: (times: number) => {
                if (times > this.maxRetries) {
                    console.error('Max reconnection attempts reached. Giving up.');
                    return null;  
                }
                return this.retryDelay; 
            },
            maxRetriesPerRequest: this.maxRetriesPerRequest,
            enableReadyCheck: true,
            reconnectOnError: (err: Error) => {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) { 
                    return true;
                }
                return false;
            }
        }); 

        this.client.on('connect', () => {
            console.log('Redis client connecting...');
        });

        this.client.on('ready', () => {
            console.log('Redis client connected and ready');
            this.retryCount = 0;  
        });

        this.client.on('error', (err: Error) => {
            console.error('Redis client error:', err); 
        });

        this.client.on('close', () => {
            console.log('Redis client closed connection');
        });

        this.client.on('reconnecting', () => {
            this.retryCount++;
            console.log(`Redis client reconnecting... Attempt ${this.retryCount}`);
        });

        this.client.on('end', () => {
            console.log('Redis client connection ended');
        });
    }

    public getClient(): Redis {
        return this.client;
    }

    public async disconnect(): Promise<void> {
        await this.client.quit();
    }
}

export default RedisClient;