import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsNumber,
} from 'class-validator';

export enum EventType {
  PUSH = 'push',
  PULL_REQUEST = 'pull_request',
  ISSUES = 'issues',
  RELEASE = 'release',
  FORK = 'fork',
  STAR = 'star',
  CREATE = 'create',
  DELETE = 'delete',
  WORKFLOW_RUN = 'workflow_run',
  OTHER = 'other',
}

export enum EventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  IGNORED = 'ignored',
}

export class CreateTestEventDto {
  @IsString()
  delivery_id!: string;

  @IsOptional()
  @IsNumber()
  installation_id?: number;

  @IsString()
  event!: string;

  @IsEnum(EventType)
  event_type!: EventType;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsString()
  repo_full_name!: string;

  @IsOptional()
  @IsString()
  author_login?: string;

  @IsOptional()
  @IsString()
  author_avatar_url?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsString()
  error_message?: string;
}
