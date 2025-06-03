import { RequestValidator } from "@/controllers/request";
import { Prisma } from "@prisma/client"
import { NextFunction, Request, Response } from "express"


export const HandleGlobalError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        switch (err.code) {
            case 'P2002':
                // Unique constraint failed
                const target = (err.meta?.target as string[]) || [];
                return RequestValidator.handleError(res, {
                    status: 409,
                    errorType: "duplicate field",
                    message: `Unique constraint failed on the field(s): ${target.join(', ')}`,
                    appendData: {
                        field: target
                    }
                });
            case 'P2003':
                // Foreign key constraint failed
                return RequestValidator.handleError(res, {
                    status: 400,
                    errorType: "Invalid Foreign Key",
                    message: "A related record was not found or the relation is invalid.",
                });
            case 'P2025':
                // Record not found for update/delete
                return RequestValidator.handleError(res, {
                    status: 400,
                    errorType: "Not found",
                    message: "Requested record does not exist.",
                });
            default:
                console.error("[Unknown DB error]: ",err);
                return RequestValidator.handleError(res, {
                    status: 400,
                    errorType: "Unknown Database Error",
                    message: err.message
                })
        }
    }

    console.error("[Unknown Error]: ")
    RequestValidator.handleError(res, {
        status: 500,
        errorType: "server",
        message: 'Internal server error',
    })
}