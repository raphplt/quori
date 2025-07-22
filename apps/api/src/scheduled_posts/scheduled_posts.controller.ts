import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScheduledPostsService } from './scheduled_posts.service';
import { CreateScheduledPostDto } from './dto/create-scheduled_post.dto';
import { UpdateScheduledPostDto } from './dto/update-scheduled_post.dto';

@Controller('scheduled-posts')
export class ScheduledPostsController {
  constructor(private readonly scheduledPostsService: ScheduledPostsService) {}

  @Post()
  create(@Body() createScheduledPostDto: CreateScheduledPostDto) {
    return this.scheduledPostsService.create(createScheduledPostDto);
  }

  @Get()
  findAll() {
    return this.scheduledPostsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduledPostsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduledPostDto: UpdateScheduledPostDto) {
    return this.scheduledPostsService.update(+id, updateScheduledPostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduledPostsService.remove(+id);
  }
}
