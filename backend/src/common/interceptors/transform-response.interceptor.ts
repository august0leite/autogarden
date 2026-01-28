import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResponseDto } from "../dto";

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseDto<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // Se já está no formato correto, retorna como está
        if (data && typeof data === "object" && "data" in data) {
          return data;
        }
        // Senão, envolve no formato { data: ... }
        return new ResponseDto(data);
      }),
    );
  }
}
