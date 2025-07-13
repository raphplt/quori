import { IsEnum, IsNotEmpty } from 'class-validator';

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
  @IsNotEmpty()
  @IsEnum(['draft', 'ready', 'scheduled', 'published', 'failed'])
  status!: 'draft' | 'ready' | 'scheduled' | 'published' | 'failed';
}
