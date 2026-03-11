export interface ResultContract<T, E extends Error> {
  isOk(): boolean;
  isErr(): boolean;
  map<U>(fn: (value: T) => U): ResultContract<U, E>;
  andThen<U>(fn: (value: T) => ResultContract<U, E>): ResultContract<U, E>;
  mapErr<F extends Error>(fn: (error: E) => F): ResultContract<T, F>;
  match<R>(onOk: (value: T) => R, onErr: (error: E) => R): R;
}

export interface AsyncResultContract<T, E extends Error> {
  map<U>(fn: (value: T) => U): AsyncResultContract<U, E>;
  andThen<U>(fn: (value: T) => AsyncResultContract<U, E>): AsyncResultContract<U, E>;
  mapErr<F extends Error>(fn: (error: E) => F): AsyncResultContract<T, F>;
  match<R>(onOk: (value: T) => R | Promise<R>, onErr: (error: E) => R | Promise<R>): Promise<R>;
  toPromise(): Promise<ResultContract<T, E>>;
}

export interface ErrorHandlerContract {
  normalize(value: unknown): Error;
  ok<T>(value: T): ResultContract<T, Error>;
  err<T, E extends Error>(error: E): ResultContract<T, E>;
  okAsync<T>(value: T): AsyncResultContract<T, Error>;
  errAsync<T, E extends Error>(error: E): AsyncResultContract<T, E>;
  fromPromise<T>(fn: () => Promise<T>): AsyncResultContract<T, Error>;
  fromResult<T, E extends Error>(result: ResultContract<T, E>): AsyncResultContract<T, E>;
}

export type Result<T, E extends Error> = ResultContract<T, E>;
export type AsyncResult<T, E extends Error> = AsyncResultContract<T, E>;
