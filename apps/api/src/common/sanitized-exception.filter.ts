import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { RequestWithContext } from './request-context.middleware';

@Catch()
export class SanitizedExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<RequestWithContext>();
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttpException ? this.publicMessage(exception) : 'Internal server error';

    if (!isHttpException) {
      console.error(JSON.stringify({
        level: 'error',
        requestId: request.requestId,
        method: request.method,
        path: request.path,
        statusCode,
        event: 'unexpected_error',
      }));
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: isHttpException ? exception.name.replace('Exception', '') : 'InternalServerError',
      requestId: request.requestId,
    });
  }

  private publicMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') return response;
    if (typeof response === 'object' && response !== null && 'message' in response) {
      const message = (response as { message?: unknown }).message;
      return typeof message === 'string' ? message : 'Request validation failed';
    }
    return 'Request validation failed';
  }
}
