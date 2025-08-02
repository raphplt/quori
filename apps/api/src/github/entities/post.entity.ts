import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Installation } from './installation.entity';
import { Event } from './event.entity';
import { PostRate, PostStatus } from 'src/common/dto/posts.enum';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => Installation, { nullable: true })
  @JoinColumn({ name: 'installation_id' })
  installation?: Installation;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({
    name: 'event_delivery_id',
    referencedColumnName: 'delivery_id',
  })
  event?: Event;

  // Résumé court
  @Column('text')
  summary!: string;

  // Contenu complet du post
  @Column('text')
  postContent!: string;

  // Données brutes
  @Column('jsonb')
  rawResponse!: any;

  @Index()
  @Column('varchar', { length: 16, default: 'draft' })
  status!: PostStatus;

  @Column('varchar', {
    length: 16,
    name: 'status_linkedin',
    default: 'pending',
  })
  statusLinkedin!: 'pending' | 'published' | 'failed';

  @Column('varchar', { default: 0, nullable: true })
  feedbackRate?: PostRate;

  @Column('text', { nullable: true })
  feedbackComment?: string;

  @Column('timestamptz', { nullable: true })
  scheduledAt?: Date;

  // Données LinkedIn une fois publié
  @Column('text', { nullable: true })
  externalId?: string;

  @Column('timestamptz', { nullable: true })
  publishedAt?: Date;

  // Metrics LinkedIn
  @Column('int', { default: 0 })
  impressions!: number;

  @Column('int', { default: 0 })
  likes!: number;

  @Column('int', { default: 0 })
  comments!: number;

  // Template ou style choisi par l’utilisateur
  @Column('varchar', { length: 32, nullable: true })
  template?: string;

  @Column('varchar', { length: 32, nullable: true })
  tone?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
