import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ParseEnvData } from "@/utils/Env";
import { AuthRoute } from "./api/auth";
import { connectToDatabase, prisma } from "./lib/Database";
import { HandleGlobalError } from "./utils/Error";
import RedisClient from "./lib/Redis";

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes 
app.use("/auth", AuthRoute);

app.use(HandleGlobalError)

const server = app.listen(ParseEnvData.NodePort, async () => {
  await connectToDatabase();
  const redisClient = new RedisClient();
  if (!redisClient.getClient()) {
    console.log("[Redis] connection failed!!!")
    process.exit(1)
  } 
  console.log(`Server is running at port ${ParseEnvData.NodePort}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection]:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]:', error);
  shutdown();
});

const shutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(1);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};