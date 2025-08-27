import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ResponseDto } from './dtos/response-interceptor.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  private readonly _logger = new Logger(ResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = new ResponseDto(data);

        // Log de la respuesta para debugging
        this._logger.debug(
          JSON.stringify({
            context: context.getClass().name,
            method: context.getHandler().name,
            timestamp: new Date().toISOString(),
            success: response.success,
          }),
        );

        return response;
      }),
    );
  }
}
