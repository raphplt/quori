import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledPost } from '../scheduled_posts/entities/scheduled_post.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(ScheduledPost)
    private readonly scheduledPostsRepo: Repository<ScheduledPost>,
  ) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return Promise.all(
      users.map(async (user) => {
        const postsCount = await this.scheduledPostsRepo.count({
          where: { user_id: user.id },
        });
        return { ...user, postsCount };
      }),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.delete(id);
    await this.scheduledPostsRepo.delete({ user_id: id });
    return { deleted: true };
  }
}
