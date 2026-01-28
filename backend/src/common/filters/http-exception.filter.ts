import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && "message" in exceptionResponse) {
        const message = exceptionResponse.message;
        const messageStr = Array.isArray(message) ? message.join(", ") : String(message);

        errorResponse = {
          error: {
            code: this.getErrorCode(status, exceptionResponse),
            message: messageStr,
            details: Array.isArray(message) ? message : undefined,
          },
        };
      } else {
        errorResponse = {
          error: {
            code: this.getErrorCode(status),
            message: exception.message,
          },
        };
      }
    } else {
      // Erro inesperado (500)
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );

      errorResponse = {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      };
    }

    // Log estruturado
    this.logger.error({
      statusCode: status,
      path: request.url,
      method: request.method,
      error: errorResponse.error,
    });

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number, exceptionResponse?: any): string {
    // Se já tem um código customizado
    if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "error" in exceptionResponse
    ) {
      return exceptionResponse.error;
    }

    // Códigos padrão por status
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "VALIDATION_ERROR";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      case HttpStatus.CONFLICT:
        return "CONFLICT";
      default:
        return "INTERNAL_SERVER_ERROR";
    }
  }
}
