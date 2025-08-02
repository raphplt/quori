import { IsString, IsIn, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { PostRate, PostStatus } from 'src/common/dto/posts.enum';

export class PostDto {
  id!: number;
  summary!: string;
  postContent!: string;
  status!: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  impressions!: number;
  likes!: number;
  comments!: number;
  template?: string;
  tone?: string;
  createdAt!: Date;
  updatedAt!: Date;
  installation?: {
    id: number;
    account_login: string;
  };
  event?: {
    delivery_id: string;
    repo_full_name: string;
  };
}

export class PostsPageDto {
  posts!: PostDto[];
  total!: number;
  page!: number;
  limit!: number;
}

export class UpdatePostStatusDto {
  @IsString()
  @IsIn(Object.values(PostStatus))
  status!: PostStatus;
}

export class PostFeedbackDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  feedbackComment?: string;

  @IsOptional()
  @IsEnum(PostRate)
  feedbackRate?: PostRate;
}
