import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { ErrorResponseDto } from "../dto";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "An unexpected error occurred";
    let details: any[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object") {
        const responseObj = exceptionResponse as any;

        // Se já tem error.code, usa
        if (responseObj.error?.code) {
          code = responseObj.error.code;
          message = responseObj.error.message || exception.message;
          details = responseObj.error.details;
        } else {
          // Mapeia status HTTP para código de erro
          code = this.getErrorCodeFromStatus(status);
          message = responseObj.message || exception.message;

          // Valida detalhes de validação
          if (Array.isArray(responseObj.message)) {
            details = responseObj.message;
          }
        }
      } else {
        code = this.getErrorCodeFromStatus(status);
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = new ErrorResponseDto(code, message, details);
    response.status(status).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    const statusMap: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      422: "VALIDATION_ERROR",
      500: "INTERNAL_SERVER_ERROR",
    };

    return statusMap[status] || "INTERNAL_SERVER_ERROR";
  }
}
