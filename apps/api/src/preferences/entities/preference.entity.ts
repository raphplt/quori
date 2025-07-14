import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../users/user.entity';

@Entity({ name: 'preferences' })
export class Preference {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Index({ unique: true })
  @Column('text')
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user!: UserEntity;

  @Column('varchar', { length: 32 })
  favoriteTone!: string;

  @Column('text', { nullable: true })
  customContext?: string;

  @Column('varchar', { length: 16, nullable: true })
  preferredLanguage?: string;

  @Column('text', { array: true, nullable: true })
  defaultOutputs?: string[];

  @Column('text', { array: true, nullable: true })
  hashtagPreferences?: string[];

  @Column('jsonb', { nullable: true })
  modelSettings?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
