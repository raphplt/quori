import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [path.join(__dirname, '**/*.entity.{js,ts}')],
  migrations: [path.join(__dirname, 'migrations/*.{js,ts}')],
});

export default dataSource;
