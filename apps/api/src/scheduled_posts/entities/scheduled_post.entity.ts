import { PrimaryGeneratedColumn, Column } from 'typeorm';

export class ScheduledPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;
}
