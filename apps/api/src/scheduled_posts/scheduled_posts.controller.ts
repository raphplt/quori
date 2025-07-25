import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ScheduledPostsService } from './scheduled_posts.service';
import { CreateScheduledPostDto } from './dto/create-scheduled_post.dto';
import { UpdateScheduledPostDto } from './dto/update-scheduled_post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScheduledPostStatus } from './entities/scheduled_post.entity';

interface AuthenticatedRequest {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('scheduled-posts')
export class ScheduledPostsController {
  constructor(private readonly service: ScheduledPostsService) {}

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateScheduledPostDto,
  ) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: ScheduledPostStatus,
    @Query('limit') limit = '10',
    @Query('offset') offset = '0',
  ) {
    const limitNum = parseInt(limit, 10) || 10;
    const offsetNum = parseInt(offset, 10) || 0;
    return this.service.findAll(req.user.id, status, limitNum, offsetNum);
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateScheduledPostDto,
  ) {
    return this.service.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.service.remove(id, req.user.id);
    return { success: true };
  }
}
