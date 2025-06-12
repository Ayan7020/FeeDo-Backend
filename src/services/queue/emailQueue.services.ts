import { RabbitMQ } from "@/lib/RabbitMq";
import { ConsumeMessage } from "amqplib";
import nodeMailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { ParseEnvData } from "@/utils/Env";

interface SendEmailPayload {
    user_firstname: string;
    otp: string;
    email: string;
    subject?: string;
}

class Service {
    private static instance: Service;
    private rabbitMQ!: RabbitMQ;
    private isInitialized = false;
    private readonly queueName = "mail-sending-queue"; 

    private constructor() {
        this.rabbitMQ = new RabbitMQ({ queue: this.queueName || "mail-sending-queue" });
    }

    public static getInstance(): Service {
        if (!Service.instance) {
            Service.instance = new Service();
        }
        return Service.instance;
    }

    private async initializeConnection(): Promise<void> {
        if (this.isInitialized) return;
        const channel = await this.rabbitMQ.initializeConnection();
        if (channel) {
            this.isInitialized = true;
            console.log("[EmailQueueService] MQ connection initialized");
        } else {
            console.error("[EmailQueueService] MQ initialization failed");
        }
    }

    private static async sendEmailViaSMTP(payload: SendEmailPayload): Promise<boolean> {
        try {
            const templatePath = path.resolve(__dirname, "../../utils/views/email.ejs");

            const htmlContent = await ejs.renderFile(templatePath, {
                user_firstname: payload.user_firstname,
                otp: payload.otp,
            });

            const transporter = nodeMailer.createTransport({
                service: 'gmail',  
                auth: {
                    user: ParseEnvData.MAILEUSERNAME,  
                    pass: ParseEnvData.MAILPASSWORD,    
                },
            });

            const mailOptions = {
                from: ParseEnvData.MAILEUSERNAME || "no-reply@feedo.com",
                to: payload.email,
                subject: payload.subject ?? "Your FeeDo Email Verification Code",
                html: htmlContent,
            };

            await transporter.sendMail(mailOptions);
            console.log(`[SMTP] Email sent to ${payload.email}`);
            return true;

        } catch (error: any) {
            console.error("[SMTP] Error sending email:", error?.message);
            return false;
        }
    }

    public static async sendMailToQueue(payload: SendEmailPayload): Promise<boolean> {
        try {
            const service = this.getInstance();
            await service.initializeConnection();

            if (
                typeof payload !== "object" ||
                !payload.email ||
                typeof payload.email !== "string" ||
                !payload.email.trim()
            ) {
                console.error("[Queue Payload Error] Missing or invalid 'email'");
                return false;
            }


            return service.rabbitMQ.sendMessage(payload);
        } catch (error: any) {
            console.error("[RabbitMQ][sendMessage] Error:", error?.message);
            return false;
        }
    }

    public static async consumeMail(): Promise<void> {
        const service = this.getInstance();
        await service.initializeConnection();

        const onMessage = async (msg: ConsumeMessage): Promise<boolean> => {
            try {
                const payload = JSON.parse(msg.content.toString());

                if (!payload?.email) {
                    console.warn("[Consumer] Invalid payload: Missing email.");
                    return false;
                }

                console.log(`[Consumer] Processing email for: ${payload.email}`);
                return await this.sendEmailViaSMTP(payload);

            } catch (error: any) {
                console.error("[Consumer] Failed to process message:", error?.message);
                return false;
            }
        };

        await service.rabbitMQ.consumeQueues(onMessage);
    }
}

export const EmailQueueService = Service;
