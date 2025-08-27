import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

interface ErrorDetails {
  message: string;
  timestamp: string;
  context: string;
  errorName?: string;
  errorCode?: string | number;
  statusCode?: number;
  stack?: string;
}

@Injectable()
export class AllyExceptionInterceptor implements NestInterceptor {
  private readonly _logger = new Logger(AllyExceptionInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(
        (error: Error & { code?: string | number; status?: number }) => {
          this._logger.error(
            `Error intercepted: ${error.message}`,
            error.stack,
            context.getClass().name,
          );

          // Si ya es un RpcException, lo re-lanzamos
          if (error instanceof RpcException) {
            return throwError(() => error);
          }

          // Para otros tipos de errores, creamos un RpcException con detalles
          const errorDetails: ErrorDetails = {
            message: error.message || 'Internal server error',
            timestamp: new Date().toISOString(),
            context: context.getClass().name,
          };

          // Agregar detalles adicionales según el tipo de error
          if (error.name) {
            errorDetails.errorName = error.name;
          }

          if (error.code) {
            errorDetails.errorCode = error.code;
          }

          if (error.status) {
            errorDetails.statusCode = error.status;
          }

          // Agregar stack trace en desarrollo
          if (process.env.NODE_ENV === 'development') {
            errorDetails.stack = error.stack;
          }

          // Log del error completo para debugging
          this._logger.error(
            JSON.stringify({
              error: errorDetails,
              originalError: {
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
              timestamp: new Date().toISOString(),
            }),
          );

          // Crear y lanzar RpcException con los detalles
          const rpcException = new RpcException({
            code: error.status || 500,
            message: `${error.status} ${errorDetails.message}`,
            details: errorDetails,
          });

          return throwError(() => rpcException);
        },
      ),
    );
  }
}
