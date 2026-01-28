import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter, TransformResponseInterceptor } from "./common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Versionamento global: todas as rotas começam com /v1
  app.setGlobalPrefix("v1");

  // Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Interceptor para padronizar respostas de sucesso { data: ... }
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Filter para padronizar respostas de erro { error: { code, message, details } }
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
