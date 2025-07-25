import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ScheduledPost, ScheduledPostStatus } from './entities/scheduled_post.entity';
import { CreateScheduledPostDto } from './dto/create-scheduled_post.dto';
import { UpdateScheduledPostDto } from './dto/update-scheduled_post.dto';

@Injectable()
export class ScheduledPostsService {
  private readonly logger = new Logger(ScheduledPostsService.name);

  constructor(
    @InjectRepository(ScheduledPost)
    private readonly repo: Repository<ScheduledPost>,
  ) {}

  async create(userId: string, dto: CreateScheduledPostDto): Promise<ScheduledPost> {
    const entity = this.repo.create({
      user_id: userId,
      post_id: Number(dto.postId),
      scheduled_at: new Date(dto.scheduledAt),
      status: ScheduledPostStatus.SCHEDULED,
    });
    return this.repo.save(entity);
  }

  async findAll(
    userId: string,
    status?: ScheduledPostStatus,
    limit = 10,
    offset = 0,
  ): Promise<{ items: ScheduledPost[]; total: number }> {
    const where: Partial<ScheduledPost> = { user_id: userId };
    if (status) where.status = status;
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { scheduled_at: 'ASC' },
      take: limit,
      skip: offset,
    });
    return { items, total };
  }

  async findOne(id: string, userId: string): Promise<ScheduledPost> {
    const item = await this.repo.findOne({ where: { id, user_id: userId } });
    if (!item) throw new NotFoundException('Scheduled post not found');
    return item;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateScheduledPostDto,
  ): Promise<ScheduledPost> {
    const item = await this.findOne(id, userId);
    if (dto.scheduledAt !== undefined) {
      item.scheduled_at = new Date(dto.scheduledAt);
    }
    if (dto.status !== undefined) {
      item.status = dto.status;
    }
    item.updated_at = new Date();
    return this.repo.save(item);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.repo.delete({ id, user_id: userId });
    if (!result.affected) {
      throw new NotFoundException('Scheduled post not found');
    }
  }

  async markPendingDue(): Promise<void> {
    const now = new Date();
    const due = await this.repo.find({
      where: { scheduled_at: LessThanOrEqual(now), status: ScheduledPostStatus.SCHEDULED },
    });
    for (const post of due) {
      this.logger.log(`Post ${post.id} pending`);
      post.status = ScheduledPostStatus.PENDING;
      await this.repo.save(post);
    }
  }
}
