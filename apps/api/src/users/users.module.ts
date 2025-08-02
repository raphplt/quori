import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { UsersController } from './users.controller';
import { ScheduledPost } from '../scheduled_posts/entities/scheduled_post.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ScheduledPost])],
  providers: [UsersService, RolesGuard],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
