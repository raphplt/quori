import { IsISO8601, IsNumber } from 'class-validator';

export class CreateScheduledPostDto {
  @IsNumber()
  postId!: number;

  @IsISO8601()
  scheduledAt!: string;
}
