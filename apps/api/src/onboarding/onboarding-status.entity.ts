import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity({ name: 'onboarding_status' })
export class OnboardingStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('int', { default: 0 })
  step!: number; // 0 = not started, 1-4 = onboarding steps, 5 = finished

  @Column('boolean', { default: false })
  finished!: boolean;

  @Column('timestamptz', { nullable: true })
  startedAt?: Date;

  @Column('timestamptz', { nullable: true })
  completedAt?: Date;

  @OneToOne(() => UserEntity, (user) => user.onboardingStatus)
  user?: UserEntity;
}
