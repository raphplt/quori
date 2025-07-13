import { Module } from '@nestjs/common';
import { QuotaService } from './quota.service';
import { QuotaController } from './quota.controller';
import { GithubModule } from '../github/github.module';

@Module({
  imports: [GithubModule],
  providers: [QuotaService],
  controllers: [QuotaController],
})
export class QuotaModule {}
