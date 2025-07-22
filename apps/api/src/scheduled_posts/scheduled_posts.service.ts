import { Injectable } from '@nestjs/common';
import { CreateScheduledPostDto } from './dto/create-scheduled_post.dto';
import { UpdateScheduledPostDto } from './dto/update-scheduled_post.dto';

@Injectable()
export class ScheduledPostsService {
  create(createScheduledPostDto: CreateScheduledPostDto) {
    return 'This action adds a new scheduledPost';
  }

  findAll() {
    return `This action returns all scheduledPosts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scheduledPost`;
  }

  update(id: number, updateScheduledPostDto: UpdateScheduledPostDto) {
    return `This action updates a #${id} scheduledPost`;
  }

  remove(id: number) {
    return `This action removes a #${id} scheduledPost`;
  }
}
