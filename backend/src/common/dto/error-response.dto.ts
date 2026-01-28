export class ErrorResponseDto {
  error: {
    code: string;
    message: string;
    details?: any[];
  };

  constructor(code: string, message: string, details?: any[]) {
    this.error = {
      code,
      message,
      ...(details && details.length > 0 && { details }),
    };
  }
}
