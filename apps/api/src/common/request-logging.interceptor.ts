import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Response } from 'express';
import { RequestWithContext } from './request-context.middleware';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithContext>();
    const response = http.getResponse<Response>();
    const startedAt = performance.now();

    return next.handle().pipe(tap({
      next: () => this.log(request, response, startedAt),
      error: (error: unknown) => this.log(
        request,
        response,
        startedAt,
        error instanceof HttpException ? error.getStatus() : 500,
      ),
    }));
  }

  private log(request: RequestWithContext, response: Response, startedAt: number, statusCode = response.statusCode): void {
    console.log(JSON.stringify({
      level: 'info',
      requestId: request.requestId,
      method: request.method,
      path: request.path,
      statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    }));
  }
}
