export type DbMode = 'inmemory' | 'local' | 'atlas';
export type RuntimePurpose = 'application' | 'seed';
export type RuntimeEnv = Record<string, string | undefined>;
