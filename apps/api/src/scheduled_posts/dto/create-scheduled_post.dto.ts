import { IsISO8601, IsNumberString } from 'class-validator';

export class CreateScheduledPostDto {
  @IsNumberString()
  postId!: number;

  @IsISO8601()
  scheduledAt!: string;
}
