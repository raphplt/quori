import { Module } from '@nestjs/common';
import { LinkedinController } from './linkedin.controller';
import { LinkedinPublisherService } from './linkedin-publisher.service';
import { LinkedinAuthModule } from '../linkedin-auth/linkedin-auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../github/entities/post.entity';
import { HttpLinkedInApi } from './linkedin.api';

@Module({
  imports: [LinkedinAuthModule, TypeOrmModule.forFeature([Post])],
  controllers: [LinkedinController],
  providers: [LinkedinPublisherService, { provide: 'LinkedInApi', useClass: HttpLinkedInApi }],
})
export class LinkedinModule {}
