import { Column, Entity, PrimaryColumn } from 'typeorm';

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

  @Column('timestamptz', { default: () => 'now()' })
  created_at!: Date;

  @Column('timestamptz', { default: () => 'now()' })
  updated_at!: Date;
}
