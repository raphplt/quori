import { Module } from '@nestjs/common';
import { LinkedinController } from './linkedin.controller';
import { LinkedinPublisherService } from './linkedin-publisher.service';
import { LinkedinAuthModule } from '../linkedin-auth/linkedin-auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../github/entities/post.entity';
import { HttpLinkedInApi } from './linkedin.api';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [LinkedinAuthModule, TypeOrmModule.forFeature([Post]), UsersModule],
  controllers: [LinkedinController],
  providers: [
    LinkedinPublisherService,
    { provide: 'LinkedInApi', useClass: HttpLinkedInApi },
  ],
  exports: [LinkedinPublisherService],
})
export class LinkedinModule {}
