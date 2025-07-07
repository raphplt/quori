import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Installation } from './installation.entity';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  post_id!: number;

  @ManyToOne(() => Installation)
  @JoinColumn({ name: 'installation_id' })
  installation!: Installation;

  @Column('text')
  repo_full_name!: string;

  @Column('text')
  event_type!: string;

  @Column('text')
  content_draft!: string;

  @Column('timestamptz', { default: () => 'now()' })
  created_at!: Date;
}
