import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001).then(() => {
    console.log(
      `Application is running on: http://localhost:${process.env.PORT ?? 3001}`,
    );
  });
}
bootstrap().catch((error) =>
  console.error('Application failed to start', error),
);
