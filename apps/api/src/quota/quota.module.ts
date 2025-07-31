import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { QuotaService } from './quota.service';
import { QuotaController } from './quota.controller';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [
    GithubModule,
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [QuotaService],
  controllers: [QuotaController],
})
export class QuotaModule {}
