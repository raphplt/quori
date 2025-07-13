import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Installation } from './installation.entity';

export type EventType =
  | 'push'
  | 'pull_request'
  | 'issues'
  | 'release'
  | 'fork'
  | 'star'
  | 'create'
  | 'delete'
  | 'workflow_run'
  | 'other';

export type EventStatus =
  | 'pending' // En attente de traitement
  | 'processing' // En cours de traitement
  | 'processed' // Traité avec succès
  | 'failed' // Échec du traitement
  | 'ignored'; // Ignoré (pas pertinent pour génération de post)

@Entity({ name: 'events' })
export class Event {
  @PrimaryColumn('text')
  delivery_id!: string;

  @ManyToOne(() => Installation)
  @JoinColumn({ name: 'installation_id' })
  installation!: Installation;

  @Index()
  @Column('text')
  event!: string;

  // Type d'événement normalisé pour faciliter les requêtes
  @Index()
  @Column('varchar', { length: 32 })
  event_type!: EventType;

  @Column('jsonb')
  payload!: Record<string, unknown>;

  @Index()
  @Column('text')
  repo_full_name!: string;

  // Informations de l'auteur de l'événement
  @Column('text', { nullable: true })
  author_login?: string;

  @Column('text', { nullable: true })
  author_avatar_url?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  received_at!: Date;

  // Statut de traitement plus granulaire
  @Index()
  @Column('varchar', { length: 16, default: 'pending' })
  status!: EventStatus;

  // Timestamp du dernier traitement
  @Column('timestamptz', { nullable: true })
  processed_at?: Date;

  // Message d'erreur si le traitement a échoué
  @Column('text', { nullable: true })
  error_message?: string;

  // Nombre de tentatives de traitement
  @Column('int', { default: 0 })
  retry_count!: number;
}
