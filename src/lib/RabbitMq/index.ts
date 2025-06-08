import { ParseEnvData } from "@/utils/Env";
import { sleep } from "@/utils/time";
import amqp, { ConsumeMessage } from "amqplib";


export class RabbitMQ {

    public channel!: amqp.Channel;
    public queue: string = "";
    public queueConnection!: amqp.ChannelModel;
    public reconnectDelay: number = 5000;
    public reconnectMaxRetries: number = 10;

    constructor(params: Partial<{ queue: string, reconnectDelay: number, reconnectMaxRetries: number }> | null | undefined = {}) {
        const allparams = { ...params }  
        if (!allparams.queue?.trim()) { 
            throw new Error("Queue name must be present", { cause: "queue-name" });
        }
        this.queue = allparams.queue?.trim() || "unknown-queue";
        this.reconnectDelay = Number(String(this.reconnectDelay)) | this.reconnectDelay;
        this.reconnectMaxRetries = Number(String(this.reconnectMaxRetries)) | this.reconnectMaxRetries;
    };

    public async initializeConnection(): Promise<typeof this.channel | null> {
        try {

            this.queueConnection = await amqp.connect({
                username: ParseEnvData.RABBITMQUSER,
                port: Number(ParseEnvData.RABBITMQPORT),
                hostname: ParseEnvData.RABBITMQHOST,
                password: ParseEnvData.RABBITMQPASSWORD
            });

            this.queueConnection.on("connect", () => {
                console.log("Connected to Messaging Queue");
            });

            this.queueConnection.on("close", (err) => {
                console.log("MQ connection closed :", err.message);
                this.Reconnect();
            });

            this.queueConnection.on("error", (err) => {
                console.log("MQ connection error :", err.message);
                this.Reconnect();
            });

            this.channel = await this.queueConnection.createChannel();
            console.log("Created channel MQ");

            await this.channel.assertQueue(this.queue);

            return this.channel;

        } catch (error: any) {
            console.error("Error connecting to rabbit-mq :", error?.message);
            this.Reconnect();
            return null
        }
    }

    private async Reconnect(): Promise<typeof this.initializeConnection | undefined | null> {
        try {
            if (this.channel) {
                try {
                    console.log("Retrying MQ channel recovery");
                    await this.channel.recover();
                    return;
                } catch (err: any) {
                    console.error("Error MQ channel recovery", err.message);
                }
            }

            for (let i = 0; i < this.reconnectMaxRetries; i++) {
                console.log("Retrying MQ connection", i, "time");
                const conn = await this.initializeConnection();
                if (conn) {
                    return;
                }
                await sleep(Math.round(this.reconnectDelay));

            }
            throw new Error("Max retries attempted to re-connect MQ", {
                cause: "max-retries-exceeded",
            });
        } catch (error: any) {
            console.error("Error re-connecting to rabbit-mq :", error.message);
        }
    }

    validateChannel() {
        if (!this.queueConnection) {
            throw new Error("Invalid MQ connection", { cause: "invalid-connection" });
        }
        if (!this.channel) {
            throw new Error("Invalid MQ channel", { cause: "invalid-channel" });
        }
    }

    public sendMessage(data: { [k: string]: any }, publishOptions: amqp.Options.Publish = {}): boolean {
        try {
            this.validateChannel();
            const name = this.queue;
            if (!name.trim()) {
                throw new Error("Queue name must be present");
            }
            if (!data || typeof data !== "object") {
                throw new Error("Data must be object");
            }
            const str = JSON.stringify(data);
            const buffer = Buffer.from(str);
            const sent = this.channel?.sendToQueue(
                name.trim(),
                buffer,
                publishOptions || {}
            );
            if (!sent) {
                throw new Error("Message not sent");
            }
            console.log("Message sent MQ");
            return true;
        } catch (error: any) {
            console.error("Error sending message by rabbit-mq :", error);
            return false;
        }
    }

    async consumeQueues(
        consumeQueue: (msg: ConsumeMessage) => Promise<boolean>,
        consumeOptions: amqp.Options.Consume | null = {}
    ) {
        try {
            this.validateChannel();
            const name = this.queue;
            if (!name.trim()) {
                throw new Error("Queue name must be present");
            }

            await this.channel.consume(
                name.trim(),
                async (msg) => {
                    if (!msg) return;

                    try {
                        const success = await consumeQueue(msg);
                        success && this.channel.ack(msg);
                        !success && this.channel.nack(msg, false, false);
                    } catch (err) {
                        console.error("Error processing message:", err);
                        this.channel.nack(msg, false, false);
                    }
                },
                {
                    noAck: false,
                    ...consumeOptions,
                }
            );
        } catch (err) {
            console.error("Error consuming rabbit-mq:", err);
        }
    }

}