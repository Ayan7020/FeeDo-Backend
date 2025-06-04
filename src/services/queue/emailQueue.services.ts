import { RabbitMQ } from "@/lib/RabbitMq";

class Service {
    private static instance: Service;
    private rabbitMQ!: RabbitMQ;
    private isInitialized: boolean = false;

    private constructor() {
        this.rabbitMQ = new RabbitMQ({ queue: "mail-sending-queue" });
    }

    public static getInstance(): Service {
        if (!Service.instance) {
            Service.instance = new Service();
        }
        return Service.instance;
    }

    public async initializeConnection(): Promise<void> {
        if (this.isInitialized) return;
        const channel = await this.rabbitMQ.initializeConnection();
        if (channel) {
            this.isInitialized = true;
            console.log("EmailQueueService: MQ connection initialized");
        } else {
            console.error("EmailQueueService: MQ initialization failed");
        }
    }

    public async sendMailPayload(payload: Record<string, any>): Promise<boolean> {
        if (!this.isInitialized) {
            await this.initializeConnection();  
        }
        return this.rabbitMQ.sendMessage(payload);
    }

}

export const EmailQueueService = Service.getInstance();
