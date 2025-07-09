import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Installation } from './installation.entity';

@Entity({ name: 'events' })
export class Event {
  @PrimaryColumn('text')
  delivery_id!: string;

  @ManyToOne(() => Installation)
  @JoinColumn({ name: 'installation_id' })
  installation!: Installation;

  @Column('text')
  event!: string;

  @Column('jsonb')
  payload!: Record<string, unknown>;

  @Column('text')
  repo_full_name!: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column('timestamptz', { default: () => 'now()' })
  received_at!: Date;

  @Column('boolean', { default: false })
  processed!: boolean;
}
