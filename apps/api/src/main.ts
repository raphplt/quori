import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS pour permettre les requêtes du frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`API démarrée sur le port ${port}`);
}
bootstrap().catch((err) => {
  console.error("Erreur au démarrage de l'application:", err);
  process.exit(1);
});
