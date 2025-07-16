import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Installation } from '../../github/entities/installation.entity';

@Entity({ name: 'templates' })
export class Template {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column('varchar', { length: 64 })
  name!: string;

  @Column('text')
  description!: string;

  @Column('text')
  promptModifier!: string;

  @ManyToOne(() => Installation, { nullable: true })
  @JoinColumn({ name: 'installation_id' })
  installation?: Installation | null;
}
