declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'test' | 'production';
      readonly DB_MODE?: 'inmemory' | 'local' | 'atlas';
      readonly DATABASE_URL?: string;
      readonly MONGODB_URL?: string;
      readonly ENV_PATH?: string;
      readonly DATABASE_TECHNOLOGY?: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
      readonly DATABASE_MAPPING_STYLE?: 'odm' | 'orm';
    }
  }
}
