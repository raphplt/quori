import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { json } from 'body-parser';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as compression from 'compression';

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

  // Compression pour améliorer les performances
  app.use(compression());

  // Middleware de sécurité supplémentaire
  app.use((req, res, next) => {
    // Supprimer les headers sensibles
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Ajouter des headers de sécurité supplémentaires
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    next();
  });

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
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        xFrameOptions: { action: 'deny' },
        xContentTypeOptions: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      }),
    );
  }

  // Body parser
  app.use(
    json({
      limit: isProduction ? '5mb' : '10mb',
      verify: (req: RawBodyRequest, _res, buf: Buffer) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  // CORS
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

  app.useGlobalFilters(new HttpExceptionFilter(configService));

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
      rolling: true,
      unset: 'destroy',
    }),
  );

  app.setGlobalPrefix('api');

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

    if (isProduction) {
      logger.log(
        `🔒 CORS enabled for ${allowedOrigins.length} allowed origins`,
      );
    } else {
      logger.log(`🔒 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
    }
  });
}

bootstrap().catch((error) => {
  console.error('Application failed to start', error);
  process.exit(1);
});
