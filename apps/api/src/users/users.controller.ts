import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledPost } from '../scheduled_posts/entities/scheduled_post.entity';
import { UserEntity } from './user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(ScheduledPost)
    private readonly scheduledPostsRepo: Repository<ScheduledPost>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy = 'username',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const queryBuilder = this.userRepo.createQueryBuilder('user');

    // Search functionality
    if (search) {
      queryBuilder.where(
        'user.username ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    // Sorting
    const allowedSortFields = ['username', 'email', 'created_at'];
    const validSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'username';
    queryBuilder.orderBy(`user.${validSortBy}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Pagination
    const users = await queryBuilder
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getMany();

    // Add posts count for each user
    const usersWithPostsCount = await Promise.all(
      users.map(async (user) => {
        const postsCount = await this.scheduledPostsRepo.count({
          where: { user_id: user.id },
        });
        return { ...user, postsCount };
      }),
    );

    return {
      data: usersWithPostsCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.delete(id);
    await this.scheduledPostsRepo.delete({ user_id: id });
    return { deleted: true };
  }
}
