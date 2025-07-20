import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { json } from 'body-parser';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';

interface RawBodyRequest extends Request {
  rawBody?: string;
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Sécurité en production
  if (isProduction) {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
      }),
    );
  }

  // Configuration du body parser
  app.use(
    json({
      limit: '10mb',
      verify: (req: RawBodyRequest, _res, buf: Buffer) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  // Configuration des origines CORS selon l'environnement
  const allowedOrigins = isProduction
    ? [
        'https://quori.dev',
        'https://www.quori.dev',
        configService.get('FRONTEND_URL'),
      ].filter(Boolean)
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        configService.get('FRONTEND_URL'),
      ].filter(Boolean);

  // Configure CORS
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Accept',
      'Accept-Language',
      'Last-Event-ID',
      'Connection',
    ],
    exposedHeaders: ['Content-Type', 'Cache-Control', 'Connection'],
  });

  // Configuration de la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // Configuration des sessions avec sécurité renforcée
  const sessionSecret = configService.get<string>('SESSION_SECRET');
  if (!sessionSecret && isProduction) {
    logger.error('SESSION_SECRET is required in production environment');
    process.exit(1);
  }

  app.use(
    session({
      secret: sessionSecret || 'dev-session-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: isProduction ? 'strict' : 'lax',
        ...(isProduction && {
          domain: '.quori.dev',
        }),
      },
      name: 'quori-session',
    }),
  );

  app.setGlobalPrefix('api');

  // Configuration Swagger (uniquement en développement)
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Quori API')
      .setDescription('The Quori API documentation')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('github', 'GitHub integration endpoints')
      .addBearerAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory);
  }

  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port).then(() => {
    logger.log(`🚀 API is running on: http://localhost:${port}`);
    logger.log(
      `🌍 Environment: ${configService.get('NODE_ENV') || 'development'}`,
    );

    if (!isProduction) {
      logger.log(
        `📚 Swagger docs available at: http://localhost:${port}/api/docs`,
      );
    }

    logger.log(`🔒 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  });
}

bootstrap().catch((error) => {
  console.error('Application failed to start', error);
  process.exit(1);
});
