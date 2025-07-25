import { PartialType } from '@nestjs/swagger';
import { CreateScheduledPostDto } from './create-scheduled_post.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ScheduledPostStatus } from '../entities/scheduled_post.entity';

export class UpdateScheduledPostDto extends PartialType(CreateScheduledPostDto) {
  @IsOptional()
  @IsEnum(ScheduledPostStatus)
  status?: ScheduledPostStatus;
}
