import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  ScheduledPost,
  ScheduledPostStatus,
} from './entities/scheduled_post.entity';
import { CreateScheduledPostDto } from './dto/create-scheduled_post.dto';
import { UpdateScheduledPostDto } from './dto/update-scheduled_post.dto';
import { Post } from '../github/entities/post.entity';
import { GenerateService } from '../github/services/generate.service';
import { PostStatus } from 'src/common/dto/posts.enum';

@Injectable()
export class ScheduledPostsService {
  private readonly logger = new Logger(ScheduledPostsService.name);

  constructor(
    @InjectRepository(ScheduledPost)
    private readonly repo: Repository<ScheduledPost>,
    @InjectRepository(Post)
    private readonly posts: Repository<Post>,
    private readonly generate: GenerateService,
  ) {}

  async create(
    userId: string,
    dto: CreateScheduledPostDto,
  ): Promise<ScheduledPost> {
    const when = new Date(dto.scheduledAt);

    // Prevent duplicate schedule for same post
    const existing = await this.repo.findOne({
      where: { post_id: Number(dto.postId) },
    });
    if (existing) {
      throw new BadRequestException('Post already scheduled');
    }

    const entity = this.repo.create({
      user_id: userId,
      post_id: Number(dto.postId),
      scheduled_at: when,
      status: ScheduledPostStatus.SCHEDULED,
    });
    const saved = await this.repo.save(entity);

    // mirror to Post: mark as scheduled and set scheduledAt
    const post = await this.posts.findOne({
      where: { id: Number(dto.postId) },
    });
    if (post) {
      post.scheduledAt = when;
      post.status = PostStatus.SCHEDULED;
      await this.posts.save(post);
    }

    return saved;
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
      relations: ['post', 'post.installation', 'post.event'],
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
      // mirror on Post
      await this.posts.update(
        { id: Number(item.post_id) },
        { scheduledAt: item.scheduled_at },
      );
    }
    if (dto.status !== undefined) {
      item.status = dto.status;
      // if canceled, clear post scheduling and set status back to ready
      if (dto.status === ScheduledPostStatus.CANCELED) {
        const post = await this.posts.findOne({
          where: { id: Number(item.post_id) },
        });
        if (post) {
          post.scheduledAt = undefined;
          post.status = PostStatus.READY;
          await this.posts.save(post);
        }
      }
    }
    item.updated_at = new Date();
    return this.repo.save(item);
  }

  async remove(id: string, userId: string): Promise<void> {
    const sched = await this.findOne(id, userId);
    // clear post scheduledAt/status
    const post = await this.posts.findOne({
      where: { id: Number(sched.post_id) },
    });
    if (post) {
      post.scheduledAt = undefined;
      if (post.status === PostStatus.SCHEDULED) {
        post.status = PostStatus.READY;
      }
      await this.posts.save(post);
    }
    const result = await this.repo.delete({ id, user_id: userId });
    if (!result.affected) {
      throw new NotFoundException('Scheduled post not found');
    }
  }

  async markPendingDue(): Promise<void> {
    const now = new Date();
    const due = await this.repo.find({
      where: {
        scheduled_at: LessThanOrEqual(now),
        status: ScheduledPostStatus.SCHEDULED,
      },
    });
    for (const sched of due) {
      this.logger.log(`Scheduled ${sched.id} is due, marking pending`);
      sched.status = ScheduledPostStatus.PENDING;
      await this.repo.save(sched);
    }

    // Process pending items
    const pendings = await this.repo.find({
      where: { status: ScheduledPostStatus.PENDING },
      order: { scheduled_at: 'ASC' },
    });

    for (const sched of pendings) {
      try {
        await this.processScheduled(sched);
      } catch (e) {
        this.logger.error(
          `Failed to process scheduled ${sched.id}: ${(e as Error).message}`,
        );
      }
    }
  }

  private async processScheduled(s: ScheduledPost): Promise<void> {
    if (s.status !== ScheduledPostStatus.PENDING) return;

    s.status = ScheduledPostStatus.RUNNING;
    await this.repo.save(s);

    try {
      const postId = Number(s.post_id);
      const post = await this.posts.findOne({ where: { id: postId } });
      if (!post) throw new NotFoundException('Post not found');

      // Basic check: ensure post still scheduled (not manually published)
      if (post.status === PostStatus.PUBLISHED) {
        s.status = ScheduledPostStatus.DONE;
        await this.repo.save(s);
        return;
      }

      // Attempt publish with simple retry
      const maxAttempts = 3;
      let attempt = 0;
      let success = false;
      let lastError: Error | null = null;
      while (attempt < maxAttempts && !success) {
        try {
          attempt++;
          await this.generate.publishToLinkedIn(postId, s.user_id);
          success = true;
        } catch (err) {
          lastError = err as Error;
          this.logger.warn(
            `Publish attempt ${attempt} failed for scheduled ${s.id}: ${lastError?.message}`,
          );
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }
        }
      }

      if (!success) {
        throw lastError || new Error('Unknown publish failure');
      }

      // clear scheduledAt on post now that it's published
      const updated = await this.posts.findOne({ where: { id: postId } });
      if (updated) {
        updated.scheduledAt = undefined;
        await this.posts.save(updated);
      }

      s.status = ScheduledPostStatus.DONE;
      await this.repo.save(s);
    } catch (err) {
      s.status = ScheduledPostStatus.FAILED;
      await this.repo.save(s);
      throw new BadRequestException((err as Error).message);
    }
  }

  async retryFailed(id: string, userId: string): Promise<ScheduledPost> {
    const sched = await this.findOne(id, userId);
    if (sched.status !== ScheduledPostStatus.FAILED) {
      throw new BadRequestException('Schedule is not failed');
    }
    sched.status = ScheduledPostStatus.PENDING;
    await this.repo.save(sched);
    return sched;
  }
}
