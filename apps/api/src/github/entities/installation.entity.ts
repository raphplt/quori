import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'installations' })
export class Installation {
  @PrimaryColumn({ type: 'bigint' })
  id!: number;

  @Column('text')
  account_login!: string;

  @Column('bigint')
  account_id!: number;

  @Column('text', { array: true, default: '{}' })
  repos!: string[];

  @Column('timestamptz', { default: () => 'now()' })
  created_at!: Date;
}
