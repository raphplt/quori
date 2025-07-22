import { PartialType } from '@nestjs/swagger';
import { CreateScheduledPostDto } from './create-scheduled_post.dto';

export class UpdateScheduledPostDto extends PartialType(CreateScheduledPostDto) {}
