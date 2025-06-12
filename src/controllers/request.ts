import { ZodError, ZodObject } from "zod"
import { Request, NextFunction, Response } from "express"; 


type DynamicObject = { [k: string]: any };
type Data = any;

export class RequestValidator {
    static Options = {
        handleSuccess: {
            success: true,
            message: "The Request is succcessfully Done",
            data: null,
            status: 200,
            appendData: {} as DynamicObject
        },
        handleNotFound: {
            success: false,
            message: "Not found",
            data: null,
            status: 404,
            errorType: undefined,
            appendData: {} as DynamicObject,
        },

        handleErrorOptions: {
            success: false,
            message: "Error occurred",
            errorType: "error",
            data: null as Data,
            status: 400,
            appendData: {} as DynamicObject,
        },
    }

    static handleSuccess = (res: Response, options?: Partial<typeof this.Options.handleSuccess>) => {
        const allOptions = {
            ...this.Options.handleSuccess,
            ...options,
        };
        res.status(allOptions.status).send({
            success: allOptions.success,
            message: allOptions.message, 
            data: allOptions.data,
            ...allOptions.appendData,
        });
        return;
    }
    static handleNotFound = (res: Response, options?: Partial<typeof this.Options.handleNotFound>) => {
        const allOptions = {
            ...this.Options.handleNotFound,
            ...options,
        };
        res.status(allOptions.status).send({
            success: allOptions.success,
            message: allOptions.message,
            errorType: allOptions.errorType,
            data: allOptions.data,
            ...allOptions.appendData,
        });
        return;
    };
    static handleError = (res: Response, options?: Partial<typeof this.Options.handleErrorOptions>) => {
        const allOptions = {
            ...this.Options.handleErrorOptions,
            ...options,
        };

        res.status(allOptions.status).send({
            success: allOptions.success,
            message: allOptions.message,
            errorType: allOptions.errorType,
            data: allOptions.data,
            ...allOptions.appendData,
        })
        return;
    }

    static bodyValidator = (schema: ZodObject<any>) =>
        async (req: Request, res: Response, next: NextFunction) => {
            const body = req.body;
            try {
                if (!body) {
                    return this.handleError(res, {
                        message: "Body is invalid",
                        errorType: "body-invalid"
                    })
                }
                if (!Object.keys(body).length) {
                    return this.handleError(res, {
                        message: "Body is empty",
                        errorType: "body-invalid",
                    });
                }
                schema.parse(body);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const first = error.errors[0]
                    return this.handleError(res, {
                        message: first?.message || "Zod Validation Failed",
                        errorType: "body-validation",
                        appendData: {
                            field: first?.path?.[0],
                            validationError: true,
                        },
                    })
                }
                return this.handleError(res, {
                    message: "Unknown validation error",
                    errorType: "body-validation-unknown",
                    appendData: { error },
                });
            }
        }
}