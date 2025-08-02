import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/user.entity';
import { Post } from '../../github/entities/post.entity';

export enum ScheduledPostStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  DONE = 'done',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

@Entity({ name: 'scheduled_posts' })
export class ScheduledPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  user_id!: string;

  @ManyToOne(() => UserEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column('bigint')
  post_id!: number;

  @ManyToOne(() => Post, { eager: false })
  @JoinColumn({ name: 'post_id' })
  post?: Post;

  @Column('timestamptz')
  scheduled_at!: Date;

  @Column({
    type: 'enum',
    enum: ScheduledPostStatus,
    default: ScheduledPostStatus.SCHEDULED,
  })
  status!: ScheduledPostStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
