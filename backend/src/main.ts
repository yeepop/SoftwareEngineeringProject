import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Frontend URLs
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('貓狗領養平台 API')
    .setDescription('貓狗領養平台的 RESTful API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`應用程式在 http://localhost:${port} 運行`);
  console.log(`API 文件在 http://localhost:${port}/api-docs 可以查看`);
}
bootstrap();