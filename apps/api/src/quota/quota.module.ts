import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DEFAULT_JWT_SECRET } from '../common/constants';
import { QuotaService } from './quota.service';
import { QuotaController } from './quota.controller';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [
    GithubModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || DEFAULT_JWT_SECRET,
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [QuotaService],
  controllers: [QuotaController],
})
export class QuotaModule {}
