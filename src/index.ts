import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ParseEnvData } from "@/utils/Env";
import { AuthRoute } from "./api/auth";
import { connectToDatabase } from "./lib/Database";
import { HandleGlobalError } from "./utils/Error";
import { EmailQueueService } from "./services/queue/emailQueue.services";

const app = express();
 
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.use("/auth", AuthRoute);
 
app.use(HandleGlobalError);
 
const queueConsumer = async () => {
    try {
        await EmailQueueService.consumeMail();
        console.log("[QueueConsumer] RabbitMQ email consumer started.");
    } catch (err) {
        console.error("[QueueConsumer] Failed to start consumer:", err);
    }
};
 
const startServer = async () => {
    try {
        await connectToDatabase();
        await queueConsumer();

        const server = app.listen(ParseEnvData.NodePort, () => {
            console.log(`Server is running at port ${ParseEnvData.NodePort}`);
        });

        process.on('unhandledRejection', (reason) => {
            console.error('[Unhandled Rejection]:', reason);
        });

        process.on('uncaughtException', (error) => {
            console.error('[Uncaught Exception]:', error);
            shutdown(server);
        });

    } catch (err) {
        console.error("[Startup Error]:", err);
        process.exit(1);
    }
};

const shutdown = (server: ReturnType<typeof app.listen>) => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(1);
    });

    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

startServer();
