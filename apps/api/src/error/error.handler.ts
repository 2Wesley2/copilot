import type { ErrorFactory } from './error.factory.js';

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

export class OkResult<T, E extends Error> implements ResultContract<T, E> {
  public constructor(readonly value: T) {}

  public isOk(): boolean {
    return true;
  }

  public isErr(): boolean {
    return false;
  }

  public map<U>(fn: (value: T) => U): ResultContract<U, E> {
    return createOkResult<U, E>(fn(this.value));
  }

  public andThen<U>(fn: (value: T) => ResultContract<U, E>): ResultContract<U, E> {
    return fn(this.value);
  }

  public mapErr<F extends Error>(_: (error: E) => F): ResultContract<T, F> {
    return createOkResult<T, F>(this.value);
  }

  public match<R>(onOk: (value: T) => R, _: (error: E) => R): R {
    return onOk(this.value);
  }
}
const createOkResult = <T, E extends Error>(value: T) => new OkResult<T, E>(value);

export class ErrResult<T, E extends Error> implements ResultContract<T, E> {
  public constructor(readonly error: E) {}

  public isOk(): boolean {
    return false;
  }

  public isErr(): boolean {
    return true;
  }

  public map<U>(_: (value: T) => U): ResultContract<U, E> {
    return createErrResult<U, E>(this.error);
  }

  public andThen<U>(_: (value: T) => ResultContract<U, E>): ResultContract<U, E> {
    return createErrResult<U, E>(this.error);
  }

  public mapErr<F extends Error>(fn: (error: E) => F): ResultContract<T, F> {
    return createErrResult<T, F>(fn(this.error));
  }

  public match<R>(_: (value: T) => R, onErr: (error: E) => R): R {
    return onErr(this.error);
  }
}

const createErrResult = <T, E extends Error>(error: E) => new ErrResult<T, E>(error);

export class AsyncResultImpl<T, E extends Error> implements AsyncResultContract<T, E> {
  constructor(private readonly operation: Promise<ResultContract<T, E>>) {}

  public map<U>(fn: (value: T) => U): AsyncResultContract<U, E> {
    const nextOperation: Promise<ResultContract<U, E>> = this.operation.then((result) =>
      result.map(fn),
    );

    return createAsyncResultImpl<U, E>(nextOperation);
  }

  public andThen<U>(fn: (value: T) => AsyncResultContract<U, E>): AsyncResultContract<U, E> {
    const nextOperation: Promise<ResultContract<U, E>> = this.operation.then((result) =>
      result.match<Promise<ResultContract<U, E>>>(
        (value) => fn(value).toPromise(),
        (error) => Promise.resolve(createErrResult<U, E>(error)),
      ),
    );

    return createAsyncResultImpl<U, E>(nextOperation);
  }

  public mapErr<F extends Error>(fn: (error: E) => F): AsyncResultContract<T, F> {
    const nextOperation: Promise<ResultContract<T, F>> = this.operation.then((result) =>
      result.mapErr(fn),
    );

    return createAsyncResultImpl<T, F>(nextOperation);
  }

  public async match<R>(
    onOk: (value: T) => R | Promise<R>,
    onErr: (error: E) => R | Promise<R>,
  ): Promise<R> {
    return this.operation.then((result) => result.match(onOk, onErr));
  }

  public toPromise(): Promise<ResultContract<T, E>> {
    return this.operation;
  }
}

const createAsyncResultImpl = <T, E extends Error>(operation: Promise<ResultContract<T, E>>) =>
  new AsyncResultImpl<T, E>(operation);

export class DefaultErrorHandler implements ErrorHandlerContract {
  constructor(private readonly errorFactory: ErrorFactory) {}

  public normalize(value: unknown): Error {
    if (value instanceof Error) {
      return value;
    }

    if (typeof value === 'string') {
      return this.errorFactory(value);
    }

    try {
      const serialized = JSON.stringify(value);

      return this.errorFactory(serialized || String(value));
    } catch {
      return this.errorFactory(String(value));
    }
  }

  public ok<T>(value: T): ResultContract<T, Error> {
    return createOkResult<T, Error>(value);
  }

  public err<T, E extends Error>(error: E): ResultContract<T, E> {
    return createErrResult<T, E>(error);
  }

  public okAsync<T>(value: T): AsyncResultContract<T, Error> {
    return createAsyncResultImpl<T, Error>(Promise.resolve(createOkResult<T, Error>(value)));
  }

  public errAsync<T, E extends Error>(error: E): AsyncResultContract<T, E> {
    return createAsyncResultImpl<T, E>(Promise.resolve(createErrResult<T, E>(error)));
  }

  public fromPromise<T>(fn: () => Promise<T>): AsyncResultContract<T, Error> {
    const operation: Promise<ResultContract<T, Error>> = Promise.resolve()
      .then(fn)
      .then<ResultContract<T, Error>>((value) => createOkResult<T, Error>(value))
      .catch<ResultContract<T, Error>>((cause: unknown) => {
        return createErrResult<T, Error>(this.normalize(cause));
      });

    return createAsyncResultImpl<T, Error>(operation);
  }

  public fromResult<T, E extends Error>(result: ResultContract<T, E>): AsyncResultContract<T, E> {
    return createAsyncResultImpl<T, E>(Promise.resolve(result));
  }
}

export const createDefaultErrorHandler = (errorFactory: ErrorFactory) =>
  new DefaultErrorHandler(errorFactory);
