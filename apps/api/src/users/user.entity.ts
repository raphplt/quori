import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { OnboardingStatusEntity } from '../onboarding/onboarding-status.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text')
  github_id!: string;

  @Column('text')
  username!: string;

  @Column('text')
  email!: string;

  @Column('text')
  avatar_url!: string;

  @Column('text')
  name!: string;

  @Column('text', { nullable: true })
  github_access_token?: string;

  @Column('text', { nullable: true })
  refresh_token?: string;

  @Column('timestamptz', { nullable: true })
  refresh_token_expires?: Date;

  @Column('uuid', { nullable: true })
  onboarding_status_id?: string;

  @OneToOne(
    () => OnboardingStatusEntity,
    (onboardingStatus) => onboardingStatus.user,
    { cascade: true, eager: true },
  )
  @JoinColumn({ name: 'onboarding_status_id' })
  onboardingStatus?: OnboardingStatusEntity;

  @Column('timestamptz', { default: () => 'now()' })
  created_at!: Date;

  @Column('timestamptz', { default: () => 'now()' })
  updated_at!: Date;
}
