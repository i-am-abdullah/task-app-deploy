import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const useSSL = (process.env.DATABASE_SSL || 'true').toLowerCase() === 'true';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: useSSL ? { rejectUnauthorized: true } : false,
  extra: useSSL ? { ssl: { rejectUnauthorized: true } } : undefined,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;